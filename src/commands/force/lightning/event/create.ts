import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import { CreateUtil } from '../../../../createUtil';
import LightningEventGenerator from '../../../../generators/lightningEventGenerator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'messages');
const lightningEventFileSuffix = /.evt$/;
export default class LightningEvent extends SfdxCommand {
  public static examples = [
    '$ sfdx force:lightning:app:create -n myevent',
    '$ sfdx force:lightning:event:create -n myevent -d aura'
  ];

  public static description = messages.getMessage(
    'LightningEventCommandDescription'
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputdir'),
      required: false,
      default: process.cwd()
    }),
    apiversion: flags.builtin(),
    eventname: flags.string({
      char: 'n',
      description: messages.getMessage('eventname'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: messages.getMessage('template'),
      default: 'DefaultLightningEvt',
      options: CreateUtil.getCommandTemplatesForFiletype(
        lightningEventFileSuffix,
        'lightningevent'
      )
    }),
    internal: flags.boolean({
      char: 'i',
      description: messages.getMessage('internal'),
      hidden: true
    })
  };
  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.eventname);
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
    return CreateUtil.runGenerator(LightningEventGenerator, this.flags);
  }
}
