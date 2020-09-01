/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { CreateUtil } from '../utils';
import { ProjectOptions } from '../utils/types';
import { SfdxGenerator } from './sfdxGenerator';

const GITIGNORE = 'gitignore';
const vscodearray = ['extensions', 'launch', 'settings'];
const standardfolderarray = [
  'applications',
  'aura',
  'classes',
  'contentassets',
  'flexipages',
  'layouts',
  'objects',
  'permissionsets',
  'staticresources',
  'tabs',
  'triggers'
];
const filestocopy = [
  '.eslintignore',
  '.forceignore',
  GITIGNORE,
  '.prettierignore',
  '.prettierrc',
  'package.json'
];
const emptyfolderarray = ['aura', 'lwc'];

const analyticsfolderarray = ['waveTemplates'];

export default class ProjectGenerator extends SfdxGenerator<ProjectOptions> {
  constructor(args: string | string[], options: ProjectOptions) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'project'));
  }

  public validateOptions() {
    CreateUtil.checkInputs(this.options.template);
  }

  public writing() {
    const {
      outputdir,
      projectname,
      template,
      defaultpackagedir,
      manifest,
      ns,
      apiversion,
      loginurl
    } = this.options;
    const folderlayout = [
      outputdir,
      projectname,
      defaultpackagedir,
      'main',
      'default'
    ];

    const scratchDefFile = `${template}/ScratchDef.json`;
    const manifestFile = `${template}/Manifest.xml`;
    const soqlQueryFile = 'account.soql';
    const anonApexFile = 'hello.apex';

    this.fs.copyTpl(
      this.templatePath(scratchDefFile),
      this.destinationPath(
        path.join(outputdir, projectname, 'config', 'project-scratch-def.json')
      ),
      { company: (process.env.USER || 'Demo') + ' company' }
    );
    this.fs.copyTpl(
      this.templatePath(`${template}/README.md`),
      this.destinationPath(path.join(outputdir, projectname, 'README.md')),
      {}
    );
    this.fs.copyTpl(
      this.templatePath('sfdx-project.json'),
      this.destinationPath(
        path.join(outputdir, projectname, 'sfdx-project.json')
      ),
      {
        defaultpackagedir,
        namespace: ns,
        loginurl,
        apiversion
      }
    );

    // tslint:disable-next-line:no-unused-expression
    if (manifest === true) {
      this.fs.copyTpl(
        this.templatePath(manifestFile),
        this.destinationPath(
          path.join(outputdir, projectname, 'manifest', 'package.xml')
        ),
        { apiversion }
      );
    }

    // tslint:disable-next-line:no-unused-expression
    if (template === 'standard') {
      makeEmptyFolders(folderlayout, standardfolderarray);
      for (const file of vscodearray) {
        this.fs.copyTpl(
          this.templatePath(`${file}.json`),
          this.destinationPath(
            path.join(outputdir, projectname, '.vscode', `${file}.json`)
          ),
          {}
        );
      }
      this.fs.copyTpl(
        this.templatePath('lwc.eslintrc.json'),
        this.destinationPath(
          path.join(
            outputdir,
            projectname,
            defaultpackagedir,
            'main',
            'default',
            'lwc',
            '.eslintrc.json'
          )
        ),
        {}
      );
      this.fs.copyTpl(
        this.templatePath('aura.eslintrc.json'),
        this.destinationPath(
          path.join(
            outputdir,
            projectname,
            defaultpackagedir,
            'main',
            'default',
            'aura',
            '.eslintrc.json'
          )
        ),
        {}
      );
      this.fs.copyTpl(
        this.templatePath(path.join(template, soqlQueryFile)),
        this.destinationPath(
          path.join(outputdir, projectname, 'scripts', 'soql', soqlQueryFile)
        ),
        {}
      );
      this.fs.copyTpl(
        this.templatePath(path.join(template, anonApexFile)),
        this.destinationPath(
          path.join(outputdir, projectname, 'scripts', 'apex', anonApexFile)
        ),
        {}
      );
      for (const file of filestocopy) {
        const out = file === GITIGNORE ? `.${file}` : file;
        this.fs.copyTpl(
          this.templatePath(file),
          this.destinationPath(path.join(outputdir, projectname, out)),
          {}
        );
      }
    }

    // tslint:disable-next-line:no-unused-expression
    if (template === 'empty') {
      makeEmptyFolders(folderlayout, emptyfolderarray);
      this.fs.copyTpl(
        this.templatePath('.forceignore'),
        this.destinationPath(path.join(outputdir, projectname, '.forceignore')),
        {}
      );
    }

    // tslint:disable-next-line:no-unused-expression
    if (template === 'analytics') {
      makeEmptyFolders(folderlayout, analyticsfolderarray);
      for (const file of vscodearray) {
        this.fs.copyTpl(
          this.templatePath(`${file}.json`),
          this.destinationPath(
            path.join(outputdir, projectname, '.vscode', `${file}.json`)
          ),
          {}
        );
      }
      for (const file of filestocopy) {
        const out = file === GITIGNORE ? `.${file}` : file;
        this.fs.copyTpl(
          this.templatePath(file),
          this.destinationPath(path.join(outputdir, projectname, out)),
          {}
        );
      }
    }

    // tslint:disable-next-line:no-unused-expression
    if (template === 'functions') {
      const functionsFolderlayout = [
        outputdir,
        projectname,
        'functions'
      ];
      makeEmptyFolders(functionsFolderlayout, []);
      makeEmptyFolders(folderlayout, emptyfolderarray);
      this.fs.copyTpl(
        this.templatePath('.forceignore'),
        this.destinationPath(path.join(outputdir, projectname, '.forceignore')),
        {}
      );
    }
  }
}

function makeEmptyFolders(
  toplevelfolders: string[],
  metadatafolders: string[]
) {
  let oldfolder = '';
  for (const folder of toplevelfolders) {
    if (!fs.existsSync(path.join(oldfolder, folder))) {
      fs.mkdirSync(path.join(oldfolder, folder));
    }
    oldfolder = path.join(oldfolder, folder);
  }
  for (const newfolder of metadatafolders) {
    if (!fs.existsSync(path.join(oldfolder, newfolder))) {
      fs.mkdirSync(path.join(oldfolder, newfolder));
    }
  }
}
