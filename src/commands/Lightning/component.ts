import { SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class LightningComponent extends SfdxCommand {
    public async run(): Promise<AnyJson> {
        let outputString = 'This is the Lightning component';
        console.log(outputString);
        return {outputString};
  }
}
