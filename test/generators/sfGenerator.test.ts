/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { TemplateOptions } from '../../src';
import { SfGenerator } from '../../src/generators/sfGenerator';

function getDefaultApiVersion(): string {
  const packageJsonPath = path.join('..', '..', 'package.json');
  const versionTrimmed = require(packageJsonPath).salesforceApiVersion.trim();
  return `${versionTrimmed.split('.')[0]}.0`;
}

describe('SfGenerator', () => {
  const API_VERSION = getDefaultApiVersion();
  interface MyTemplateOptions extends TemplateOptions {
    customProp: boolean;
  }
  class MyGenerator extends SfGenerator<MyTemplateOptions> {
    public validateOptions() {}
    public async generate() {
      this.doWriting({
        ...this.options,
        apiversion: this.apiversion,
        outputdir: this.outputdir,
      });
    }
    public doWriting(options: MyTemplateOptions) {}
  }
  const mockMyGeneratorOptions: MyTemplateOptions = {
    customProp: true,
  };

  afterEach(() => {
    sinon.restore();
  });

  it('should set default api version and output dir', async () => {
    const doWritingStub = sinon.stub(MyGenerator.prototype, 'doWriting');

    const generator = new MyGenerator(mockMyGeneratorOptions);
    await generator.generate();

    expect(doWritingStub.firstCall.firstArg).to.deep.equal({
      apiversion: API_VERSION,
      outputdir: process.cwd(),
      customProp: true,
    });
  });

  it('should call validate options', () => {
    const validateOptionsStub = sinon.stub(
      MyGenerator.prototype,
      'validateOptions'
    );

    new MyGenerator(mockMyGeneratorOptions);
    expect(validateOptionsStub.calledOnce).to.be.true;
  });
});
