/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { LightningTestOptions } from '../utils/types';
import { SfGenerator } from './sfGenerator';

export default class LightningTestGenerator extends SfGenerator<LightningTestOptions> {
  constructor(options: LightningTestOptions) {
    super(options);
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.testname);
    CreateUtil.checkInputs(this.options.template);
  }

  public async generate(): Promise<void> {
    const { template, testname, internal } = this.options;
    this.sourceRootWithPartialPath('lightningtest');

    if (!internal) {
      await this.render(
        this.templatePath('_staticresource.resource-meta.xml'),
        this.destinationPath(
          path.join(this.outputdir, `${testname}.resource-meta.xml`)
        ),
        {
          description: nls.localize('LightningTest'),
        },
        // @ts-ignore
        { apiName: testname }
      );
    }
    await this.render(
      this.templatePath(`${template}.resource`),
      this.destinationPath(path.join(this.outputdir, `${testname}.resource`)),
      { apiName: testname }
    );
  }
}
