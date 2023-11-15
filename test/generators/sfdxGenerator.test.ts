/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { assert, match, stub } from 'sinon';
import { TemplateOptions } from '../../';
import { SfdxGenerator } from '../../src/generators/sfdxGenerator';
import { TemplateService } from '../../src';
import * as YeomanEnvironment from 'yeoman-environment';

describe('SfdxGenerator', () => {
  const API_VERSION_STUB = '50';
  interface MyTemplateOptions extends TemplateOptions {
    // env and resolved are for testing (similar to how yeoman environment instantiates the generators)
    env: YeomanEnvironment;
    resolved: string;
  }
  class MyGenerator extends SfdxGenerator<MyTemplateOptions> {
    public validateOptions() {}
    public writing() {
      this.doWriting({
        ...this.options,
        apiversion: this.apiversion,
        outputdir: this.outputdir,
      });
    }
    public doWriting(options: MyTemplateOptions) {}
  }
  const testEnv = YeomanEnvironment.createEnv();
  testEnv.cwd = process.cwd();
  const mockMyGeneratorOptions: MyTemplateOptions = {
    env: testEnv,
    resolved: path.resolve('../../'),
  };

  it('should set default api version and output dir', () => {
    const doWritingStub = stub(MyGenerator.prototype, 'doWriting');
    const getDefaultApiVersionStub = stub(
      TemplateService,
      'getDefaultApiVersion'
    ).returns(API_VERSION_STUB);
    const generator = new MyGenerator([], mockMyGeneratorOptions);
    generator.writing();
    assert.calledWith(
      doWritingStub,
      match({
        apiversion: API_VERSION_STUB,
        outputdir: process.cwd(),
      })
    );
    assert.calledOnce(getDefaultApiVersionStub);
    getDefaultApiVersionStub.restore();
    doWritingStub.restore();
  });

  it('should call validate options', () => {
    const validateOptionsStub = stub(MyGenerator.prototype, 'validateOptions');
    // tslint:disable-next-line:no-unused-expression
    new MyGenerator([], mockMyGeneratorOptions);
    assert.calledOnce(validateOptionsStub);
  });
});
