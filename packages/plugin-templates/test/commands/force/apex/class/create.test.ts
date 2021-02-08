/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@salesforce/command/lib/test';
import { Messages, SfdxProject } from '@salesforce/core';
import { nls } from '@salesforce/templates/lib/i18n';
import * as fs from 'fs';
import * as path from 'path';
import { createSandbox, SinonSandbox } from 'sinon';
import * as assert from 'yeoman-assert';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages(
  '@salesforce/plugin-templates',
  'messages'
);

const SFDX_PROJECT_PATH = 'test-sfdx-project';
const TEST_USERNAME = 'test@example.com';
const projectPath = path.resolve(SFDX_PROJECT_PATH);
const sfdxProjectJson = {
  packageDirectories: [{ path: 'force-app', default: true }],
  namespace: '',
  sfdcLoginUrl: 'https://login.salesforce.com',
  sourceApiVersion: '49.0'
};

describe('Apex class creation tests:', () => {
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

  // tslint:disable-next-line:no-unused-expression
  if (!fs.existsSync('testsoutput')) {
    fs.mkdirSync('testsoutput');
  }
  process.chdir('testsoutput');

  describe('Check apex class creation', () => {
    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command(['force:apex:class:create', '--classname', 'foo'])
      .it(
        'should create foo class using DefaultApexClass template and default output directory',
        ctx => {
          assert.file(['foo.cls', 'foo.cls-meta.xml']);
          assert.fileContent(
            path.join(process.cwd(), 'foo.cls'),
            'public inherited sharing class foo'
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
        'force:apex:class:create',
        '--classname',
        'foo',
        '--outputdir',
        'testfolder',
        '--template',
        'ApexException'
      ])
      .it(
        'should create foo class with a targetpath set and ApexException template',
        ctx => {
          assert.file([
            path.join('testfolder', 'foo.cls'),
            path.join('testfolder', 'foo.cls-meta.xml')
          ]);
          assert.fileContent(
            path.join('testfolder', 'foo.cls'),
            'public class foo extends Exception'
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
        'force:apex:class:create',
        '--classname',
        'foo',
        '--outputdir',
        'testfolder',
        '--template',
        'ApexException'
      ])
      .it('should override foo class using ApexException template', ctx => {
        assert.file([
          path.join('testfolder', 'foo.cls'),
          path.join('testfolder', 'foo.cls-meta.xml')
        ]);
        assert.fileContent(
          path.join('testfolder', 'foo.cls'),
          'public class foo extends Exception'
        );
      });

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command([
        'force:apex:class:create',
        '--classname',
        'foo',
        '--outputdir',
        'classes create'
      ])
      .it(
        'should create foo class in custom folder name that has a space in it',
        ctx => {
          assert.file([
            path.join('classes create', 'foo.cls'),
            path.join('classes create', 'foo.cls-meta.xml')
          ]);
          assert.fileContent(
            path.join('classes create', 'foo.cls'),
            'public inherited sharing class foo'
          );
        }
      );
  });

  describe('Check that all invalid name errors are thrown', () => {
    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command(['force:apex:class:create'])
      .it('should throw a missing classname error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('MissingClassnameFlag')
        );
      });

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command(['force:apex:class:create', '--classname', '/a'])
      .it('should throw invalid non alphanumeric class name error', ctx => {
        expect(ctx.stderr).to.contain(nls.localize('AlphaNumericNameError'));
      });

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command(['force:apex:class:create', '--classname', '3aa'])
      .it(
        'should throw invalid class name starting with numeric error',
        ctx => {
          expect(ctx.stderr).to.contain(
            nls.localize('NameMustStartWithLetterError')
          );
        }
      );

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command(['force:apex:class:create', '--classname', 'a_'])
      .it(
        'should throw invalid class name ending with underscore error',
        ctx => {
          expect(ctx.stderr).to.contain(nls.localize('EndWithUnderscoreError'));
        }
      );

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command(['force:apex:class:create', '--classname', 'a__a'])
      .it(
        'should throw invalid class name with double underscore error',
        ctx => {
          expect(ctx.stderr).to.contain(nls.localize('DoubleUnderscoreError'));
        }
      );
  });
});
