/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import LightningTestGenerator from '../../../../generators/lightningTestGenerator';
import { CreateUtil, TemplateCommand, MessageUtil } from '../../../../utils';

const lightningTestFileSuffix = /.resource$/;

export default class LightningTest extends TemplateCommand {
  public static description = MessageUtil.buildDescription(
    'LightningTestDescription',
    false
  );
  public static examples = [
    '$ sfdx force:lightning:test:create -n MyLightningTest',
    '$ sfdx force:lightning:test:create -n MyLightningTest -d lightningTests'
  ];
  public static help = MessageUtil.buildHelpText(LightningTest.examples, false);
  public static longDescription = MessageUtil.get(
    'LightningTestLongDescription'
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: MessageUtil.get('outputdir'),
      required: false,
      default: MessageUtil.get('CurrentWorkingDir')
    }),
    testname: flags.string({
      char: 'n',
      description: MessageUtil.get('testname'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: MessageUtil.get('template'),
      default: 'DefaultLightningTest',
      options: CreateUtil.getCommandTemplatesForFiletype(
        lightningTestFileSuffix,
        'lightningtest'
      )
    }),
    internal: flags.boolean({
      char: 'i',
      description: MessageUtil.get('internal'),
      hidden: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.testname);
    CreateUtil.checkInputs(this.flags.template);

    return this.runGenerator(LightningTestGenerator);
  }
}
