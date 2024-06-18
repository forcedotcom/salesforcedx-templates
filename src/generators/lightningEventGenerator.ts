/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { LightningEventOptions } from '../utils/types';
import { SfGenerator } from './sfGenerator';

export default class LightningEventGenerator extends SfGenerator<LightningEventOptions> {
  constructor(options: LightningEventOptions) {
    super(options);
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.eventname);
    CreateUtil.checkInputs(this.options.template);

    const fileparts = path.resolve(this.outputdir).split(path.sep);
    if (!this.options.internal && !fileparts.includes('aura')) {
      throw new Error(nls.localize('MissingAuraDir'));
    }
  }

  public async generate(): Promise<void> {
    const { template, eventname, internal } = this.options;
    this.sourceRootWithPartialPath('lightningevent');

    if (!internal) {
      await this.render(
        this.templatePath('_auradefinitionbundle.evt-meta.xml'),
        this.destinationPath(
          path.join(this.outputdir, eventname, `${eventname}.evt-meta.xml`)
        ),
        {
          eventname,
          apiVersion: this.apiversion,
          description: nls.localize('LightningEventBundle'),
        }
      );
    }
    await this.render(
      this.templatePath(`${template}.evt`),
      this.destinationPath(
        path.join(this.outputdir, eventname, `${eventname}.evt`)
      ),
      {}
    );
  }
}
