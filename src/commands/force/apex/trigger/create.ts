/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import ApexTriggerGenerator from '../../../../generators/apexTriggerGenerator';
import { CreateUtil, MessageUtil, TemplateCommand } from '../../../../utils';

const apexTriggerFileSuffix = /.trigger$/;

export default class ApexTrigger extends TemplateCommand {
  public static description = MessageUtil.buildDescription(
    'ApexTriggerDescription',
    false
  );
  public static examples = [
    '$ sfdx force:apex:trigger:create -n MyTrigger',
    "$ sfdx force:apex:trigger:create -n MyTrigger -s Account -e 'before insert, after insert'",
    '$ sfdx force:apex:trigger:create -n MyTrigger -d triggers'
  ];
  public static help = MessageUtil.buildHelpText(ApexTrigger.examples, false);
  public static longDescription = MessageUtil.get('ApexTriggerLongDescription');

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: MessageUtil.get('outputdir'),
      required: false,
      default: MessageUtil.get('CurrentWorkingDir')
    }),
    apiversion: flags.builtin(),
    triggerevents: flags.string({
      char: 'e',
      description: MessageUtil.get('triggerevents'),
      default: 'before insert',
      options: [
        'before insert',
        'before update',
        'before delete',
        'after insert',
        'after update',
        'after delete',
        'after undelete'
      ]
    }),
    triggername: flags.string({
      char: 'n',
      description: MessageUtil.get('triggername'),
      required: true
    }),
    sobject: flags.string({
      char: 's',
      description: MessageUtil.get('sobject'),
      default: 'SOBJECT'
    }),
    template: flags.string({
      char: 't',
      description: MessageUtil.get('template'),
      default: 'ApexTrigger',
      options: CreateUtil.getCommandTemplatesForFiletype(
        apexTriggerFileSuffix,
        'apextrigger'
      )
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.triggername);
    CreateUtil.checkInputs(this.flags.template);

    return this.runGenerator(ApexTriggerGenerator);
  }
}
