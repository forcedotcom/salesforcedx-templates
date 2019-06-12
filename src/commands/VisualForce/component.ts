import { SfdxCommand } from './node_modules/@salesforce/command';
import { Messages } from './node_modules/@salesforce/core';
import { AnyJson } from './node_modules/@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class VisualForceComponent extends SfdxCommand {
    public async run(): Promise<AnyJson> {
        let outputString = 'This is the VisualForce component';
        console.log(outputString);
        return {outputString};
  }
}
