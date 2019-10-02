/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';

const generator = require('yeoman-generator');
import { ForceGeneratorAdapter } from './adapter';
import * as path from 'path';
import { CreateUtil } from './createUtil';
const yeoman = require('yeoman-environment');
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');

export class SfdxCommandBase extends SfdxCommand {
  run(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public async runGenerator(generatorname: typeof generator) {
    if (!this.flags.apiversion) {
      this.flags.apiversion = CreateUtil.getDefaultApiVersion();
    }

    const adapter = new ForceGeneratorAdapter();
    const env = yeoman.createEnv(undefined, undefined, adapter);
    env.registerStub(generatorname, 'generator');

    const result = await env.run('generator', this.flags);
    const targetDir = path.resolve(this.flags.outputdir);

    if (this.flags.json) {
      return CreateUtil.buildJson(adapter, targetDir);
    } else {
      this.log(messages.getMessage('targetDirOutput', [targetDir]));
      this.log(adapter.log.getOutput());
      return result;
    }
  }
}
