/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// tslint:disable:no-unused-expression

import { flags } from '@salesforce/command';
import LightningComponentGenerator from '@salesforce/templates/lib/generators/lightningComponentGenerator';
import { AnyJson } from '@salesforce/ts-types';
import { MessageUtil, TemplateCommand } from '../../../../utils';

const BUNDLE_TYPE = MessageUtil.get('Component');

export default class LightningComponent extends TemplateCommand {
  public static description = MessageUtil.buildDescription(
    'LightningCmpDescription',
    true,
    undefined,
    MessageUtil.get('LightningCmpHelpExtra')
  );
  public static examples = [
    '$ sfdx force:lightning:component:create -n mycomponent',
    '$ sfdx force:lightning:component:create -n mycomponent --type lwc',
    '$ sfdx force:lightning:component:create -n mycomponent -d aura',
    '$ sfdx force:lightning:component:create -n mycomponent --type lwc -d lwc'
  ];
  public static help = MessageUtil.buildHelpText(
    LightningComponent.examples,
    true,
    MessageUtil.get('LightningCmpHelpExtra')
  );
  public static longDescription = MessageUtil.get(
    'LightningCmpLongDescription'
  );

  protected static flagsConfig = {
    componentname: flags.string({
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
      default: 'default',
      // Note: keep this list here and LightningComponentOptions#template in-sync with the
      // templates/lightningcomponents/[aura|lwc]/* folders
      options: ['default', 'analyticsDashboard', 'analyticsDashboardWithStep']
    }),
    outputdir: flags.string({
      char: 'd',
      description: MessageUtil.get('OutputDirFlagDescription'),
      longDescription: MessageUtil.get('OutputDirFlagLongDescription'),
      default: '.'
    }),
    apiversion: flags.builtin(),
    type: flags.string({
      description: MessageUtil.get('LightningCmpTypeFlagDescription'),
      longDescription: MessageUtil.get('LightningCmpTypeFlagLongDescription'),
      options: ['aura', 'lwc'],
      default: 'aura'
    }),
    internal: flags.boolean({
      char: 'i',
      description: MessageUtil.get('LightningInternalFlagDescription'),
      hidden: true
    })
  };

  public async run(): Promise<AnyJson> {
    return this.runGenerator(LightningComponentGenerator);
  }
}
