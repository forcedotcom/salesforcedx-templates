import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import ApexClassCreateGenerator from '../../../../ApexClassCreateGenerator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'apexclass');
export default class ApexClass extends SfdxCommand {
  public static help = 'test';
  public static description = messages.getMessage('commandDescription');
  public static args = [{name: 'file'}];
  protected static flagsConfig = {
    classname: flags.string({char: 'n', description: messages.getMessage('nameFlagDescription'), required: true}),
    outputdir: flags.string({char: 'd', description: messages.getMessage('outputdir'), default: __dirname}),
    apiversion: flags.builtin({description: messages.getMessage('apiversion')}),
    template: flags.string({char: 't', description: messages.getMessage('template'), default: 'DefaultApexClass'})
    };
    public async run(): Promise<AnyJson> {
      const apiName = this.flags.classname;
      const outputdir = this.flags.outputdir;
      const apiVersion = this.flags.apiversion;
      const template = this.flags.template;

      const yeoman = require('yeoman-environment');
      const env = yeoman.createEnv();

      env.registerStub(ApexClassCreateGenerator, 'apexclassgenerator');
      env.run('apexclassgenerator', {apiName, template, outputdir, apiVersion});
      return;
    }
}
