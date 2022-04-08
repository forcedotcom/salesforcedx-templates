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
import * as YeomanEnvironment from 'yeoman-environment';

describe('SfdxGenerator', () => {
  interface MyTemplateOptions extends TemplateOptions {
    // env and resolved are for testing (similar to how yeoman environment instantiates the generators)
    env: object;
    resolved: string;
  }
  class MyGenerator extends SfdxGenerator<MyTemplateOptions> {
    public validateOptions() {}
    public writing() {
      this.doWriting(this.options);
    }
    public doWriting(options: object) {}
  }
  const testEnv = YeomanEnvironment.createEnv();
  testEnv.cwd = process.cwd();
  const mockMyGeneratorOptions = {
    env: testEnv,
    resolved: path.resolve('../../')
  };

  it('should set default api version and output dir', () => {
    const doWritingStub = stub(MyGenerator.prototype, 'doWriting');
    const generator = new MyGenerator([], mockMyGeneratorOptions);
    generator.writing();
    assert.calledWith(
      doWritingStub,
      match({
        apiversion: '54.0',
        outputdir: process.cwd()
      })
    );
    doWritingStub.restore();
  });

  it('should call validate options', () => {
    const validateOptionsStub = stub(MyGenerator.prototype, 'validateOptions');
    // tslint:disable-next-line:no-unused-expression
    new MyGenerator([], mockMyGeneratorOptions);
    assert.calledOnce(validateOptionsStub);
  });
});
