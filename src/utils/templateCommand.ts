/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
// tslint:disable-next-line:no-var-requires
const yeomanGenerator = require('yeoman-generator');
import { ForceGeneratorAdapter } from './adapter';
import * as path from 'path';
import { CreateOutput } from './types';
// tslint:disable-next-line:no-var-requires
const yeoman = require('yeoman-environment');
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');

export abstract class TemplateCommand extends SfdxCommand {
  // tslint:disable-next-line:no-any
  abstract run(): Promise<AnyJson>;

  public async runGenerator(generator: typeof yeomanGenerator) {
    // tslint:disable-next-line:no-unused-expression
    if (!this.flags.apiversion) {
      this.flags.apiversion = this.getDefaultApiVersion();
    }

    const adapter = new ForceGeneratorAdapter();
    const env = yeoman.createEnv(undefined, undefined, adapter);
    env.registerStub(generator, 'generator');

    const result = await env.run('generator', this.flags);
    const targetDir = path.resolve(this.flags.outputdir);

    // tslint:disable-next-line:no-unused-expression
    if (this.flags.json) {
      return this.buildJson(adapter, targetDir);
    } else {
      this.log(messages.getMessage('targetDirOutput', [targetDir]));
      this.log(adapter.log.getOutput());
      return result;
    }
  }

  public getDefaultApiVersion(): string {
    const versionTrimmed = require('../../package.json').version.trim();
    return `${versionTrimmed.split('.')[0]}.0`;
  }

  public buildJson(
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
}
