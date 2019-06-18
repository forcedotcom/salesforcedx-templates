import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as yoEnvironment from 'yeoman-environment';
import { generators } from 'yeoman-generator';
import ApexClassCreateGenerator from '../../../../ApexClassCreateGenerator';

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('force-language-services', 'apexclass');

export default class ApexClass extends SfdxCommand {
  public static help = 'test';
  public static description = messages.getMessage('commandDescription');
  public static args = [{name: 'file'}];
  protected static flagsConfig = {
    // flag values
    name: flags.string({char: 'n', description: messages.getMessage('nameFlagDescription')}),
    force: flags.boolean({char: 'f', description: messages.getMessage('forceFlagDescription')})
  };
    public async run(): Promise<AnyJson> {
      const apiName = this.flags.name;

      const yeoman = require('yeoman-environment');
      const env = yeoman.createEnv();

      env.registerStub(ApexClassCreateGenerator, 'apexclassgenerator');
      env.run('apexclassgenerator', );
      return;
    }
}
