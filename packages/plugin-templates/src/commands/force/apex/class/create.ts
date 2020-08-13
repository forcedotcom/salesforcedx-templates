/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import ApexClassGenerator from '@salesforce/templates/lib/generators/apexClassGenerator';
import { CreateUtil } from '@salesforce/templates/lib/utils';
import { AnyJson } from '@salesforce/ts-types';
import { MessageUtil, TemplateCommand } from '../../../../utils';

const apexClassFileSuffix = /.cls$/;

export default class ApexClass extends TemplateCommand {
  public static description = MessageUtil.buildDescription(
    'ApexClassDescription',
    false
  );
  public static examples = [
    '$ sfdx force:apex:class:create -n MyClass',
    '$ sfdx force:apex:class:create -n MyClass -d classes'
  ];
  public static help = MessageUtil.buildHelpText(ApexClass.examples, false);
  public static longDescription = MessageUtil.get('ApexClassLongDescription');

  protected static flagsConfig = {
    classname: flags.string({
      char: 'n',
      description: MessageUtil.get('ApexClassNameFlagDescription'),
      longDescription: MessageUtil.get('ApexClassNameFlagLongDescription'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: MessageUtil.get('TemplateFlagDescription'),
      longDescription: MessageUtil.get('TemplateFlagLongDescription'),
      default: 'DefaultApexClass',
      options: CreateUtil.getCommandTemplatesForFiletype(
        apexClassFileSuffix,
        'apexclass'
      )
    }),
    outputdir: flags.string({
      char: 'd',
      description: MessageUtil.get('OutputDirFlagDescription'),
      longDescription: MessageUtil.get('OutputDirFlagLongDescription'),
      default: '.'
    }),
    apiversion: flags.builtin()
  };

  public async run(): Promise<AnyJson> {
    return this.runGenerator(ApexClassGenerator);
  }
}
