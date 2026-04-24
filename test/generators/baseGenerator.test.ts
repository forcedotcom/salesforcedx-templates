/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { TemplateOptions } from '../../src/index';
import {
  BaseGenerator,
  getDefaultApiVersion,
} from '../../src/generators/baseGenerator';

describe('BaseGenerator', () => {
  const API_VERSION = getDefaultApiVersion();
  type MyTemplateOptions = {
    customProp: boolean;
  } & TemplateOptions;
  class MyGenerator extends BaseGenerator<MyTemplateOptions> {
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
    vi.restoreAllMocks();
  });

  it('should set default api version and output dir', async () => {
    const doWritingStub = vi
      .spyOn(MyGenerator.prototype, 'doWriting')
      .mockImplementation(() => {});

    const generator = new MyGenerator(mockMyGeneratorOptions);
    await generator.generate();

    expect(doWritingStub.mock.calls[0][0]).toEqual({
      apiversion: API_VERSION,
      outputdir: process.cwd(),
      customProp: true,
    });
  });

  it('should call validate options', () => {
    const validateOptionsStub = vi
      .spyOn(MyGenerator.prototype, 'validateOptions')
      .mockImplementation(() => {});

    new MyGenerator(mockMyGeneratorOptions);
    expect(validateOptionsStub).toHaveBeenCalledOnce();
  });
});
