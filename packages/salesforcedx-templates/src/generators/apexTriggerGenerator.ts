/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { OptionsMap, TemplateOptions } from '../types';
// tslint:disable-next-line:no-var-requires
const generator = require('yeoman-generator');

export interface ApexTriggerOptions extends TemplateOptions {
  template?: 'ApexTrigger';
  /**
   * sObject to create a trigger on. Defaults to `SOBJECT`.
   */
  sobject?: string;
  /**
   * Events that fire the trigger. Defaults to `before insert`.
   */
  triggerevents?:
    | 'before insert'
    | 'before update'
    | 'before delete'
    | 'after insert'
    | 'after update'
    | 'after delete'
    | 'after undelete';
  triggername: string;
}

export default class ApexTriggerGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'apextrigger'));

    this.conflicter.force = false;
  }
  public writing() {
    const {
      template,
      outputdir,
      triggername,
      apiversion,
      triggerevents,
      sobject
    } = this.options;
    this.fs.copyTpl(
      this.templatePath(`${template}.trigger`),
      this.destinationPath(path.join(outputdir, `${triggername}.trigger`)),
      { triggername, sobject, triggerEvents: triggerevents }
    ),
      this.fs.copyTpl(
        this.templatePath('_trigger.trigger-meta.xml'),
        this.destinationPath(
          path.join(outputdir, `${triggername}.trigger-meta.xml`)
        ),
        { apiVersion: apiversion }
      );
  }
}
