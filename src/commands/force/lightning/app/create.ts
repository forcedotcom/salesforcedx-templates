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
import { CreateUtil } from '../../../../utils/createUtil';
import LightningAppGenerator from '../../../../generators/lightningAppGenerator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');
const lightningAppFileSuffix = /.app$/;
export default class LightningApp extends SfdxCommand {
  public static examples = [
    '$ sfdx force:lightning:app:create -n myapp',
    '$ sfdx force:lightning:app:create -n myapp -d aura'
  ];

  public static description = messages.getMessage(
    'LightningAppCommandDescription'
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputdir'),
      default: process.cwd()
    }),
    apiversion: flags.builtin(),
    appname: flags.string({
      char: 'n',
      description: messages.getMessage('appname'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: messages.getMessage('template'),
      default: 'DefaultLightningApp',
      options: CreateUtil.getCommandTemplatesForFiletype(
        lightningAppFileSuffix,
        'lightningapp'
      )
    }),
    internal: flags.boolean({
      char: 'i',
      description: messages.getMessage('internal'),
      hidden: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.appname);
    CreateUtil.checkInputs(this.flags.template);

    const fileparts = path.resolve(this.flags.outputdir).split(path.sep);
    // tslint:disable-next-line:no-unused-expression
    if (!fileparts.includes('aura') && !this.flags.internal) {
      throw new Error(messages.getMessage('MissingAuraDir'));
    }

    return CreateUtil.runGenerator(LightningAppGenerator, this);
  }
}
