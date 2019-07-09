import { Messages } from '@salesforce/core';
import * as fs from 'fs';
import * as path from 'path';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages(
  'force-language-services',
  'apextrigger'
);

export class CreateUtil {
  public static checkInputs(flagValue) {
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

  public static getTemplates(filetype, directory) {
    const files = fs
      .readdirSync(path.join(directory, 'templates'))
      .filter(file => filetype.test(file))
      .map(file => {
        return file.split('.', 1).toString();
      });
    return files;
  }

  public static printOutputDir(outputdir, currentdir) {
    // tslint:disable-next-line:no-unused-expression
    if (outputdir === currentdir) {
      return path.join(currentdir);
    } else {
      return path.join(currentdir, outputdir);
    }
  }
}
