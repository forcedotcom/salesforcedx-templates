import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import ApexClassGenerator from '../../../../apexClassGenerator';
import { CreateUtil } from '../../../../createUtil';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'messages');
export default class ApexClass extends SfdxCommand {
  public static examples = [
    '$ sfdx force:apex:class:create -n MyClass',
    '$ sfdx force:apex:class:create -n MyClass -d classes'
  ];

  public static description = messages.getMessage(
    'ApexClassCommandDescription'
  );

  protected static flagsConfig = {
    classname: flags.string({
      char: 'n',
      description: messages.getMessage('NameFlagDescription'),
      required: true
    }),
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputdir'),
      required: false,
      default: process.cwd()
    }),
    // Need to fix the apiversion flag with default and optional inputs
    apiversion: flags.builtin(),
    template: flags.string({
      char: 't',
      description: messages.getMessage('template'),
      default: 'DefaultApexClass',
      options: CreateUtil.getTemplates(/.cls$/, __dirname)
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.classname);
    CreateUtil.checkInputs(this.flags.template);

    this.log(CreateUtil.printOutputDir(this.flags.outputdir, process.cwd()));

    return CreateUtil.runGenerator(ApexClassGenerator, this.flags);
  }
}
