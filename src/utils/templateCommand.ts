/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// tslint:disable:no-var-requires
// tslint:disable:no-unused-expression

import { SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { ForceGeneratorAdapter } from './adapter';
import * as path from 'path';
import { CreateOutput } from './types';
import { MessageUtil } from './messageUtil';

const yeoman = require('yeoman-environment');
const yeomanGenerator = require('yeoman-generator');

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
    const { apiversion, outputdir } = this.flags;
    if (!apiversion) {
      this.flags.apiversion = TemplateCommand.getDefaultApiVersion();
    }
    if (outputdir === MessageUtil.get('OutputDirDefaultDescription')) {
      this.flags.outputdir = process.cwd();
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
