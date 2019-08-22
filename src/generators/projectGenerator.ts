/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { CreateUtil } from '../createUtil';
import { OptionsMap } from './types';
// tslint:disable-next-line: no-var-requires
const generator = require('yeoman-generator');
const loginURL = 'https://login.salesforce.com';
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
  '.gitignore',
  '.prettierignore',
  '.prettierrc'
];
const emptyfolderarray = ['aura', 'lwc'];

export default class ProjectGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'project'));
    // This enables yeoman feature for overwriting files prompt
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
      sourceApiVersion
    } = this.options;
    const folderlayout = [
      outputdir,
      projectname,
      defaultpackagedir,
      'main',
      'default'
    ];
    this.fs.copyTpl(
      this.templatePath('DefaultScratchDef.json'),
      this.destinationPath(
        path.join(outputdir, projectname, 'config', 'project-scratch-def.json')
      ),
      { company: (process.env.USER || 'Demo') + ' company' }
    );
    this.fs.copyTpl(
      this.templatePath(`README.${template}.md`),
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
        this.templatePath('DefaultManifest.xml'),
        this.destinationPath(
          path.join(outputdir, projectname, 'manifest', 'package.xml')
        ),
        { sourceApiVersion }
      );
    }

    // tslint:disable-next-line:no-unused-expression
    if (template === 'standard') {
      CreateUtil.makeEmptyFolders(folderlayout, standardfolderarray);
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
        this.fs.copyTpl(
          this.templatePath(file),
          this.destinationPath(path.join(outputdir, projectname, file))
        );
      }
    }

    // tslint:disable-next-line:no-unused-expression
    if (template === 'empty') {
      CreateUtil.makeEmptyFolders(folderlayout, emptyfolderarray);
      this.fs.copyTpl(
        this.templatePath('.forceignore'),
        this.destinationPath(path.join(outputdir, projectname, '.forceignore'))
      );
    }
  }
}
