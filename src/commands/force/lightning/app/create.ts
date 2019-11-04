/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import LightningAppGenerator from '../../../../generators/lightningAppGenerator';
import { CreateUtil, MessageUtil, TemplateCommand } from '../../../../utils';

const lightningAppFileSuffix = /.app$/;
const BUNDLE_TYPE = MessageUtil.get('App');

export default class LightningApp extends TemplateCommand {
  public static description = MessageUtil.buildDescription(
    'LightningDescription',
    true,
    [BUNDLE_TYPE]
  );
  public static examples = [
    '$ sfdx force:lightning:app:create -n myapp',
    '$ sfdx force:lightning:app:create -n myapp -d aura'
  ];
  public static help = MessageUtil.buildHelpText(LightningApp.examples, true);
  public static longDescription = MessageUtil.get('LightningLongDescription', [
    BUNDLE_TYPE
  ]);

  protected static flagsConfig = {
    appname: flags.string({
      char: 'n',
      description: MessageUtil.get('LightningNameFlagDescription', [
        BUNDLE_TYPE
      ]),
      longDescription: MessageUtil.get('LightningNameFlagLongDescription', [
        BUNDLE_TYPE
      ]),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: MessageUtil.get('TemplateFlagDescription'),
      longDescription: MessageUtil.get('TemplateFlagLongDescription'),
      default: 'DefaultLightningApp',
      options: CreateUtil.getCommandTemplatesForFiletype(
        lightningAppFileSuffix,
        'lightningapp'
      )
    }),
    outputdir: flags.string({
      char: 'd',
      description: MessageUtil.get('OutputDirFlagDescription'),
      longDescription: MessageUtil.get('OutputDirFlagLongDescription')
    }),
    apiversion: flags.builtin(),
    internal: flags.boolean({
      char: 'i',
      description: MessageUtil.get('LightningInternalFlagDescription'),
      hidden: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.appname);
    CreateUtil.checkInputs(this.flags.template);

    const fileparts = path.resolve(this.flags.outputdir).split(path.sep);
    // tslint:disable-next-line:no-unused-expression
    if (!fileparts.includes('aura') && !this.flags.internal) {
      throw new Error(MessageUtil.get('MissingAuraDir'));
    }

    return this.runGenerator(LightningAppGenerator);
  }
}
