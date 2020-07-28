/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Messages } from '@salesforce/core';
import * as path from 'path';
import * as Generator from 'yeoman-generator';
import { OptionsMap } from '../utils/types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');

export default class LightningTestGenerator extends Generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'lightningtest'));
    // @ts-ignore
    this.conflicter.force = false;
  }
  public writing() {
    const { template, outputdir, testname, internal } = this.options;
    // tslint:disable-next-line:no-unused-expression
    if (!internal) {
      this.fs.copyTpl(
        this.templatePath('_staticresource.resource-meta.xml'),
        this.destinationPath(
          path.join(outputdir, `${testname}.resource-meta.xml`)
        ),
        {
          description: messages.getMessage('LightningTest')
        },
        { apiName: testname }
      );
    }
    this.fs.copyTpl(
      this.templatePath(`${template}.resource`),
      this.destinationPath(path.join(outputdir, `${testname}.resource`)),
      { apiName: testname }
    );
  }
}
