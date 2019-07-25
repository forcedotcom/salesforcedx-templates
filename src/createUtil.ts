import { Messages } from '@salesforce/core';
import * as fs from 'fs';
import * as path from 'path';
import * as yeoman from 'yeoman-environment';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'messages');
/* tslint:disable:no-unused-expression */
export class CreateUtil {
  public static checkInputs(flagValue) {
    const alphaRegExp = /^\w+$/;

    if (!alphaRegExp.test(flagValue)) {
      throw new Error(messages.getMessage('AlphaNumericNameError'));
    }
    const letterStartRegExp = /^[A-Za-z]/;

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
  public static getCommandTemplatesForFiletype(filetype, command) {
    const files = fs
      .readdirSync(path.join(__dirname, 'templates', command))
      .filter(file => filetype.test(file))
      .map(file => {
        return file.split('.', 1).toString();
      });
    return files;
  }

  public static runGenerator(generatorname, args) {
    const env = yeoman.createEnv();
    env.registerStub(generatorname, 'generator');
    return env.run('generator', args);
  }
}
