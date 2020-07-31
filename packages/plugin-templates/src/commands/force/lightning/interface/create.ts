/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import LightningInterfaceGenerator from '@salesforce/templates/lib/generators/lightningInterfaceGenerator';
import { CreateUtil } from '@salesforce/templates/lib/utils';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import { MessageUtil, TemplateCommand } from '../../../../utils';

const lightningInterfaceFileSuffix = /.intf$/;
const BUNDLE_TYPE = MessageUtil.get('Interface');

export default class LightningInterface extends TemplateCommand {
  public static description = MessageUtil.buildDescription(
    'LightningDescription',
    true,
    [BUNDLE_TYPE]
  );
  public static examples = [
    '$ sfdx force:lightning:interface:create -n myinterface',
    '$ sfdx force:lightning:interface:create -n myinterface -d aura'
  ];
  public static help = MessageUtil.buildHelpText(
    LightningInterface.examples,
    true
  );
  public static longDescription = MessageUtil.get('LightningLongDescription', [
    BUNDLE_TYPE
  ]);

  protected static flagsConfig = {
    interfacename: flags.string({
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
      default: 'DefaultLightningIntf',
      options: CreateUtil.getCommandTemplatesForFiletype(
        lightningInterfaceFileSuffix,
        'lightninginterface'
      )
    }),
    outputdir: flags.string({
      char: 'd',
      description: MessageUtil.get('OutputDirFlagDescription'),
      longDescription: MessageUtil.get('OutputDirFlagLongDescription'),
      default: '.'
    }),
    apiversion: flags.builtin(),
    internal: flags.boolean({
      char: 'i',
      description: MessageUtil.get('LightningInternalFlagDescription'),
      hidden: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.interfacename);
    CreateUtil.checkInputs(this.flags.template);

    const fileparts = path.resolve(this.flags.outputdir).split(path.sep);

    // tslint:disable-next-line:no-unused-expression
    if (!this.flags.internal && !fileparts.includes('aura')) {
      throw new Error(MessageUtil.get('MissingAuraDir'));
    }

    return this.runGenerator(LightningInterfaceGenerator);
  }
}
