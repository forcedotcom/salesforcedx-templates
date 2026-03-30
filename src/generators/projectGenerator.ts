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
} from '../utils/uiBundleTemplateUtils';
import { BaseGenerator } from './baseGenerator';

const VALID_PROJECT_TEMPLATES = [
  'standard',
  'empty',
  'analytics',
  'reactinternalapp',
  'reactexternalapp',
  'agent',
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
const agentFilesToCopy = [
  '.forceignore',
  GITIGNORE,
  '.prettierignore',
  '.prettierrc',
  'package.json',
];
const emptyfolderarray = ['aura', 'lwc'];

const analyticsfolderarray = ['aura', 'classes', 'lwc', 'waveTemplates'];
const analyticsVscodeExt = 'salesforce.analyticsdx-vscode';

const agentfolderarray = [
  'aiAuthoringBundles',
  'bots',
  'classes',
  'flows',
  'genAiPlannerBundles',
  'genAiPromptTemplates',
  'permissionsetgroups',
  'permissionsets',
];

const agentMetadataMap: Array<{ src: string; destDir: string }> = [
  {
    src: 'aab/Local_Info_Agent.bundle-meta.xml',
    destDir: 'aiAuthoringBundles/Local_Info_Agent',
  },
  {
    src: 'aab/Local_Info_Agent.agent',
    destDir: 'aiAuthoringBundles/Local_Info_Agent',
  },
  { src: 'apex/CheckWeather.cls', destDir: 'classes' },
  { src: 'apex/CheckWeather.cls-meta.xml', destDir: 'classes' },
  { src: 'apex/CurrentDate.cls', destDir: 'classes' },
  { src: 'apex/CurrentDate.cls-meta.xml', destDir: 'classes' },
  { src: 'apex/CurrentDateTest.cls', destDir: 'classes' },
  { src: 'apex/CurrentDateTest.cls-meta.xml', destDir: 'classes' },
  { src: 'apex/WeatherService.cls', destDir: 'classes' },
  { src: 'apex/WeatherService.cls-meta.xml', destDir: 'classes' },
  { src: 'apex/WeatherServiceTest.cls', destDir: 'classes' },
  { src: 'apex/WeatherServiceTest.cls-meta.xml', destDir: 'classes' },
  { src: 'flow/Get_Resort_Hours.flow-meta.xml', destDir: 'flows' },
  {
    src: 'gapt/Get_Event_Info.genAiPromptTemplate-meta.xml',
    destDir: 'genAiPromptTemplates',
  },
  { src: 'ps/Resort_Agent.permissionset-meta.xml', destDir: 'permissionsets' },
  { src: 'ps/Resort_Admin.permissionset-meta.xml', destDir: 'permissionsets' },
  {
    src: 'psg/AFDX_Agent_Perms.permissionsetgroup-meta.xml',
    destDir: 'permissionsetgroups',
  },
  {
    src: 'psg/AFDX_User_Perms.permissionsetgroup-meta.xml',
    destDir: 'permissionsetgroups',
  },
];

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
   * Used so reactinternalapp/reactexternalapp can omit shared files and fall back to standard.
   */
  private templatePathWithFallback(primary: string, fallback: string): string {
    const primaryPath = this.templatePath(primary);
    return this._fs.existsSync(primaryPath)
      ? primaryPath
      : this.templatePath(fallback);
  }

  /**
   * Returns the appropriate template path based on whether TypeScript is enabled.
   * TypeScript-specific templates are organized in a typescript/ subdirectory.
   * Only files that have TypeScript-specific variants are looked up there.
   */
  private getTemplatePath(
    file: string,
    isTypeScript: boolean
  ): string {
    // Files that have TypeScript-specific variants
    const tsSpecificFiles = [
      'package.json',
      '.forceignore',
      GITIGNORE,
      'project.eslint.config.js',
      'settings.json'
    ];

    const hasTypescriptVariant = tsSpecificFiles.includes(file);
    const subdir = isTypeScript && hasTypescriptVariant ? 'typescript' : '';

    return this.templatePath(subdir, file);
  }

  /**
   * Generates TypeScript configuration file if TypeScript is enabled.
   */
  private async generateTypeScriptConfig(
    isTypeScript: boolean,
    projectname: string,
    defaultpackagedir: string
  ): Promise<void> {
    if (isTypeScript) {
      await this.render(
        this.templatePath('tsconfig.json'),
        this.destinationPath(
          path.join(this.outputdir, projectname, 'tsconfig.json')
        ),
        { defaultpackagedir }
      );
    }
  }

  /**
   * Generates ESLint configuration file with appropriate template for JS or TS.
   */
  private async generateEslintConfig(
    isTypeScript: boolean,
    projectname: string
  ): Promise<void> {
    await this.render(
      this.getTemplatePath('project.eslint.config.js', isTypeScript),
      this.destinationPath(
        path.join(this.outputdir, projectname, 'eslint.config.js')
      ),
      {}
    );
  }

  /**
   * Generates VSCode settings with TypeScript-specific configuration if needed.
   */
  private async generateVSCodeSettings(
    isTypeScript: boolean,
    projectname: string
  ): Promise<void> {
    for (const file of vscodearray) {
      const templateFile = `${file}.json`;

      // Use TypeScript directory for settings file when TypeScript is enabled
      const templatePath = isTypeScript && file === 'settings'
        ? this.getTemplatePath(templateFile, true)
        : this.templatePath(templateFile);

      await this.render(
        templatePath,
        this.destinationPath(
          path.join(this.outputdir, projectname, '.vscode', `${file}.json`)
        ),
        {}
      );
    }
  }

  /**
   * Copies project root level files with TypeScript-specific variants when applicable.
   */
  private async copyProjectFiles(
    isTypeScript: boolean,
    projectname: string
  ): Promise<void> {
    for (const file of filestocopy) {
      const out = file === GITIGNORE ? `.${file}` : file;

      await this.render(
        this.getTemplatePath(file, isTypeScript),
        this.destinationPath(path.join(this.outputdir, projectname, out)),
        {}
      );
    }
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

    // Validate lwcLanguage if provided
    if (
      this.options.lwcLanguage &&
      !['javascript', 'typescript'].includes(this.options.lwcLanguage)
    ) {
      throw new Error(
        `Invalid lwcLanguage value: '${this.options.lwcLanguage}'. Must be 'javascript' or 'typescript'.`
      );
    }
  }

  public async generate(): Promise<void> {
    // Re-apply source root so customTemplatesRootPath (set in run()) is used when provided
    this.sourceRootWithPartialPath('project');

    const {
      projectname,
      template,
      defaultpackagedir,
      manifest,
      ns,
      loginurl,
      lwcLanguage,
    } = this.options;
    const isTypeScript = lwcLanguage === 'typescript';
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
        lwcLanguage,
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
      await this.generateVSCodeSettings(isTypeScript, projectname);

      // ESLint config
      await this.generateEslintConfig(isTypeScript, projectname);

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
      await this.copyProjectFiles(isTypeScript, projectname);

      // Generate TypeScript configuration files if TypeScript is selected
      await this.generateTypeScriptConfig(isTypeScript, projectname, defaultpackagedir);
    }

    if (template === 'empty') {
      await this.makeEmptyFolders(folderlayout, emptyfolderarray);

      // For TypeScript projects, generate full toolchain
      if (isTypeScript) {
        // Add Husky directory and hooks
        this._createHuskyConfig(path.join(this.outputdir, projectname));

        // VSCode config files
        await this.generateVSCodeSettings(isTypeScript, projectname);

        // ESLint config
        await this.generateEslintConfig(isTypeScript, projectname);

        // Copy project root level files (includes package.json, .gitignore, etc.)
        await this.copyProjectFiles(isTypeScript, projectname);

        // Generate TypeScript configuration
        await this.generateTypeScriptConfig(isTypeScript, projectname, defaultpackagedir);
      } else {
        // For JavaScript projects, just copy .forceignore
        await this.render(
          this.templatePath('.forceignore'),
          this.destinationPath(
            path.join(this.outputdir, projectname, '.forceignore')
          ),
          {}
        );
      }
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
      await this.generateVSCodeSettings(isTypeScript, projectname);

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

      // ESLint config
      await this.generateEslintConfig(isTypeScript, projectname);

      // Copy project root level files
      await this.copyProjectFiles(isTypeScript, projectname);

      // Generate TypeScript configuration files if TypeScript is selected
      await this.generateTypeScriptConfig(isTypeScript, projectname, defaultpackagedir);
    }

    if (template === 'agent') {
      await this.makeEmptyFolders(folderlayout, agentfolderarray);

      for (const file of vscodearray) {
        await this.render(
          this.templatePath(`${file}.json`),
          this.destinationPath(
            path.join(this.outputdir, projectname, '.vscode', `${file}.json`)
          ),
          {}
        );
      }

      for (const file of agentFilesToCopy) {
        const out = file === GITIGNORE ? `.${file}` : file;
        await this.render(
          this.templatePathWithFallback(path.join(template, file), file),
          this.destinationPath(path.join(this.outputdir, projectname, out)),
          {}
        );
      }

      for (const { src, destDir } of agentMetadataMap) {
        const fileName = path.basename(src);
        await this.render(
          this.templatePath(path.join('agent', 'md', src)),
          this.destinationPath(path.join(...folderlayout, destDir, fileName)),
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
