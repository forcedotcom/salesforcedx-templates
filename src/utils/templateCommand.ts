/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
// @ts-ignore
import * as yeoman from 'yeoman-environment';
import * as yeomanGenerator from 'yeoman-generator';
import { ForceGeneratorAdapter } from './adapter';
import { MessageUtil } from './messageUtil';
import { CreateOutput } from './types';

// tslint:disable-next-line: no-var-requires
// const yeoman = require('yeoman-environment');

export abstract class TemplateCommand extends SfdxCommand {
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

  public abstract run(): Promise<AnyJson>;

  public async runGenerator(generator: typeof yeomanGenerator) {
    // Can't specify a default value the normal way for apiversion, so set it here
    if (!this.flags.apiversion) {
      this.flags.apiversion = TemplateCommand.getDefaultApiVersion();
    }

    const adapter = new ForceGeneratorAdapter();
    const env = yeoman.createEnv(undefined, undefined, adapter);
    env.registerStub(generator, 'generator');

    const result = await env.run('generator', this.flags);
    const targetDir = path.resolve(this.flags.outputdir);
    if (this.flags.json) {
      return TemplateCommand.buildJson(adapter, targetDir);
    } else {
      this.log(MessageUtil.get('TargetDirOutput', [targetDir]));
      this.log(adapter.log.getOutput());
      return result;
    }
  }
}
