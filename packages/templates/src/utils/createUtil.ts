/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
import * as yeoman from 'yeoman-environment';
import { nls } from '../i18n';

/* tslint:disable:no-unused-expression */

export class CreateUtil {
  public static checkInputs(flagValue: string) {
    const alphaRegExp = /^\w+$/;

    if (!alphaRegExp.test(flagValue)) {
      throw new Error(nls.localize('AlphaNumericNameError'));
    }
    const letterStartRegExp = /^[A-Za-z]/;

    if (!letterStartRegExp.test(flagValue)) {
      throw new Error(nls.localize('NameMustStartWithLetterError'));
    }
    const endUnderscore = /_$/;
    if (endUnderscore.test(flagValue)) {
      throw new Error(nls.localize('EndWithUnderscoreError'));
    }
    const dblUnderscore = /__/;
    if (dblUnderscore.test(flagValue)) {
      throw new Error(nls.localize('DoubleUnderscoreError'));
    }
    return '';
  }

  // TODO: switch filetype to a string instead of regex
  public static getCommandTemplatesForFiletype(
    filetype: RegExp,
    command: string
  ): string[] {
    const files = fs
      .readdirSync(path.resolve(__dirname, '..', 'templates', command))
      .filter(file => filetype.test(file))
      .map(file => {
        return file.split('.', 1).toString();
      });
    return files;
  }
}
