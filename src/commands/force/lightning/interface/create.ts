import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import { CreateUtil } from '../../../../createUtil';
import LightningInterfaceGenerator from '../../../../generators/lightningInterfaceGenerator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'messages');
const lightningInterfaceFileSuffix = /.intf$/;
export default class LightningInterface extends SfdxCommand {
  public static examples = [
    '$ sfdx force:lightning:interface:create -n myinterface',
    '$ sfdx force:lightning:interface:create -n myinterface -d aura'
  ];

  public static description = messages.getMessage(
    'LightningInterfaceCommandDescription'
  );
  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputdir'),
      required: false,
      default: process.cwd()
    }),
    apiversion: flags.builtin(),
    interfacename: flags.string({
      char: 'n',
      description: messages.getMessage('interfacename'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: messages.getMessage('template'),
      default: 'DefaultLightningIntf',
      options: CreateUtil.getCommandTemplatesForFiletype(
        lightningInterfaceFileSuffix,
        'lightninginterface'
      )
    })
  };
  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.interfacename);
    CreateUtil.checkInputs(this.flags.template);

    const filepath = path.resolve(this.flags.outputdir);
    const fileparts = filepath.split(path.sep);

    // tslint:disable-next-line:no-unused-expression
    if (!fileparts.includes('aura')) {
      throw new Error(messages.getMessage('MissingAuraDir'));
    }
    this.log(`target dir = ${filepath}`);

    return CreateUtil.runGenerator(LightningInterfaceGenerator, this.flags);
  }
}
