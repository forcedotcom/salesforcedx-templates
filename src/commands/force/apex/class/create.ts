import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import ApexClassGenerator from '../../../../apexClassGenerator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'apexclass');

export default class ApexClass extends SfdxCommand {
  public static examples = [
    '$ sfdx force:apex:class:create -n MyClass',
    '$ sfdx force:apex:class:create -n MyClass -d classes'
  ];

  public static description = messages.getMessage('commandDescription');

  protected static flagsConfig = {
    classname: flags.string({char: 'n', description: messages.getMessage('nameFlagDescription'), required: true}),
    outputdir: flags.string({char: 'd', description: messages.getMessage('outputdir'), required: false, default: process.cwd()}),
    // Need to fix the apiversion flag with default and optional inputs
    // apiversion: flags.string({char: 'a', description: messages.getMessage('outputdir'), options: ['46.0', '45.0'], default: '45.0'}),
    apiversion: flags.builtin(),
    template: flags.string({char: 't', description: messages.getMessage('template'), default: 'DefaultApexClass', options: ['DefaultApexClass', 'ApexException', 'ApexUnitTest', 'InboundEmailService']})
    };

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
      this.checkInputs(this.flags.classname);
      this.checkInputs(this.flags.template);

      // tslint:disable-next-line:no-unused-expression
      if (this.flags.outputdir === process.cwd()) {
        this.log(path.join(process.cwd()));
      } else {
        this.log(path.join(process.cwd(), this.flags.outputdir));
      }

      const yeoman = require('yeoman-environment');
      const env = yeoman.createEnv();
      env.registerStub(ApexClassGenerator, 'apexclassgenerator');
      return env.run('apexclassgenerator', this.flags);
    }
}
