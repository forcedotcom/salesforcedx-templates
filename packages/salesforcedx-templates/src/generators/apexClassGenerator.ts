/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import YeomanGenerator from 'yeoman-generator';
import { OptionsMap } from '../types';
import { TemplateOptions } from '../types';

export interface ApexClassOptions extends TemplateOptions {
  template?:
    | 'DefaultApexClass'
    | 'ApexUnitTest'
    | 'ApexException'
    | 'InboundEmailService';
  classname: string;
}

export class ApexClassGenerator extends YeomanGenerator {
  constructor(args: string | string[], options: TemplateOptions) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'apexclass'));
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
