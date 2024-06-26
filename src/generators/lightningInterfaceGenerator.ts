/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { LightningInterfaceOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class LightningInterfaceGenerator extends BaseGenerator<LightningInterfaceOptions> {
  constructor(options: LightningInterfaceOptions) {
    super(options);
  }

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
            `${interfacename}.intf-meta.xml`
          )
        ),
        {
          apiVersion: this.apiversion,
          description: nls.localize('LightningInterfaceBundle'),
        }
      );
    }
    await this.render(
      this.templatePath(`${template}.intf`),
      this.destinationPath(
        path.join(this.outputdir, interfacename, `${interfacename}.intf`)
      ),
      {}
    );
  }
}
