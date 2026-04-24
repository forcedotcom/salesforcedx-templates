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
import { CreateUtil } from '../utils';
import { LightningEventOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class LightningEventGenerator extends BaseGenerator<LightningEventOptions> {
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
          path.join(this.outputdir, eventname, `${eventname}.evt-meta.xml`),
        ),
        {
          eventname,
          apiVersion: this.apiversion,
          description: nls.localize('LightningEventBundle'),
        },
      );
    }
    await this.render(
      this.templatePath(`${template}.evt`),
      this.destinationPath(
        path.join(this.outputdir, eventname, `${eventname}.evt`),
      ),
      {},
    );
  }
}
