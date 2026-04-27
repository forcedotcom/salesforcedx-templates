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
import { LightningInterfaceOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class LightningInterfaceGenerator extends BaseGenerator<LightningInterfaceOptions> {
  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.interfacename);
    CreateUtil.checkInputs(this.options.template);

    const fileparts = path.resolve(this.outputdir).split(path.sep);

    if (!this.options.internal && !fileparts.includes('aura')) {
      throw new Error(nls.localize('MissingAuraDir'));
    }
  }

  public async generate(): Promise<void> {
    const { template, interfacename, internal } = this.options;
    this.sourceRootWithPartialPath('lightninginterface');

    if (!internal) {
      await this.render(
        this.templatePath('_auradefinitionbundle.intf-meta.xml'),
        this.destinationPath(
          path.join(
            this.outputdir,
            interfacename,
            `${interfacename}.intf-meta.xml`,
          ),
        ),
        {
          apiVersion: this.apiversion,
          description: nls.localize('LightningInterfaceBundle'),
        },
      );
    }
    await this.render(
      this.templatePath(`${template}.intf`),
      this.destinationPath(
        path.join(this.outputdir, interfacename, `${interfacename}.intf`),
      ),
      {},
    );
  }
}
