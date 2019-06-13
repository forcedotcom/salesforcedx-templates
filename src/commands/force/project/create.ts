import { SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class Project extends SfdxCommand {
    public async run(): Promise<AnyJson> {
        let outputString = 'This is the Project create';
        console.log(outputString);
        return {outputString};
  }
}
