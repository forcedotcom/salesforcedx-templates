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

describe('Lightning event creation tests:', () => {
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

  describe('Check lightning event creation', () => {
    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command([
        'force:lightning:event:create',
        '--eventname',
        'foo',
        '--outputdir',
        'aura',
        '--template',
        'DefaultLightningEvt'
      ])
      .it(
        'should create lightning event foo using DefaultLightningEvt template and aura output directory',
        ctx => {
          assert.file(path.join('aura', 'foo', 'foo.evt'));
          assert.file(path.join('aura', 'foo', 'foo.evt-meta.xml'));
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
        'force:lightning:event:create',
        '--eventname',
        'foometa',
        '--outputdir',
        'aura',
        '--template',
        'DefaultLightningEvt',
        '--internal'
      ])
      .it(
        'should create lightning event foo using DefaultLightningEvt template and aura output directory with no -meta.xml file',
        ctx => {
          assert.file(path.join('aura', 'foometa', 'foometa.evt'));
          assert.noFile(path.join('aura', 'foometa', 'foometa.evt-meta.xml'));
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
        'force:lightning:event:create',
        '--eventname',
        'foo',
        '--outputdir',
        path.join('aura', 'testing')
      ])
      .it('should create lightning event foo in a new directory', ctx => {
        assert.file(path.join('aura', 'testing', 'foo', 'foo.evt'));
      });
  }),
    describe('lightning event failures', () => {
      test
        .withOrg({ username: TEST_USERNAME }, true)
        .loadConfig({
          root: __dirname
        })
        .stub(process, 'cwd', () => projectPath)
        .stderr()
        .command([
          'force:lightning:event:create',
          '--eventname',
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
        .command(['force:lightning:event:create', '--eventname', 'foo'])
        .it('should throw missing aura parent folder error', ctx => {
          expect(ctx.stderr).to.contain(
            messages.getMessage('MissingAuraFolder')
          );
        });

      test
        .withOrg({ username: TEST_USERNAME }, true)
        .loadConfig({
          root: __dirname
        })
        .stub(process, 'cwd', () => projectPath)
        .stderr()
        .command(['force:lightning:event:create', '--outputdir', 'aura'])
        .it('should throw missing eventname error', ctx => {
          expect(ctx.stderr).to.contain(
            messages.getMessage('MissingEventname')
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
          'force:lightning:event:create',
          '--eventname',
          '/a',
          '--outputdir',
          'aura'
        ])
        .it('should throw invalid non alphanumeric eventname error', ctx => {
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
          'force:lightning:event:create',
          '--eventname',
          '3aa',
          '--outputdir',
          'aura'
        ])
        .it(
          'should throw invalid eventname starting with numeric error',
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
          'force:lightning:event:create',
          '--eventname',
          'a_',
          '--outputdir',
          'aura'
        ])
        .it(
          'should throw invalid eventname ending with underscore error',
          ctx => {
            expect(ctx.stderr).to.contain(
              nls.localize('EndWithUnderscoreError')
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
          'force:lightning:event:create',
          '--eventname',
          'a__a',
          '--outputdir',
          'aura'
        ])
        .it(
          'should throw invalid eventname with double underscore error',
          ctx => {
            expect(ctx.stderr).to.contain(
              nls.localize('DoubleUnderscoreError')
            );
          }
        );
    });
});
