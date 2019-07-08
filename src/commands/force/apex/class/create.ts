import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import ApexClassGenerator from '../../../../apexClassGenerator';
import { CreateUtil } from '../../../../createUtil';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'apexclass');
export default class ApexClass extends SfdxCommand {
  public static examples = [
    '$ sfdx force:apex:class:create -n MyClass',
    '$ sfdx force:apex:class:create -n MyClass -d classes'
  ];

  public static description = messages.getMessage('commandDescription');

  protected static flagsConfig = {
    classname: flags.string({
      char: 'n',
      description: messages.getMessage('nameFlagDescription'),
      required: true
    }),
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputdir'),
      required: false,
      default: process.cwd()
    }),
    // Need to fix the apiversion flag with default and optional inputs
    // apiversion: flags.string({char: 'a', description: messages.getMessage('outputdir'), options: ['46.0', '45.0'], default: '45.0'}),
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

    const yeoman = require('yeoman-environment');
    const env = yeoman.createEnv();
    env.registerStub(ApexClassGenerator, 'apexclassgenerator');
    return env.run('apexclassgenerator', this.flags);
  }
}
