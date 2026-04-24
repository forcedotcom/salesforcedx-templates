/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as path from 'node:path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils/createUtil';
import { LightningTestOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class LightningTestGenerator extends BaseGenerator<LightningTestOptions> {
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
          path.join(this.outputdir, `${testname}.resource-meta.xml`),
        ),
        {
          description: nls.localize('LightningTest'),
        },
        // @ts-ignore
        { apiName: testname },
      );
    }
    await this.render(
      this.templatePath(`${template}.resource`),
      this.destinationPath(path.join(this.outputdir, `${testname}.resource`)),
      { apiName: testname },
    );
  }
}
