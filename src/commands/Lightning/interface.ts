import { SfdxCommand } from './node_modules/@salesforce/command';
import { Messages } from './node_modules/@salesforce/core';
import { AnyJson } from './node_modules/@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class LightningInterface extends SfdxCommand {
    public async run(): Promise<AnyJson> {
        let outputString = 'This is the Lightning interface';
        console.log(outputString);
        return {outputString};
  }
}
