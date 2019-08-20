/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Messages } from '@salesforce/core';
import * as fs from 'fs';
import * as path from 'path';
import * as yeoman from 'yeoman-environment';
import { ForceGeneratorAdapter } from './adapter';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');
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

  public static makeEmptyFolders(toplevelfolders, metadatafolders) {
    let oldfolder = '';
    for (const folder of toplevelfolders) {
      if (!fs.existsSync(path.join(oldfolder, folder))) {
        fs.mkdirSync(path.join(oldfolder, folder));
        oldfolder = path.join(oldfolder, folder);
      }
    }
    for (const newfolder of metadatafolders) {
      if (!fs.existsSync(path.join(oldfolder, newfolder))) {
        fs.mkdirSync(path.join(oldfolder, newfolder));
      }
    }
    return;
  }

  public static async runGenerator(generatorname, command) {
    const adapter = new ForceGeneratorAdapter('hello');
    const env = yeoman.createEnv(undefined, undefined, adapter);
    env.registerStub(generatorname, 'generator');
    const result = await env.run('generator', command.flags);
    command.log(`target dir = ${path.resolve(command.flags.outputdir)}`);
    if (command.isJson) {
      const createdFiles = this.getCreatedFiles(adapter.log.getOutput());
      return createdFiles;
    } else {
      return result;
    }
  }

  public static getCreatedFiles(rawOutput: string): string[] {
    let createdFiles: string[];
    let createExp: RegExp = new RegExp(
      '(\\n\\s+)(create\\s+|identical\\s+|force\\s+)(.*)',
      'mig'
    );
    let result: RegExpExecArray | null = createExp.exec(rawOutput);
    while (result) {
      createdFiles.push(result[3]);
      result = createExp.exec(rawOutput);
    }
    return createdFiles;
  }
}
