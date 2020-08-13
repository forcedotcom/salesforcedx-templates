/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import ApexTriggerGenerator from '@salesforce/templates/lib/generators/apexTriggerGenerator';
import { CreateUtil } from '@salesforce/templates/lib/utils';
import { AnyJson } from '@salesforce/ts-types';
import { MessageUtil, TemplateCommand } from '../../../../utils';

const apexTriggerFileSuffix = /.trigger$/;

export default class ApexTrigger extends TemplateCommand {
  public static description = MessageUtil.buildDescription(
    'ApexTriggerDescription',
    false
  );
  public static examples = [
    '$ sfdx force:apex:trigger:create -n MyTrigger',
    "$ sfdx force:apex:trigger:create -n MyTrigger -s Account -e 'before insert,after insert'",
    '$ sfdx force:apex:trigger:create -n MyTrigger -d triggers'
  ];
  public static help = MessageUtil.buildHelpText(ApexTrigger.examples, false);
  public static longDescription = MessageUtil.get('ApexTriggerLongDescription');

  protected static flagsConfig = {
    triggername: flags.string({
      char: 'n',
      description: MessageUtil.get('ApexTriggerNameFlagDescription'),
      longDescription: MessageUtil.get('ApexTriggerNameFlagLongDescription'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: MessageUtil.get('TemplateFlagDescription'),
      longDescription: MessageUtil.get('TemplateFlagLongDescription'),
      default: 'ApexTrigger',
      options: CreateUtil.getCommandTemplatesForFiletype(
        apexTriggerFileSuffix,
        'apextrigger'
      )
    }),
    outputdir: flags.string({
      char: 'd',
      description: MessageUtil.get('OutputDirFlagDescription'),
      longDescription: MessageUtil.get('OutputDirFlagLongDescription'),
      default: '.'
    }),
    apiversion: flags.builtin(),
    sobject: flags.string({
      char: 's',
      description: MessageUtil.get('ApexTriggerSObjectFlagDescription'),
      longDescription: MessageUtil.get('ApexTriggerSObjectFlagLongDescription'),
      default: 'SOBJECT'
    }),
    triggerevents: flags.array({
      char: 'e',
      description: MessageUtil.get('ApexTriggerEventsFlagDescription'),
      longDescription: MessageUtil.get('ApexTriggerEventsFlagLongDescription'),
      default: ['before insert'],
      options: [
        'before insert',
        'before update',
        'before delete',
        'after insert',
        'after update',
        'after delete',
        'after undelete'
      ]
    })
  };

  public async run(): Promise<AnyJson> {
    return this.runGenerator(ApexTriggerGenerator);
  }
}
