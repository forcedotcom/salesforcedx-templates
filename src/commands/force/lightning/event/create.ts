/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import LightningEventGenerator from '../../../../generators/lightningEventGenerator';
import { CreateUtil, SfdxCommandBase } from '../../../../utils';
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');
const lightningEventFileSuffix = /.evt$/;
export default class LightningEvent extends SfdxCommandBase {
  public static examples = [
    '$ sfdx force:lightning:app:create -n myevent',
    '$ sfdx force:lightning:event:create -n myevent -d aura'
  ];

  public static description = messages.getMessage(
    'LightningEventCommandDescription'
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputdir'),
      required: false,
      default: process.cwd()
    }),
    apiversion: flags.builtin(),
    eventname: flags.string({
      char: 'n',
      description: messages.getMessage('eventname'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: messages.getMessage('template'),
      default: 'DefaultLightningEvt',
      options: CreateUtil.getCommandTemplatesForFiletype(
        lightningEventFileSuffix,
        'lightningevent'
      )
    }),
    internal: flags.boolean({
      char: 'i',
      description: messages.getMessage('internal'),
      hidden: true
    })
  };
  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.eventname);
    CreateUtil.checkInputs(this.flags.template);

    const fileparts = path.resolve(this.flags.outputdir).split(path.sep);
    // tslint:disable-next-line:no-unused-expression
    if (!this.flags.internal && !fileparts.includes('aura')) {
      throw new Error(messages.getMessage('MissingAuraDir'));
    }
    return this.runGenerator(LightningEventGenerator);
  }
}
