/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { OptionsMap } from '../utils/types';
// tslint:disable-next-line: no-var-requires
const generator = require('yeoman-generator');

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
  '.forceignore',
  'gitignore',
  '.prettierignore',
  '.prettierrc'
];
const emptyfolderarray = ['aura', 'lwc'];

const analyticsfolderarray = ['waveTemplates'];

export default class ProjectGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'project'));
    this.conflicter.force = false;
  }
  public writing() {
    const {
      outputdir,
      projectname,
      template,
      defaultpackagedir,
      manifest,
      ns,
      sourceApiVersion,
      loginURL
    } = this.options;
    const folderlayout = [
      outputdir,
      projectname,
      defaultpackagedir,
      'main',
      'default'
    ];

    let scratchDefFile = `${template}/ScratchDef.json`;
    let manifestFile = `${template}/Manifest.xml`;

    this.fs.copyTpl(
      this.templatePath(scratchDefFile),
      this.destinationPath(
        path.join(outputdir, projectname, 'config', 'project-scratch-def.json')
      ),
      { company: (process.env.USER || 'Demo') + ' company' }
    );
    this.fs.copyTpl(
      this.templatePath(`${template}/README.md`),
      this.destinationPath(path.join(outputdir, projectname, 'README.md'))
    );
    this.fs.copyTpl(
      this.templatePath('sfdx-project.json'),
      this.destinationPath(
        path.join(outputdir, projectname, 'sfdx-project.json')
      ),
      {
        defaultpackagedir,
        namespace: ns,
        loginURL,
        sourceApiVersion
      }
    );

    // tslint:disable-next-line:no-unused-expression
    if (manifest === true) {
      this.fs.copyTpl(
        this.templatePath(manifestFile),
        this.destinationPath(
          path.join(outputdir, projectname, 'manifest', 'package.xml')
        ),
        { sourceApiVersion }
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
          )
        );
      }
      this.fs.copyTpl(
        this.templatePath('.eslintrc.json'),
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
        )
      );
      for (const file of filestocopy) {
        const out = file === GITIGNORE ? `.${file}` : file;
        this.fs.copyTpl(
          this.templatePath(file),
          this.destinationPath(path.join(outputdir, projectname, out))
        );
      }
    }

    // tslint:disable-next-line:no-unused-expression
    if (template === 'empty') {
      makeEmptyFolders(folderlayout, emptyfolderarray);
      this.fs.copyTpl(
        this.templatePath('.forceignore'),
        this.destinationPath(path.join(outputdir, projectname, '.forceignore'))
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
          )
        );
      }
      for (const file of filestocopy) {
        this.fs.copyTpl(
          this.templatePath(file),
          this.destinationPath(path.join(outputdir, projectname, file))
        );
      }
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
      oldfolder = path.join(oldfolder, folder);
    }
  }
  for (const newfolder of metadatafolders) {
    if (!fs.existsSync(path.join(oldfolder, newfolder))) {
      fs.mkdirSync(path.join(oldfolder, newfolder));
    }
  }
}
