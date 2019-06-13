import { SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class ApexTrigger extends SfdxCommand {
    public async run(): Promise<AnyJson> {
        let outputString = 'This is the Apex trigger';
        console.log(outputString);
        return {outputString};
  }
}
