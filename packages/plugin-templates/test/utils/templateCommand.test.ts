/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { test } from '@salesforce/command/lib/test';
import { Config, ConfigAggregator } from '@salesforce/core';
import { ForceGeneratorAdapter, Log } from '@salesforce/templates/lib/utils';
import * as assert from 'yeoman-assert';

import { nls } from '@salesforce/templates/lib/i18n';
import { expect } from 'chai';
import * as path from 'path';
import { stub } from 'sinon';
import { TemplateCommand } from '../../src/utils';

/* tslint:disable: no-unused-expression */
describe('TemplateCommand', () => {
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
      ).callsFake((key: string) => {
        if (key === Config.API_VERSION) {
          return '50.0';
        }
      });
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
    const dir = process.cwd();
    test
      .withOrg()
      //.withProject()
      .stdout()
      .command(['force:apex:class:create', '--classname', 'foo'])
      .it('should log basic output when json flag is not specified', output => {
        const expectedOutput = `target dir = ${dir}\n conflict foo.cls\n    force foo.cls\nidentical foo.cls-meta.xml\n\n`;
        expect(output.stdout).to.equal(expectedOutput);
      });

    test
      .withOrg()
      //.withProject()
      .stdout()
      .command(['force:apex:class:create', '--classname', 'foo', '--json'])
      .it('should log json output when flag is specified', output => {
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

  describe('Custom templates', () => {
    const LOCAL_CUSTOM_TEMPLATES = path.join(
      __dirname,
      '../../../test/custom-templates'
    );
    const TEST_CUSTOM_TEMPLATES_REPO =
      'https://github.com/forcedotcom/salesforcedx-templates/tree/main/packages/templates/test/custom-templates';
    const NON_EXISTENT_LOCAL_PATH = 'this-folder-does-not-exist';
    const NON_EXISTENT_REPO =
      'https://github.com/forcedotcom/this-repo-does-not-exist';
    const INVALID_URL_REPO =
      'https://github.com/forcedotcom/salesforcedx-templates/invalid-url';
    const HTTP_REPO =
      'http://github.com/forcedotcom/salesforcedx-templates/tree/main/packages/templates/test/custom-templates';
    const GITLAB_REPO =
      'https://gitlab.com/forcedotcom/salesforcedx-templates/tree/main/packages/templates/test/custom-templates';

    test
      .withOrg()
      //.withProject()
      .stdout()
      .stub(ConfigAggregator.prototype, 'getPropertyValue', () => {
        return TEST_CUSTOM_TEMPLATES_REPO;
      })
      .command(['force:apex:class:create', '--classname', 'foo'])
      .it('should create custom template from git repo', ctx => {
        assert.file(['foo.cls', 'foo.cls-meta.xml']);
        assert.fileContent('foo.cls', 'public with sharing class Customfoo');
      });

    test
      .withOrg()
      //.withProject()
      .stdout()
      .stub(ConfigAggregator.prototype, 'getPropertyValue', () => {
        return TEST_CUSTOM_TEMPLATES_REPO;
      })
      .command([
        'force:lightning:component:create',
        '--componentname',
        'foo',
        '--outputdir',
        'lwc',
        '--type',
        'lwc'
      ])
      .it(
        'should create from default template if git repo templates do not have the template type',
        ctx => {
          assert.file(path.join('lwc', 'foo', 'foo.js-meta.xml'));
          assert.file(path.join('lwc', 'foo', 'foo.html'));
          assert.file(path.join('lwc', 'foo', 'foo.js'));
          assert.fileContent(
            path.join('lwc', 'foo', 'foo.js'),
            'export default class Foo extends LightningElement {}'
          );
        }
      );

    test
      .withOrg()
      //.withProject()
      .stdout()
      .stub(ConfigAggregator.prototype, 'getPropertyValue', () => {
        return LOCAL_CUSTOM_TEMPLATES;
      })
      .command(['force:apex:class:create', '--classname', 'foo'])
      .it('should create custom template from local folder', ctx => {
        assert.file(['foo.cls', 'foo.cls-meta.xml']);
        assert.fileContent('foo.cls', 'public with sharing class Customfoo');
      });

    test
      .withOrg()
      //.withProject()
      .stdout()
      .stub(ConfigAggregator.prototype, 'getPropertyValue', () => {
        return LOCAL_CUSTOM_TEMPLATES;
      })
      .command([
        'force:lightning:component:create',
        '--componentname',
        'foo',
        '--outputdir',
        'lwc',
        '--type',
        'lwc'
      ])
      .it(
        'should create from default template if local templates do not have the template type',
        ctx => {
          assert.file(path.join('lwc', 'foo', 'foo.js-meta.xml'));
          assert.file(path.join('lwc', 'foo', 'foo.html'));
          assert.file(path.join('lwc', 'foo', 'foo.js'));
          assert.fileContent(
            path.join('lwc', 'foo', 'foo.js'),
            'export default class Foo extends LightningElement {}'
          );
        }
      );

    test
      .withOrg()
      //.withProject()
      .stderr()
      .stub(ConfigAggregator.prototype, 'getPropertyValue', () => {
        return NON_EXISTENT_LOCAL_PATH;
      })
      .command(['force:apex:class:create', '--classname', 'foo'])
      .it('should throw error if local custom templates do not exist', ctx => {
        expect(ctx.stderr).to.contain(
          nls.localize('localCustomTemplateDoNotExist', NON_EXISTENT_LOCAL_PATH)
        );
      });

    test
      .withOrg()
      //.withProject()
      .stderr()
      .stub(ConfigAggregator.prototype, 'getPropertyValue', () => {
        return NON_EXISTENT_REPO;
      })
      .command(['force:apex:class:create', '--classname', 'foo'])
      .it('should throw error if cannot retrieve default branch', ctx => {
        expect(ctx.stderr).to.contain(
          nls.localize(
            'customTemplatesCannotRetrieveDefaultBranch',
            NON_EXISTENT_REPO
          )
        );
      });

    test
      .withOrg()
      //.withProject()
      .stderr()
      .stub(ConfigAggregator.prototype, 'getPropertyValue', () => {
        return INVALID_URL_REPO;
      })
      .command(['force:apex:class:create', '--classname', 'foo'])
      .it('should throw error if repo url is invalid', ctx => {
        expect(ctx.stderr).to.contain(
          nls.localize('customTemplatesInvalidRepoUrl', INVALID_URL_REPO)
        );
      });

    test
      .withOrg()
      //.withProject()
      .stderr()
      .stub(ConfigAggregator.prototype, 'getPropertyValue', () => {
        return HTTP_REPO;
      })
      .command(['force:apex:class:create', '--classname', 'foo'])
      .it('should throw error if repo protocol is not https', ctx => {
        expect(ctx.stderr).to.contain(
          nls.localize('customTemplatesShouldUseHttpsProtocol', '"http:"')
        );
      });

    test
      .withOrg()
      //.withProject()
      .stderr()
      .stub(ConfigAggregator.prototype, 'getPropertyValue', () => {
        return GITLAB_REPO;
      })
      .command(['force:apex:class:create', '--classname', 'foo'])
      .it('should throw error if not a GitHub repo', ctx => {
        expect(ctx.stderr).to.contain(
          nls.localize('customTemplatesSupportsGitHubOnly', GITLAB_REPO)
        );
      });
  });
});
