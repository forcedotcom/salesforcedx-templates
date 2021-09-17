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
import { SfdxGenerator } from './sfdxGenerator';

export default class LightningInterfaceGenerator extends SfdxGenerator<
  LightningInterfaceOptions
> {
  constructor(args: string | string[], options: LightningInterfaceOptions) {
    super(args, options);
    this.sourceRootWithPartialPath('lightninginterface');
  }

  public validateOptions() {
    CreateUtil.checkInputs(this.options.interfacename);
    CreateUtil.checkInputs(this.options.template);

    const fileparts = path.resolve(this.options.outputdir).split(path.sep);

    if (!this.options.internal && !fileparts.includes('aura')) {
      throw new Error(nls.localize('MissingAuraDir'));
    }
  }

  public writing() {
    const {
      template,
      outputdir,
      interfacename,
      apiversion,
      internal
    } = this.options;
    // tslint:disable-next-line:no-unused-expression
    if (!internal) {
      this.fs.copyTpl(
        this.templatePath('_auradefinitionbundle.intf-meta.xml'),
        this.destinationPath(
          path.join(outputdir, interfacename, `${interfacename}.intf-meta.xml`)
        ),
        {
          apiVersion: apiversion,
          description: nls.localize('LightningInterfaceBundle')
        }
      );
    }
    this.fs.copyTpl(
      this.templatePath(`${template}.intf`),
      this.destinationPath(
        path.join(outputdir, interfacename, `${interfacename}.intf`)
      ),
      {}
    );
  }
}
