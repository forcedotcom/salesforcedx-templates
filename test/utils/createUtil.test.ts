/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Messages } from '@salesforce/core';
import { assert, expect } from 'chai';
import * as fs from 'fs';
import { resolve } from 'path';
import {
  createSandbox,
  SinonStub,
  stub,
  SinonSandbox,
  sandbox,
  spy
} from 'sinon';
import ApexClassGenerator from '../../src/generators/apexClassGenerator';
import {
  CreateUtil,
  ForceGeneratorAdapter,
  Log,
  SfdxCommandBase
} from '../../src/utils';
import { test } from '@salesforce/command/lib/test';
import * as path from 'path';
import * as yeomanAssert from 'yeoman-assert';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');

/* tslint:disable: no-unused-expression */
describe('CreateUtil', () => {
  describe('checkInputs', () => {
    it('should throw error for input with non-alphanumeric characters', () => {
      assertErrorThrown('test!@#$%^&*()_+-=', 'AlphaNumericNameError');
    });

    it('should throw error for input that does not start with a letter', () => {
      assertErrorThrown('5test', 'NameMustStartWithLetterError');
    });

    it('should throw error for input that ends with an underscore', () => {
      assertErrorThrown('test_', 'EndWithUnderscoreError');
    });

    it('should throw error for input that contains a double underscore', () => {
      assertErrorThrown('test__c', 'DoubleUnderscoreError');
    });

    const assertErrorThrown = (input: string, errorName: string) => {
      try {
        CreateUtil.checkInputs(input);
        assert.fail(`Expected checkInputs to throw ${errorName} error.`);
      } catch (e) {
        expect(e.message).to.equal(messages.getMessage(errorName));
      }
    };
  });

  describe('getCommandTemplatesForFiletype', () => {
    const templateType = 'apexclass';
    const templatesPath = resolve(
      __dirname,
      '../../src/templates',
      templateType
    );

    let readdirStub: SinonStub;

    beforeEach(() => {
      // @ts-ignore
      readdirStub = stub(fs, 'readdirSync');
    });

    afterEach(() => readdirStub.restore());

    it('should get template names for a given file suffix and folder name', () => {
      readdirStub
        .withArgs(templatesPath)
        .returns(['Template.cls', 'Template2.cls']);

      assertTemplateNames(['Template', 'Template2']);
    });

    it('should ignore files that do not have the given suffix', () => {
      readdirStub
        .withArgs(templatesPath)
        .returns(['Template.cls', '_class.cls-meta.xml']);

      assertTemplateNames(['Template']);
    });

    const assertTemplateNames = (names: string[]) => {
      const templates = CreateUtil.getCommandTemplatesForFiletype(
        /.cls$/,
        templateType
      );
      expect(templates).to.eql(names);
    };
  });

  describe('getDefaultApiVersion', () => {
    it('should parse apiVersion using the major version number of the package.json', () => {
      const { version } = require('../../package.json');
      expect(version).to.not.be.undefined;
      const major = version.trim().split('.')[0];
      expect(CreateUtil.getDefaultApiVersion()).to.equal(`${major}.0`);
    });
  });

  describe('buildJson', () => {
    it('should build json output in the correct format', () => {
      const adapter = new ForceGeneratorAdapter();
      const targetDir = resolve('src', 'templates', 'output');
      const cleanOutput = ['testClass.cls', 'testClass.cls-meta.xml'];
      const rawOutput =
        'create testClass.cls\n create testClass.cls-meta.xml\n';
      const cleanOutputStub = stub(Log.prototype, 'getCleanOutput').returns(
        cleanOutput
      );
      const outputStub = stub(Log.prototype, 'getOutput').returns(rawOutput);
      const targetDirOutput = `target dir = ${targetDir}\n${rawOutput}`;

      const expOutput = {
        outputDir: targetDir,
        created: cleanOutput,
        rawOutput: targetDirOutput
      };

      const result = CreateUtil.buildJson(adapter, targetDir);
      expect(result).to.eql(expOutput);
      cleanOutputStub.restore();
      outputStub.restore();
    });
  });

  describe('runGenerator', () => {
    let messageStub = spy(messages, 'getMessage');
    // let jsonSpy = spy(CreateUtil, 'buildJson');

    test
      .withOrg()
      .withProject()
      .stdout()
      .command(['force:apex:class:create', '--classname', 'foo'])
      .it('should log output when json flag is not specified', () => {
        // expect(jsonSpy.called).to.be.false;
        // jsonSpy.restore();
        expect(messageStub.called).to.be.true;
        messageStub.restore();
      });

    let jsonStub = spy(CreateUtil, 'buildJson');

    test
      .withOrg()
      .withProject()
      .stdout()
      .command(['force:apex:class:create', '--classname', 'foo', '--json'])
      .it('should build json output when flag is specified', ctx => {
        console.log('test reached here');
        expect(jsonStub.calledOnce).to.be.true;
        jsonStub.restore();
        expect(messageStub.called).to.be.false;
        messageStub.restore();
      });
  });
});
