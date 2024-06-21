/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { CreateUtil } from '../utils';
import { ApexTriggerOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class ApexTriggerGenerator extends BaseGenerator<ApexTriggerOptions> {
  constructor(options: ApexTriggerOptions) {
    super(options);
  }
  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.triggername);
    CreateUtil.checkInputs(this.options.template);
  }
  public async generate(): Promise<void> {
    const { template, triggername, triggerevents, sobject } = this.options;
    this.sourceRootWithPartialPath('apextrigger');

    await this.render(
      this.templatePath(`${template}.trigger`),
      this.destinationPath(path.join(this.outputdir, `${triggername}.trigger`)),
      { triggername, sobject, triggerEvents: triggerevents }
    );
    await this.render(
      this.templatePath('_trigger.trigger-meta.xml'),
      this.destinationPath(
        path.join(this.outputdir, `${triggername}.trigger-meta.xml`)
      ),
      { apiVersion: this.apiversion }
    );
  }
}
