/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { CreateUtil } from '../utils';
import { ApexTriggerOptions } from '../utils/types';
import { SfdxGenerator } from './sfdxGenerator';

export default class ApexTriggerGenerator extends SfdxGenerator<
  ApexTriggerOptions
> {
  constructor(args: string | string[], options: ApexTriggerOptions) {
    super(args, options);
    this.sourceRootWithPartialPath('apextrigger');
  }
  public validateOptions() {
    CreateUtil.checkInputs(this.options.triggername);
    CreateUtil.checkInputs(this.options.template);
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
