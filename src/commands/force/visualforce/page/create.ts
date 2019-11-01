/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import VisualforcePageGenerator from '../../../../generators/visualforcePageGenerator';
import { CreateUtil, TemplateCommand, MessageUtil } from '../../../../utils';

const visualforcePageFileSuffix = /.page$/;
const VF_TYPE = MessageUtil.get('page');

export default class VisualforcePage extends TemplateCommand {
  public static description = MessageUtil.buildDescription(
    'VisualforceDescription',
    false,
    [VF_TYPE]
  );
  public static examples = [
    '$ sfdx force:visualforce:page:create -n mypage -l mylabel',
    '$ sfdx force:visualforce:page:create -n mypage -l mylabel -d pages'
  ];
  public static help = MessageUtil.buildHelpText(
    VisualforcePage.examples,
    false
  );
  public static longDescription = MessageUtil.get(
    'VisualforceLongDescription',
    [VF_TYPE, VF_TYPE]
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: MessageUtil.get('outputdir'),
      default: MessageUtil.get('CurrentWorkingDir')
    }),
    apiversion: flags.builtin(),
    pagename: flags.string({
      char: 'n',
      description: MessageUtil.get('visualforcepagename'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: MessageUtil.get('template'),
      default: 'DefaultVFPage',
      options: CreateUtil.getCommandTemplatesForFiletype(
        visualforcePageFileSuffix,
        'visualforcepage'
      )
    }),
    label: flags.string({
      char: 'l',
      description: MessageUtil.get('pagelabel'),
      required: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.pagename);
    CreateUtil.checkInputs(this.flags.template);

    return this.runGenerator(VisualforcePageGenerator);
  }
}
