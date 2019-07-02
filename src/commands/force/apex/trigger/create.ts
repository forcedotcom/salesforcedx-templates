import { flags, SfdxCommand} from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import ApexTriggerGenerator from '../../../../apexTriggerGenerator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'apextrigger');

export default class ApexTrigger extends SfdxCommand {

    public static examples = [
        '$ sfdx force:apex:trigger:create -n MyTrigger',
        '$ sfdx force:apex:trigger:create -n MyTrigger -s Account -e \'before insert, after upsert\'',
        '$ sfdx force:apex:trigger:create -n MyTrigger -d triggers'
        ];

    public static description = messages.getMessage('commandDescription');

    protected static flagsConfig = {
        outputdir: flags.string({char: 'd', description: messages.getMessage('outputdir'), required: false, default: process.cwd()}),
        apiversion: flags.builtin(),
        triggerevents: flags.string({char: 'e', description: messages.getMessage('triggerevents'), default: 'before insert', options: ['before insert', 'before update', 'before delete', 'after insert', 'after update', 'after delete', 'after undelete']}),
        triggername: flags.string({char: 'n', description: messages.getMessage('triggername'), required: true}),
        sobject: flags.string({char: 's', description: messages.getMessage('sobject'), default: 'SOBJECT' }),
        template: flags.string({char: 't', description: messages.getMessage('template'), default: 'ApexTrigger'})
    };

    public async run(): Promise<AnyJson> {
        // tslint:disable-next-line:no-unused-expression
        if (this.flags.outputdir === process.cwd()) {
            this.log(path.join(process.cwd()));
          } else {
            this.log(path.join(process.cwd(), this.flags.outputdir));
          }

        const yeoman = require('yeoman-environment');
        const env = yeoman.createEnv();
        env.registerStub(ApexTriggerGenerator, 'apextriggergenerator');
        return env.run('apextriggergenerator', this.flags);
    }
}
