/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import * as Generator from 'yeoman-generator';
import { OptionsMap } from '../utils/types';
export default class ApexTriggerGenerator extends Generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'apextrigger'));
    // @ts-ignore
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
