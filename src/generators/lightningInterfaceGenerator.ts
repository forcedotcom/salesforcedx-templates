/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Messages } from '@salesforce/core';
import * as path from 'path';
import { OptionsMap } from './types';
// tslint:disable-next-line: no-var-requires
const generator = require('yeoman-generator');
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'messages');

export default class LightningInterfaceGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(
      path.join(__dirname, '..', 'templates', 'lightninginterface')
    );
    // This disables yeoman feature for overwriting files prompt
    this.conflicter.force = true;
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
          description: messages.getMessage('LightningInterfaceBundle')
        }
      );
    }
    this.fs.copyTpl(
      this.templatePath(`${template}.intf`),
      this.destinationPath(
        path.join(outputdir, interfacename, `${interfacename}.intf`)
      )
    );
  }
}
