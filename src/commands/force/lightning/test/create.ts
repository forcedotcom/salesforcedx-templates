/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import LightningTestGenerator from '../../../../generators/lightningTestGenerator';
import { CreateUtil, TemplateCommand } from '../../../../utils';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');
const lightningTestFileSuffix = /.resource$/;

export default class LightningTest extends TemplateCommand {
  public static examples = [
    '$ sfdx force:lightning:test:create -n MyLightningTest',
    '$ sfdx force:lightning:test:create -n MyLightningTest -d lightningTests'
  ];

  public static description = messages.getMessage(
    'LightningTestCommandDescription'
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputdir'),
      required: false,
      default: process.cwd()
    }),
    testname: flags.string({
      char: 'n',
      description: messages.getMessage('testname'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: messages.getMessage('template'),
      default: 'DefaultLightningTest',
      options: CreateUtil.getCommandTemplatesForFiletype(
        lightningTestFileSuffix,
        'lightningtest'
      )
    }),
    internal: flags.boolean({
      char: 'i',
      description: messages.getMessage('internal'),
      hidden: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.testname);
    CreateUtil.checkInputs(this.flags.template);

    return this.runGenerator(LightningTestGenerator);
  }
}
