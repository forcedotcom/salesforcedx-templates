/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'path';
import { CreateUtil } from '../utils';
import { ProjectOptions } from '../utils/types';
import {
  BUILT_IN_FULL_TEMPLATES,
  generateBuiltInFullTemplate,
  renderEjsFile,
} from '../utils/webappTemplateUtils';
import { BaseGenerator } from './baseGenerator';

const VALID_PROJECT_TEMPLATES = [
  'standard',
  'empty',
  'analytics',
  'react-b2e',
  'react-b2x',
] as const;

const GITIGNORE = 'gitignore';
const HUSKY_FOLDER = '.husky';
const huskyhookarray = ['pre-commit'];
const vscodearray = ['extensions', 'launch', 'settings'];
const standardfolderarray = [
  'applications',
  'aura',
  'classes',
  'contentassets',
  'flexipages',
  'layouts',
  'lwc',
  'objects',
  'permissionsets',
  'staticresources',
  'tabs',
  'triggers',
];
const filestocopy = [
  '.forceignore',
  GITIGNORE,
  '.prettierignore',
  '.prettierrc',
  'jest.config.js',
  'package.json',
];
const emptyfolderarray = ['aura', 'lwc'];

const analyticsfolderarray = ['aura', 'classes', 'lwc', 'waveTemplates'];
const analyticsVscodeExt = 'salesforce.analyticsdx-vscode';

async function extendJSON(
  filepath: string,
  replacer?: (this: any, key: string, value: any) => any
) {
  const originalContent = JSON.parse(
    await readFile(filepath, 'utf8').catch(() => '{}')
  );

  const newContent = JSON.stringify(originalContent, replacer, 2);
  await writeFile(filepath, newContent);
}

export default class ProjectGenerator extends BaseGenerator<ProjectOptions> {
  constructor(options: ProjectOptions) {
    super(options);
    this.sourceRootWithPartialPath('project');
  }

