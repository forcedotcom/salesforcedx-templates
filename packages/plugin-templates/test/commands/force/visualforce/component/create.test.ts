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

describe('Visualforce component creation tests:', () => {
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

  describe('Check visualforce component creation', () => {
    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command([
        'force:visualforce:component:create',
        '--componentname',
        'foo',
        '--label',
        'testlabel'
      ])
      .it(
        'should create foo component using DefaultVFComponent template and default output directory',
        ctx => {
          assert.file(['foo.component', 'foo.component-meta.xml']);
          assert.fileContent(
            path.join(process.cwd(), 'foo.component'),
            'This is your new Component'
          );
          assert.fileContent(
            path.join(process.cwd(), 'foo.component-meta.xml'),
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
        'force:visualforce:component:create',
        '--componentname',
        'foo',
        '--outputdir',
        'testcomponent',
        '--label',
        'testlabel'
      ])
      .it('should create foo component in a folder with a custom name', ctx => {
        assert.file([
          path.join('testcomponent', 'foo.component'),
          path.join('testcomponent', 'foo.component-meta.xml')
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
        'force:visualforce:component:create',
        '--componentname',
        'foo',
        '--outputdir',
        'classes create',
        '--label',
        'label'
      ])
      .it(
        'should create foo component in custom folder name that has a space in it',
        ctx => {
          assert.file([
            path.join('classes create', 'foo.component'),
            path.join('classes create', 'foo.component-meta.xml')
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
      .command(['force:visualforce:component:create'])
      .it('should throw a missing componentname error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('MissingComponentnameFlag')
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
        'force:visualforce:component:create',
        '--componentname',
        '/a',
        '--label',
        'foo'
      ])
      .it('should throw invalid non alphanumeric componentname error', ctx => {
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
        'force:visualforce:component:create',
        '--componentname',
        '3aa',
        '--label',
        'foo'
      ])
      .it(
        'should throw invalid componentname starting with numeric error',
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
      .command([
        'force:visualforce:component:create',
        '--componentname',
        'a_',
        '--label',
        'foo'
      ])
      .it(
        'should throw invalid componentname ending with underscore error',
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
      .command([
        'force:visualforce:component:create',
        '--componentname',
        'a__a',
        '--label',
        'foo'
      ])
      .it(
        'should throw invalid componentname with double underscore error',
        ctx => {
          expect(ctx.stderr).to.contain(nls.localize('DoubleUnderscoreError'));
        }
      );
  });
});
