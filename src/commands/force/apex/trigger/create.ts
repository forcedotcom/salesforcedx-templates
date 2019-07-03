import { flags, SfdxCommand} from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as fs from 'fs';
import * as path from 'path';
import ApexTriggerGenerator from '../../../../apexTriggerGenerator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'apextrigger');
const triggerfile = /.trigger$/;
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
        template: flags.string({char: 't', description: messages.getMessage('template'), default: 'ApexTrigger', options: ApexTrigger.getTemplates()})
    };
    private static getTemplates() {
      const files =  fs.readdirSync(path.join(__dirname, 'templates'))
      .filter( file => triggerfile.test(file)).map(file => {
          return file.split('.', 1).toString();
      });
      return files;
    }
    public checkInputs(flagValue) {
      const alphaRegExp = /^\w+$/;
      // tslint:disable-next-line:no-unused-expression
      if (!alphaRegExp.test(flagValue)) {
        throw new Error(messages.getMessage('AlphaNumericNameError'));
      }
      const letterStartRegExp = /^[A-Za-z]/;
      // tslint:disable-next-line:no-unused-expression
      if (!letterStartRegExp.test(flagValue)) {
        throw new Error(messages.getMessage('NameMustStartWithLetterError'));
      }
      const endUnderscore = /_$/;
      if (endUnderscore.test(flagValue)) {
        throw new Error(messages.getMessage('EndWithUnderscoreError'));
      }
      const dblUnderscore = /__/;
      if (dblUnderscore.test(flagValue)) {
        throw new Error(messages.getMessage('DoubleUnderscoreError'));
      }
      return '';
    }
    public async run(): Promise<AnyJson> {
      this.checkInputs(this.flags.triggername);
      this.checkInputs(this.flags.template);  
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
