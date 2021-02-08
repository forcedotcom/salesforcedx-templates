/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@salesforce/command/lib/test';
import { Messages, SfdxProject } from '@salesforce/core';
import { nls } from '@salesforce/templates/lib/i18n';
import * as path from 'path';
import { createSandbox, SinonSandbox } from 'sinon';
import * as assert from 'yeoman-assert';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages(
  '@salesforce/plugin-templates',
  'messages'
);
export class TestFormatter {
  public static fileformatter(pathway: string, filename: string): string[] {
    const files: string[] = [];
    const suffixarray = [
      '.app',
      '.auradoc',
      '.css',
      'Controller.js',
      'Helper.js',
      'Renderer.js',
      '.svg'
    ];
    suffixarray.forEach(element => {
      files.push(path.join('aura', pathway, filename + element));
    });
    return files;
  }
}

const SFDX_PROJECT_PATH = 'test-sfdx-project';
const TEST_USERNAME = 'test@example.com';
const projectPath = path.resolve(SFDX_PROJECT_PATH);
const sfdxProjectJson = {
  packageDirectories: [{ path: 'force-app', default: true }],
  namespace: '',
  sfdcLoginUrl: 'https://login.salesforce.com',
  sourceApiVersion: '49.0'
};

describe('Lightning app creation tests: MOOP', () => {
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

  describe('Check lightning app creation', () => {
    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command([
        'force:lightning:app:create',
        '--appname',
        'foo',
        '--outputdir',
        'aura',
        '--template',
        'DefaultLightningApp'
      ])
      .it(
        'should create lightning app foo using DefaultLightningApp template',
        ctx => {
          assert.file(TestFormatter.fileformatter('foo', 'foo'));
          assert.file(path.join('aura', 'foo', 'foo.app-meta.xml'));
          assert.fileContent(
            path.join('aura', 'foo', 'foo.app'),
            '<aura:application>\n\n</aura:application>'
          );
          assert.fileContent(
            path.join('aura', 'foo', 'foo.app-meta.xml'),
            '<AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">'
          );
        }
      );

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command([
        'force:lightning:app:create',
        '--appname',
        'foo',
        '--outputdir',
        path.join('aura', 'testing'),
        '--internal'
      ])
      .it(
        'should create lightning app foo in a new directory without the -meta.xml file',
        ctx => {
          assert.file(
            TestFormatter.fileformatter(path.join('testing', 'foo'), 'foo')
          );
        }
      );
  });

  describe('lightning app failures', () => {
    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command([
        'force:lightning:app:create',
        '--appname',
        'foo',
        '--outputdir',
        'aura',
        '--template',
        'foo'
      ])
      .it('should throw invalid template name error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('InvalidTemplate'));
      });

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command(['force:lightning:app:create', '--appname', 'foo'])
      .it('should throw missing aura parent folder error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('MissingAuraFolder'));
      });

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command(['force:lightning:app:create', '--outputdir', 'aura'])
      .it('should throw missing appname error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('MissingAppname'));
      });

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command([
        'force:lightning:app:create',
        '--appname',
        '/a',
        '--outputdir',
        'aura'
      ])
      .it('should throw invalid non alphanumeric appname error', ctx => {
        expect(ctx.stderr).to.contain(nls.localize('AlphaNumericNameError'));
      });

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command([
        'force:lightning:app:create',
        '--appname',
        '3aa',
        '--outputdir',
        'aura'
      ])
      .it('should throw invalid appname starting with numeric error', ctx => {
        expect(ctx.stderr).to.contain(
          nls.localize('NameMustStartWithLetterError')
        );
      });

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command([
        'force:lightning:app:create',
        '--appname',
        'a_',
        '--outputdir',
        'aura'
      ])
      .it('should throw invalid appname ending with underscore error', ctx => {
        expect(ctx.stderr).to.contain(nls.localize('EndWithUnderscoreError'));
      });

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command([
        'force:lightning:app:create',
        '--appname',
        'a__a',
        '--outputdir',
        'aura'
      ])
      .it('should throw invalid appname with double underscore error', ctx => {
        expect(ctx.stderr).to.contain(nls.localize('DoubleUnderscoreError'));
      });
  });
});
