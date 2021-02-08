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

const SFDX_PROJECT_PATH = 'test-sfdx-project';
const TEST_USERNAME = 'test@example.com';
const projectPath = path.resolve(SFDX_PROJECT_PATH);
const sfdxProjectJson = {
  packageDirectories: [{ path: 'force-app', default: true }],
  namespace: '',
  sfdcLoginUrl: 'https://login.salesforce.com',
  sourceApiVersion: '49.0'
};

describe('Visualforce page creation tests:', () => {
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

  describe('Check visualforce page creation', () => {
    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command([
        'force:visualforce:page:create',
        '--pagename',
        'foo',
        '--label',
        'testlabel'
      ])
      .it(
        'should create foo page using DefaultVFPage template and default output directory',
        ctx => {
          assert.file(['foo.page', 'foo.page-meta.xml']);
          assert.fileContent(
            path.join(process.cwd(), 'foo.page'),
            'This is your new Page'
          );
          assert.fileContent(
            path.join(process.cwd(), 'foo.page-meta.xml'),
            '<label>testlabel</label>'
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
        'force:visualforce:page:create',
        '--pagename',
        'foo',
        '--outputdir',
        'testpage',
        '--label',
        'testlabel'
      ])
      .it('should create foo page in a folder with a custom name', ctx => {
        assert.file([
          path.join('testpage', 'foo.page'),
          path.join('testpage', 'foo.page-meta.xml')
        ]);
      });

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command([
        'force:visualforce:page:create',
        '--pagename',
        'foo',
        '--outputdir',
        'folder space',
        '--label',
        'label'
      ])
      .it(
        'should create foo page in custom folder name that has a space in it',
        ctx => {
          assert.file([
            path.join('folder space', 'foo.page'),
            path.join('folder space', 'foo.page-meta.xml')
          ]);
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
      .command(['force:visualforce:page:create'])
      .it('should throw a missing pagename error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('MissingPagenameFlag')
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
        'force:visualforce:page:create',
        '--pagename',
        '/a',
        '--label',
        'foo'
      ])
      .it('should throw invalid non alphanumeric pagename error', ctx => {
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
        'force:visualforce:page:create',
        '--pagename',
        '3aa',
        '--label',
        'foo'
      ])
      .it('should throw invalid pagename starting with numeric error', ctx => {
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
        'force:visualforce:page:create',
        '--pagename',
        'a_',
        '--label',
        'foo'
      ])
      .it('should throw invalid pagename ending with underscore error', ctx => {
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
        'force:visualforce:page:create',
        '--pagename',
        'a__a',
        '--label',
        'foo'
      ])
      .it('should throw invalid pagename with double underscore error', ctx => {
        expect(ctx.stderr).to.contain(nls.localize('DoubleUnderscoreError'));
      });
  });
});
