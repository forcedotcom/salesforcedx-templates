/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
