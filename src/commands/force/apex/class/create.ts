// File to create an Apex class.
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import ApexClassCreateGenerator from './ApexClassCreateGenerator';
import * as yoEnvironment from 'yeoman-environment';

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('force-language-services', 'apexclass');

export default class Class extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');
  public static args = [{name: 'file'}];
  protected static flagsConfig = {
    // flag values
    name: flags.string({char: 'n', description: messages.getMessage('nameFlagDescription')}),
    force: flags.boolean({char: 'f', description: messages.getMessage('forceFlagDescription')})
  };
    public async run(): Promise<AnyJson> {
      const apiName = this.flags.name;
      const generator = new ApexClassCreateGenerator();

     // const outputString = `Test. This is the test api name ${apiName}`;
     // this.ux.log(outputString);

      const classgen = generator.writing(apiName);
      const env: any = undefined;
      env.registerStub(classgen, 'force:apex:class');
      return env.run('force:apex:class');
      // return {outputString};
    }
    // return Classgen.create();
   // }

}
