import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import { CreateUtil } from '../../../../createUtil';
import LightningAppGenerator from '../../../../generators/lightningAppGenerator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'messages');
const lightningAppFileSuffix = /.app$/;
export default class LightningApp extends SfdxCommand {
  public static examples = [
    '$ sfdx force:lightning:app:create -n myapp',
    '$ sfdx force:lightning:app:create -n myapp -d aura'
  ];

  public static description = messages.getMessage(
    'LightningAppCommandDescription'
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputdir'),
      default: process.cwd()
    }),
    apiversion: flags.builtin(),
    appname: flags.string({
      char: 'n',
      description: messages.getMessage('appname'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: messages.getMessage('template'),
      default: 'DefaultLightningApp',
      options: CreateUtil.getCommandTemplatesForFiletype(
        lightningAppFileSuffix,
        'lightningapp'
      )
    }),
    internal: flags.boolean({
      char: 'i',
      description: messages.getMessage('internal'),
      hidden: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.appname);
    CreateUtil.checkInputs(this.flags.template);

    const filepath = path.resolve(this.flags.outputdir);

    const fileparts = filepath.split(path.sep);

    // tslint:disable-next-line:no-unused-expression
    if (!this.flags.internal) {
      if (!fileparts.includes('aura')) {
        throw new Error(messages.getMessage('MissingAuraDir'));
      }
    }

    this.log(`target dir = ${filepath}`);
    return CreateUtil.runGenerator(LightningAppGenerator, this.flags);
  }
}
