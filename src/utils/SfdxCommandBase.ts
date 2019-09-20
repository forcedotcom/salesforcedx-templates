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

  public async runGenerator(generatorname: typeof generator, command: any) {
    if (!command.flags.apiversion) {
      command.flags.apiversion = CreateUtil.getDefaultApiVersion();
    }

    const adapter = new ForceGeneratorAdapter();
    const env = yeoman.createEnv(undefined, undefined, adapter);
    env.registerStub(generatorname, 'generator');

    const result = await env.run('generator', command.flags);
    const targetDir = path.resolve(command.flags.outputdir);

    if (command.isJson) {
      return CreateUtil.buildJson(adapter, targetDir);
    } else {
      command.log(messages.getMessage('targetDirOutput', [targetDir]));
      command.log(adapter.log.getOutput());
      return result;
    }
  }
}
