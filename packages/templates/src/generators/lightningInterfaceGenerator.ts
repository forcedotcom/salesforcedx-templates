/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import * as Generator from 'yeoman-generator';
import { nls } from '../i18n';
import { OptionsMap } from '../utils/types';

export default class LightningInterfaceGenerator extends Generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(
      path.join(__dirname, '..', 'templates', 'lightninginterface')
    );
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
