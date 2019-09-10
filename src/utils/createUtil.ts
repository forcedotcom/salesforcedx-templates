/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as fs from 'fs';
import * as path from 'path';
import * as yeoman from 'yeoman-environment';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');

/* tslint:disable:no-unused-expression */

export class CreateUtil {
  public static checkInputs(flagValue: string) {
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

  public static runGenerator(generatorname: any, command: any) {
    if (!command.flags.apiversion) {
      command.flags.apiversion = CreateUtil.getDefaultApiVersion();
    }

    const env = yeoman.createEnv();
    env.registerStub(generatorname, 'generator');
    const result = env.run('generator', command.flags);
    command.log(`target dir = ${path.resolve(command.flags.outputdir)}`);
    return {};
  }

  public static getDefaultApiVersion(): string {
    const versionTrimmed = require('../../package.json').version.trim();
    return `${versionTrimmed.split('.')[0]}.0`;
  }
}
