/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import StaticResourceGenerator from '@salesforce/templates/lib/generators/staticResourceGenerator';
import { AnyJson } from '@salesforce/ts-types';
import { MessageUtil, TemplateCommand } from '../../../utils';

export default class StaticResource extends TemplateCommand {
  public static description = MessageUtil.buildDescription(
    'StaticResourceDescription',
    false
  );
  public static examples = [
    '$ sfdx force:staticresource:create -n MyResource',
    '$ sfdx force:staticresource:create -n MyResource --contenttype application/json',
    '$ sfdx force:staticresource:create -n MyResource -d staticresources'
  ];
  public static help = MessageUtil.buildHelpText(
    StaticResource.examples,
    false
  );
  public static longDescription = MessageUtil.get(
    'StaticResourceLongDescription'
  );

  protected static flagsConfig = {
    resourcename: flags.string({
      char: 'n',
      description: MessageUtil.get('StaticResourceNameFlagDescription'),
      longDescription: MessageUtil.get('StaticResourceNameFlagLongDescription'),
      required: true
    }),
    contenttype: flags.string({
      description: MessageUtil.get('StaticResourceContentTypeFlagDescription'),
      longDescription: MessageUtil.get(
        'StaticResourceContentTypeFlagLongDescription'
      ),
      default: 'application/zip'
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
    return this.runGenerator(StaticResourceGenerator);
  }
}
