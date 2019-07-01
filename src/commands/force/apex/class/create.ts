import { flags, SfdxCommand } from '@salesforce/command';
// import { optionalBuiltinFlags } from '@salesforce/command/lib/sfdxFlags';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import ApexClassGenerator from '../../../../apexClassGenerator';

// Loading the apex class messages.
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'apexclass');

export default class ApexClass extends SfdxCommand {
  // display apex class create examples.
  public static examples = [
    '$ sfdx force:apex:class:create -n MyClass',
    '$ sfdx force:apex:class:create -n MyClass -d classes'
  ];

  // Display the description for the help flag.
  public static description = messages.getMessage('commandDescription');
  // All flags:
  protected static flagsConfig = {
    classname: flags.string({char: 'n', description: messages.getMessage('nameFlagDescription'), required: true}),
    outputdir: flags.string({char: 'd', description: messages.getMessage('outputdir'), required: false, default: process.cwd()}),
    // apiversion: flags.string({char: 'a', description: messages.getMessage('outputdir'), options: ['46.0', '45.0'], default: '45.0'}),
    apiversion: flags.builtin(),
    template: flags.string({char: 't', description: messages.getMessage('template'), default: 'DefaultApexClass', options: ['DefaultApexClass', 'ApexException', 'ApexUnitTest', 'InboundEmailService']})
    };

  // Check inputs are valid.
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

    // Execute apex class create generator with flags as arguments.
    public async run(): Promise<AnyJson> {
      this.checkInputs(this.flags.classname);

      // Object.keys(this.flags).forEach(flag => {
      //   this.checkInputs(flag);
      // });

      const yeoman = require('yeoman-environment');
      const env = yeoman.createEnv();

      env.registerStub(ApexClassGenerator, 'apexclassgenerator');
      this.log(path.join(process.cwd()));
      return env.run('apexclassgenerator', this.flags);
    }
}
