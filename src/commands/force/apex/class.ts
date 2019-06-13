// File to create an Apex class.
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

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

      const outputString = `Test. Your api-name is ${apiName}`;
      this.ux.log(outputString);

      return {outputString};
    }

}
