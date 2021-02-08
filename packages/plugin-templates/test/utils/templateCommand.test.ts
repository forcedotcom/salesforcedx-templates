/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { test } from '@salesforce/command/lib/test';
import { ConfigAggregator, SfdxProject } from '@salesforce/core';
import { ForceGeneratorAdapter, Log } from '@salesforce/templates/lib/utils';

import { expect } from 'chai';
import * as path from 'path';
import { createSandbox, SinonSandbox, stub } from 'sinon';
import { TemplateCommand } from '../../src/utils';

const SFDX_PROJECT_PATH = 'test-sfdx-project';
const TEST_USERNAME = 'test@example.com';
const projectPath = path.resolve(SFDX_PROJECT_PATH);
const sfdxProjectJson = {
  packageDirectories: [{ path: 'force-app', default: true }],
  namespace: '',
  sfdcLoginUrl: 'https://login.salesforce.com',
  sourceApiVersion: '49.0'
};

/* tslint:disable: no-unused-expression */
describe('TemplateCommand', () => {
  let sandboxStub: SinonSandbox;

  beforeEach(async () => {
    sandboxStub = createSandbox();
    sandboxStub.stub(SfdxProject, 'resolve').returns(
      Promise.resolve(({
        getPath: () => projectPath,
        resolveProjectConfig: () => sfdxProjectJson
      } as unknown) as SfdxProject)
    );
  });

  afterEach(() => {
    sandboxStub.restore();
  });

  describe('getDefaultApiVersion', () => {
    it('should parse apiVersion using the major version number of the package.json', async () => {
      const { version } = require('../../package.json');
      expect(version).to.not.be.undefined;
      const major = version.trim().split('.')[0];
      const apiVersion = await TemplateCommand.getApiVersion();
      expect(apiVersion).to.equal(`${major}.0`);
    });

    it('should parse apiVersion using the value from the ConfigAggregator', async () => {
      const configStub = stub(
        ConfigAggregator.prototype,
        'getPropertyValue'
      ).returns('50.0');
      const apiVersion = await TemplateCommand.getApiVersion();
      expect(apiVersion).to.equal('50.0');
      configStub.restore();
    });
  });

  describe('buildJson', () => {
    it('should build json output in the correct format', () => {
      const adapter = new ForceGeneratorAdapter();
      const targetDir = path.resolve('src', 'templates', 'output');
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

      const result = TemplateCommand.buildJson(adapter, targetDir);
      expect(result).to.eql(expOutput);
      cleanOutputStub.restore();
      outputStub.restore();
    });
  });

  describe('runGenerator', () => {
    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command(['force:apex:class:create', '--classname', 'foo'])
      .it('should log basic output when json flag is not specified', output => {
        const dir = process.cwd();
        const expectedOutput = `target dir = ${dir}\nidentical foo.cls\nidentical foo.cls-meta.xml\n\n`;
        expect(output.stdout).to.equal(expectedOutput);
      });

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command(['force:apex:class:create', '--classname', 'foo', '--json'])
      .it('should log json output when flag is specified', output => {
        const dir = process.cwd();
        const jsonOutput = JSON.parse(output.stdout);
        expect(jsonOutput).to.haveOwnProperty('status');
        expect(jsonOutput.status).to.equal(0);
        expect(jsonOutput).to.haveOwnProperty('result');
        expect(jsonOutput.result).to.be.an('object');
        expect(jsonOutput.result).to.haveOwnProperty('outputDir');
        expect(jsonOutput.result.outputDir).to.equal(dir);
        expect(jsonOutput.result).to.haveOwnProperty('created');
        expect(jsonOutput.result.created).to.be.an('array').that.is.empty;
        expect(jsonOutput.result).to.haveOwnProperty('rawOutput');
        expect(jsonOutput.result.rawOutput).to.equal(
          `target dir = ${dir}\nidentical foo.cls\nidentical foo.cls-meta.xml\n`
        );
      });
  });
});
