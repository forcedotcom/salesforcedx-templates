/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import AnalyticsTemplateGenerator from '../../../../generators/analyticsTemplateGenerator';
import { TemplateCommand } from '../../../../utils';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');
export default class AnalyticsTemplate extends TemplateCommand {
  public static examples = [
    '$ sfdx force:analytics:template:create -d outputdir'
  ];

  public static description = messages.getMessage(
    'CreateAnalyticsTemplateCommandDescription'
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputdir'),
      default: process.cwd()
    }),
    apiversion: flags.builtin(),
    templatename: flags.string({
      char: 'n',
      description: messages.getMessage('AnalyticsTemplateName'),
      default: 'DefaultAnalyticsTemplate'
    })
  };

  public async run(): Promise<AnyJson> {
    return this.runGenerator(AnalyticsTemplateGenerator);
  }
}
