/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { LightningTestOptions } from '../utils/types';
import { SfdxGenerator } from './sfdxGenerator';

export default class LightningTestGenerator extends SfdxGenerator<
  LightningTestOptions
> {
  constructor(args: string | string[], options: LightningTestOptions) {
    super(args, options);
    this.sourceRootWithPartialPath('lightningtest');
  }

  public validateOptions() {
    CreateUtil.checkInputs(this.options.testname);
    CreateUtil.checkInputs(this.options.template);
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
          description: nls.localize('LightningTest')
        },
        // @ts-ignore
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
