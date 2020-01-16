/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import AnalyticsTemplateGenerator from '../../../../generators/analyticsTemplateGenerator';
import { CreateUtil, MessageUtil, TemplateCommand } from '../../../../utils';

Messages.importMessagesDirectory(__dirname);
export default class AnalyticsTemplate extends TemplateCommand {
  public static examples = [
    '$ sfdx force:analytics:template:create -n myTemplate -d outputdir'
  ];

  public static description = MessageUtil.buildDescription(
    'AnalyticsTemplateDescription',
    false
  );

  public static help = MessageUtil.buildHelpText(
    AnalyticsTemplate.examples,
    false
  );
  public static longDescription = MessageUtil.get(
    'AnalyticsTemplateLongDescription'
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: MessageUtil.get('OutputDirFlagDescription'),
      longDescription: MessageUtil.get('OutputDirFlagLongDescription'),
      default: '.'
    }),
    apiversion: flags.builtin(),
    templatename: flags.string({
      char: 'n',
      description: MessageUtil.get('AnalyticsTemplateNameFlagDescription'),
      longDescription: MessageUtil.get(
        'AnalyticsTemplateNameFlagLongDescription'
      ),
      required: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.templatename);

    const fileparts = path.resolve(this.flags.outputdir).split(path.sep);
    // tslint:disable-next-line:no-unused-expression
    if (!fileparts.includes('waveTemplates')) {
      throw new Error(MessageUtil.get('MissingWaveTemplatesDir'));
    }

    return this.runGenerator(AnalyticsTemplateGenerator);
  }
}