  /**
   * Returns template path for primary; if it doesn't exist, returns fallback path.
   * Used so react-b2e/react-b2x can omit shared files and fall back to standard.
   */
  private templatePathWithFallback(primary: string, fallback: string): string {
    const primaryPath = this.templatePath(primary);
    return fs.existsSync(primaryPath)
      ? primaryPath
      : this.templatePath(fallback);
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.projectname);
    if (
      !VALID_PROJECT_TEMPLATES.includes(
        this.options.template as (typeof VALID_PROJECT_TEMPLATES)[number]
      )
    ) {
      throw new Error(
        `Invalid project template: ${
          this.options.template
        }. Valid options: ${VALID_PROJECT_TEMPLATES.join(', ')}`
      );
    }
  }

  public async generate(): Promise<void> {
    // Re-apply source root so customTemplatesRootPath (set in run()) is used when provided
    this.sourceRootWithPartialPath('project');

    const { projectname, template, defaultpackagedir, manifest, ns, loginurl } =
      this.options;
    const folderlayout = [
      this.outputdir,
      projectname,
      defaultpackagedir,
      'main',
      'default',
    ];

    const scratchDefFile = `${template}/ScratchDef.json`;
    const manifestFile = `${template}/Manifest.xml`;
    const soqlQueryFile = 'account.soql';
    const anonApexFile = 'hello.apex';

    await this.render(
      this.templatePathWithFallback(scratchDefFile, 'standard/ScratchDef.json'),
      this.destinationPath(
        path.join(
          this.outputdir,
          projectname,
          'config',
          'project-scratch-def.json'
        )
      ),
      { company: (process.env.USER || 'Demo') + ' company' }
    );
    await this.render(
      this.templatePathWithFallback(
        `${template}/README.md`,
        'standard/README.md'
      ),
      this.destinationPath(path.join(this.outputdir, projectname, 'README.md')),
      {}
    );
    await this.render(
      this.templatePath('sfdx-project.json'),
      this.destinationPath(
        path.join(this.outputdir, projectname, 'sfdx-project.json')
      ),
      {
        defaultpackagedir,
        namespace: ns,
        loginurl,
        apiversion: this.apiversion,
        name: projectname,
      }
    );

    if (manifest === true) {
      await this.render(
        this.templatePathWithFallback(manifestFile, 'standard/Manifest.xml'),
        this.destinationPath(
          path.join(this.outputdir, projectname, 'manifest', 'package.xml')
        ),
        { apiversion: this.apiversion }
      );
    }

    if (template === 'standard') {
      await makeEmptyFolders(folderlayout, standardfolderarray);

      // Add Husky directory and hooks
      this._createHuskyConfig(path.join(this.outputdir, projectname));

      // VSCode config files
      for (const file of vscodearray) {
        await this.render(
          this.templatePath(`${file}.json`),
          this.destinationPath(
            path.join(this.outputdir, projectname, '.vscode', `${file}.json`)
          ),
          {}
        );
      }

      // ESLint config (file is renamed to avoid conflict with generator project)
      await this.render(
        this.templatePath('project.eslint.config.js'),
        this.destinationPath(
          path.join(this.outputdir, projectname, 'eslint.config.js')
        ),
        {}
      );

      // SOQL sample file
      await this.render(
        this.templatePath(path.join(template, soqlQueryFile)),
        this.destinationPath(
          path.join(
            this.outputdir,
            projectname,
            'scripts',
            'soql',
            soqlQueryFile
          )
        ),
        {}
      );

      // Apex sample script
      await this.render(
        this.templatePath(path.join(template, anonApexFile)),
        this.destinationPath(
          path.join(
            this.outputdir,
            projectname,
            'scripts',
            'apex',
            anonApexFile
          )
        ),
        {}
      );

      // Copy project root level files
      for (const file of filestocopy) {
        const out = file === GITIGNORE ? `.${file}` : file;
        await this.render(
          this.templatePath(file),
          this.destinationPath(path.join(this.outputdir, projectname, out)),
          {}
        );
      }
    }

    if (template === 'empty') {
      await makeEmptyFolders(folderlayout, emptyfolderarray);
      await this.render(
        this.templatePath('.forceignore'),
        this.destinationPath(
          path.join(this.outputdir, projectname, '.forceignore')
        ),
        {}
      );
    }

    if (template === 'analytics') {
      await makeEmptyFolders(folderlayout, analyticsfolderarray);

      // Add Husky directory and hooks
      this._createHuskyConfig(path.join(this.outputdir, projectname));

      // VSCode config files
      for (const file of vscodearray) {
        await this.render(
          this.templatePath(`${file}.json`),
          this.destinationPath(
            path.join(this.outputdir, projectname, '.vscode', `${file}.json`)
          ),
          {}
        );
      }

      // add the analytics vscode extension to the recommendations
      await extendJSON(
        path.join(this.outputdir, projectname, '.vscode', 'extensions.json'),
        (key: string, value: unknown) => {
          if (
            key === 'recommendations' &&
            Array.isArray(value) &&
            !value.some((n) => n === analyticsVscodeExt)
          ) {
            value.push(analyticsVscodeExt);
          }
          return value;
        }
      );

      // ESLint config (file is renamed to avoid conflict with generator project)
      await this.render(
        this.templatePath('project.eslint.config.js'),
        this.destinationPath(
          path.join(this.outputdir, projectname, 'eslint.config.js')
        ),
        {}
      );

      // Copy project root level files
      for (const file of filestocopy) {
        const out = file === GITIGNORE ? `.${file}` : file;
        await this.render(
          this.templatePath(file),
          this.destinationPath(path.join(this.outputdir, projectname, out)),
          {}
        );
      }
    }

    if (BUILT_IN_FULL_TEMPLATES.has(template)) {
      await generateBuiltInFullTemplate(template, projectname, {
        templateDir: this.templatePath(template),
        projectDir: path.join(this.outputdir, projectname),
        defaultpackagedir,
        ns,
        loginurl,
        apiversion: this.apiversion,
        renderEjs: renderEjsFile,
        onFileCreated: (destPath) => this.registerChange(destPath),
      });
    }
  }

  private registerChange(destPath: string): void {
    const relativePath = path.relative(process.cwd(), destPath);
    this.changes.created.push(relativePath);
  }

  private async _createHuskyConfig(projectRootDir: string) {
    const huskyDirPath = path.join(projectRootDir, HUSKY_FOLDER);
    if (!fs.existsSync(huskyDirPath)) {
      fs.mkdirSync(huskyDirPath);
    }
    for (const file of huskyhookarray) {
      await this.render(
        this.templatePath(path.join(HUSKY_FOLDER, file)),
        this.destinationPath(path.join(huskyDirPath, file)),
        {}
      );
    }
  }
}

async function makeEmptyFolders(
  toplevelfolders: string[],
  metadatafolders: string[]
) {
  for (const folder of metadatafolders) {
    await mkdir(path.join(...toplevelfolders, folder), { recursive: true });
  }
}
