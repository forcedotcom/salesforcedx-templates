/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Messages } from '@salesforce/core';
import * as path from 'path';
import { OptionsMap } from './types';
// tslint:disable-next-line:no-var-requires
const generator = require('yeoman-generator');
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');

export default class LightningEventGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'lightningevent'));
    // This disables yeoman feature for overwriting files prompt
    this.conflicter.force = true;
  }
  public writing() {
    const {
      template,
      outputdir,
      eventname,
      apiversion,
      internal
    } = this.options;
    // tslint:disable-next-line:no-unused-expression
    if (!internal) {
      this.fs.copyTpl(
        this.templatePath('_auradefinitionbundle.evt-meta.xml'),
        this.destinationPath(
          path.join(outputdir, eventname, `${eventname}.evt-meta.xml`)
        ),
        {
          eventname,
          apiVersion: apiversion,
          description: messages.getMessage('LightningEventBundle')
        }
      );
    }
    this.fs.copyTpl(
      this.templatePath(`${template}.evt`),
      this.destinationPath(path.join(outputdir, eventname, `${eventname}.evt`))
    );
  }
}
