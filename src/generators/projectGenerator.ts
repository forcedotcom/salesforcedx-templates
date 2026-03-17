/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { CreateUtil } from '../utils';
import { GeneratorContext, ProjectOptions } from '../utils/types';
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
  'reactb2e',
  'reactb2x',
  'nativemobile',
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

export default class ProjectGenerator extends BaseGenerator<ProjectOptions> {
  constructor(
    options: ProjectOptions,
    context?: GeneratorContext,
    cwd?: string
  ) {
    super(options, context, cwd);
    this.sourceRootWithPartialPath('project');
  }

  private async extendJSON(
    filepath: string,
    replacer?: (this: any, key: string, value: any) => any
  ) {
    const originalContent = JSON.parse(
      await this._fs.promises.readFile(filepath, 'utf8').catch(() => '{}')
    );

    const newContent = JSON.stringify(originalContent, replacer, 2);
    await this._fs.promises.writeFile(filepath, newContent);
  }

  /**
   * Returns template path for primary; if it doesn't exist, returns fallback path.
   * Used so reactb2e/reactb2x can omit shared files and fall back to standard.
   */
  private templatePathWithFallback(primary: string, fallback: string): string {
    const primaryPath = this.templatePath(primary);
    return this._fs.existsSync(primaryPath)
      ? primaryPath
      : this.templatePath(fallback);
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.template);
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
      { projectname }
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
      await this.makeEmptyFolders(folderlayout, standardfolderarray);

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
      await this.makeEmptyFolders(folderlayout, emptyfolderarray);
      await this.render(
        this.templatePath('.forceignore'),
        this.destinationPath(
          path.join(this.outputdir, projectname, '.forceignore')
        ),
        {}
      );
    }

    if (template === 'nativemobile') {
      await this.makeEmptyFolders(folderlayout, emptyfolderarray);
      await this.render(
        this.templatePath('.forceignore'),
        this.destinationPath(
          path.join(this.outputdir, projectname, '.forceignore')
        ),
        {}
      );

      // Derive a camelCase app name from the project name for CAMA metadata
      const appName =
        projectname.charAt(0).toLowerCase() +
        projectname.slice(1).replace(/[^a-zA-Z0-9]/g, '');
      // Human-readable label: insert spaces before uppercase runs
      const appLabel = projectname
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]/g, ' ')
        .trim();

      const camaData = { appName, appLabel, projectname };
      const ecBase = path.join(
        ...folderlayout,
        'digitalExperiences',
        'experiencecontainer',
        appName
      );

      // DigitalExperienceBundle meta XML
      await this.render(
        this.templatePath('nativemobile/digitalExperience-meta.xml'),
        this.destinationPath(
          path.join(ecBase, `${appName}.digitalExperience-meta.xml`)
        ),
        camaData
      );

      // EC Definition
      await this.render(
        this.templatePath('nativemobile/ecDefinition-meta.json'),
        this.destinationPath(
          path.join(
            ecBase,
            'experience__camaECDefinition',
            appName,
            '_meta.json'
          )
        ),
        camaData
      );
      await this.render(
        this.templatePath('nativemobile/ecDefinition-content.json'),
        this.destinationPath(
          path.join(
            ecBase,
            'experience__camaECDefinition',
            appName,
            'content.json'
          )
        ),
        camaData
      );

      // App Metadata
      await this.render(
        this.templatePath('nativemobile/appMetadata-meta.json'),
        this.destinationPath(
          path.join(
            ecBase,
            'experience__camaAppMetadata',
            'appMetadata',
            '_meta.json'
          )
        ),
        camaData
      );
      await this.render(
        this.templatePath('nativemobile/appMetadata-content.json'),
        this.destinationPath(
          path.join(
            ecBase,
            'experience__camaAppMetadata',
            'appMetadata',
            'content.json'
          )
        ),
        camaData
      );

      // Build Metadata
      await this.render(
        this.templatePath('nativemobile/buildMetadata-meta.json'),
        this.destinationPath(
          path.join(
            ecBase,
            'experience__camaBuildMetadata',
            'buildMetadata',
            '_meta.json'
          )
        ),
        camaData
      );
      await this.render(
        this.templatePath('nativemobile/buildMetadata-content.json'),
        this.destinationPath(
          path.join(
            ecBase,
            'experience__camaBuildMetadata',
            'buildMetadata',
            'content.json'
          )
        ),
        camaData
      );

      // Home Screen
      await this.render(
        this.templatePath('nativemobile/homeScreen-meta.json'),
        this.destinationPath(
          path.join(
            ecBase,
            'experience__camaScreen',
            'homeScreen',
            '_meta.json'
          )
        ),
        camaData
      );
      await this.render(
        this.templatePath('nativemobile/homeScreen-content.json'),
        this.destinationPath(
          path.join(
            ecBase,
            'experience__camaScreen',
            'homeScreen',
            'content.json'
          )
        ),
        camaData
      );
    }

    if (template === 'analytics') {
      await this.makeEmptyFolders(folderlayout, analyticsfolderarray);

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
      await this.extendJSON(
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
    if (!this._fs.existsSync(huskyDirPath)) {
      this._fs.mkdirSync(huskyDirPath);
    }
    for (const file of huskyhookarray) {
      await this.render(
        this.templatePath(path.join(HUSKY_FOLDER, file)),
        this.destinationPath(path.join(huskyDirPath, file)),
        {}
      );
    }
  }

  private async makeEmptyFolders(
    toplevelfolders: string[],
    metadatafolders: string[]
  ) {
    for (const folder of metadatafolders) {
      await this._fs.promises.mkdir(path.join(...toplevelfolders, folder), {
        recursive: true,
      });
    }
  }
}
