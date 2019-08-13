import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import { CreateUtil } from '../../../../createUtil';
import VisualforcePageGenerator from '../../../../generators/visualforcePageGenerator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');
const visualforcePageFileSuffix = /.page$/;

export default class VisualforcePage extends SfdxCommand {
  public static examples = [
    '$ sfdx force:visualforce:page:create -n mypage -l mylabel',
    '$ sfdx force:visualforce:page:create -n mypage -l mylabel -d pages'
  ];

  public static description = messages.getMessage(
    'VisualforcePageCommandDescription'
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputdir'),
      default: process.cwd()
    }),
    apiversion: flags.builtin(),
    pagename: flags.string({
      char: 'n',
      description: messages.getMessage('visualforcepagename'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: messages.getMessage('template'),
      default: 'DefaultVFPage',
      options: CreateUtil.getCommandTemplatesForFiletype(
        visualforcePageFileSuffix,
        'visualforcepage'
      )
    }),
    label: flags.string({
      char: 'l',
      description: messages.getMessage('pagelabel'),
      required: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.pagename);
    CreateUtil.checkInputs(this.flags.template);

    const filepath = path.resolve(this.flags.outputdir);

    this.log(`target dir = ${filepath}`);
    return CreateUtil.runGenerator(VisualforcePageGenerator, this.flags);
  }
}
