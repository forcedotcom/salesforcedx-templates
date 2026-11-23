/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { describe, expect, it, vi } from 'vitest';
import { type TemplateOptions } from '../../src';
import { BaseGenerator, getDefaultApiVersion, validateCustomTemplate } from '../../src/generators/baseGenerator';

describe('BaseGenerator', () => {
  const API_VERSION = getDefaultApiVersion();
  interface MyTemplateOptions extends TemplateOptions {
    customProp: boolean;
  }
  class MyGenerator extends BaseGenerator<MyTemplateOptions> {
    public validateOptions() {}
    public async generate() {
      this.doWriting({
        ...this.options,
        apiversion: this.apiversion,
        outputdir: this.outputdir
      });
    }
    public doWriting(options: MyTemplateOptions) {}
  }
  const mockMyGeneratorOptions: MyTemplateOptions = {
    customProp: true
  };

  it('should set default api version and output dir', async () => {
    const doWritingStub = vi.spyOn(MyGenerator.prototype, 'doWriting').mockImplementation(() => {});

    const generator = new MyGenerator(mockMyGeneratorOptions);
    await generator.generate();

    expect(doWritingStub.mock.calls[0][0]).to.deep.equal({
      apiversion: API_VERSION,
      outputdir: process.cwd(),
      customProp: true
    });
  });

  it('should call validate options', () => {
    const validateOptionsStub = vi.spyOn(MyGenerator.prototype, 'validateOptions').mockImplementation(() => {});

    new MyGenerator(mockMyGeneratorOptions);
    expect(validateOptionsStub).toHaveBeenCalledTimes(1);
  });
});

describe('validateCustomTemplate', () => {
  it('should allow safe interpolation-only templates', () => {
    const template = 'public class <%= apiName %> {\n}';
    expect(() => validateCustomTemplate(template, 'test.cls')).to.not.throw();
  });

  it('should allow safe control flow in scriptlet tags', () => {
    const template = '<% if (primaryField) { %>\n<%= primaryField %>\n<% } %>';
    expect(() => validateCustomTemplate(template, 'test.xml')).to.not.throw();
  });

  it('should allow forEach loops', () => {
    const template = '<% fields.forEach((field) => { %>\n<%= field %>\n<% }); %>';
    expect(() => validateCustomTemplate(template, 'test.xml')).to.not.throw();
  });

  it('should block require() calls', () => {
    const template = '<% require("child_process").execSync("calc") %>';
    expect(() => validateCustomTemplate(template, 'malicious.cls')).to.throw('disallowed code');
  });

  it('should block dynamic import()', () => {
    const template = '<% const m = await import("fs") %>';
    expect(() => validateCustomTemplate(template, 'malicious.cls')).to.throw('disallowed code');
  });

  it('should block process.env access', () => {
    const template = '<% process.env.SECRET %>';
    expect(() => validateCustomTemplate(template, 'malicious.cls')).to.throw('disallowed code');
  });

  it('should block eval()', () => {
    const template = '<% eval("malicious code") %>';
    expect(() => validateCustomTemplate(template, 'malicious.cls')).to.throw('disallowed code');
  });

  it('should block Function constructor', () => {
    const template = '<% Function("return process")() %>';
    expect(() => validateCustomTemplate(template, 'malicious.cls')).to.throw('disallowed code');
  });

  it('should block execSync', () => {
    const template = '<% execSync("whoami") %>';
    expect(() => validateCustomTemplate(template, 'malicious.cls')).to.throw('disallowed code');
  });

  it('should block globalThis access', () => {
    const template = '<% globalThis.process %>';
    expect(() => validateCustomTemplate(template, 'malicious.cls')).to.throw('disallowed code');
  });

  it('should block require() in output tags (<%= %>)', () => {
    const template = '<%= require("child_process").execSync("whoami").toString() %>';
    expect(() => validateCustomTemplate(template, 'malicious.cls')).to.throw('disallowed code');
  });

  it('should block require() in unescaped output tags (<%- %>)', () => {
    const template = '<%- require("fs").readFileSync("/etc/passwd","utf8") %>';
    expect(() => validateCustomTemplate(template, 'malicious.cls')).to.throw('disallowed code');
  });

  it('should block constructor chain prototype traversal', () => {
    const template = '<% this.constructor.constructor("return process")() %>';
    expect(() => validateCustomTemplate(template, 'malicious.cls')).to.throw('disallowed code');
  });

  it('should not flag safe output tags', () => {
    const template = '<%= apiName %>';
    expect(() => validateCustomTemplate(template, 'test.cls')).to.not.throw();
  });

  it('should not flag comment tags', () => {
    const template = '<%# require("fs") %>';
    expect(() => validateCustomTemplate(template, 'test.cls')).to.not.throw();
  });
});
