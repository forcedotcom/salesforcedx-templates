/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { OptionsMap } from './types';
// tslint:disable-next-line:no-var-requires
const generator = require('yeoman-generator');

export default class ApexClassGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'apexclass'));
    // This disables yeoman feature for overwriting files prompt
    this.conflicter.force = true;
  }

  public writing() {
    const { template, outputdir, classname, apiversion } = this.options;
    this.fs.copyTpl(
      this.templatePath(`${template}.cls`),
      this.destinationPath(path.join(outputdir, `${classname}.cls`)),
      { apiName: classname }
    ),
      this.fs.copyTpl(
        this.templatePath('_class.cls-meta.xml'),
        this.destinationPath(path.join(outputdir, `${classname}.cls-meta.xml`)),
        { apiName: classname, apiVersion: apiversion }
      );
  }
}
