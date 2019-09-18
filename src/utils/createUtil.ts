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
// @ts-ignore
import * as yeoman from 'yeoman-environment';
import { ForceGeneratorAdapter } from './adapter';
import { CreateOutput } from './types';
import * as generator from '../../node_modules/@types/yeoman-generator';

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

  public static async runGenerator(
    generatorname: generator,
    command: SfdxCommand
  ) {
    if (!command.flags.apiversion) {
      command.flags.apiversion = CreateUtil.getDefaultApiVersion();
    }

    const adapter = new ForceGeneratorAdapter();
    const env = yeoman.createEnv(undefined, undefined, adapter);
    env.registerStub(generatorname, 'generator');

    const result = await env.run('generator', command.flags);
    const targetDir = path.resolve(command.flags.outputdir);

    if (command.isJson) {
      return this.buildJson(adapter, targetDir);
    } else {
      command.log(messages.getMessage('targetDirOutput', [targetDir]));
      command.log(adapter.log.getOutput());
      return result;
    }
  }

  public static buildJson(
    adapter: ForceGeneratorAdapter,
    targetDir: string
  ): CreateOutput {
    const cleanOutput = adapter.log.getCleanOutput();
    const rawOutput = `target dir = ${targetDir}\n${adapter.log.getOutput()}`;
    const output = {
      outputDir: targetDir,
      created: cleanOutput,
      rawOutput
    };
    return output;
  }

  public static getDefaultApiVersion(): string {
    const versionTrimmed = require('../../package.json').version.trim();
    return `${versionTrimmed.split('.')[0]}.0`;
  }
}
