/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@salesforce/command/lib/test';
import { Messages } from '@salesforce/core';
import { nls } from '@salesforce/templates/lib/i18n';
import * as path from 'path';
import * as assert from 'yeoman-assert';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages(
  '@salesforce/plugin-templates',
  'messages'
);

describe('Lightning test creation tests:', () => {
  describe('Check lightning test creation', () => {
    test
      .withOrg()
      //.withProject()
      .stdout()
      .command([
        'force:lightning:test:create',
        '-n',
        'foo',
        '--template',
        'DefaultLightningTest'
      ])
      .it(
        'should create lightning test foo using DefaultLightningTest template',
        ctx => {
          assert.file(path.join('foo.resource'));
          assert.file(path.join('foo.resource-meta.xml'));
        }
      ),
      test
        .withOrg()
        //.withProject()
        .stdout()
        .command([
          'force:lightning:test:create',
          '--testname',
          'foo',
          '--outputdir',
          path.join('aura', 'test'),
          '--template',
          'DefaultLightningTest'
        ])
        .it(
          'should create lightning test foo using DefaultLightningTest template and custom output directory',
          ctx => {
            assert.file(path.join('aura', 'test', 'foo.resource'));
            assert.file(path.join('aura', 'test', 'foo.resource-meta.xml'));
          }
        );
  }),
    describe('Check lightning test creation with internal flag', () => {
      test
        .withOrg()
        //.withProject()
        .stdout()
        .command([
          'force:lightning:test:create',
          '-n',
          'internalflagtest',
          '--internal'
        ])
        .it(
          'should create lightning aura component files in the aura output directory without a -meta.xml file',
          ctx => {
            assert.file(path.join('internalflagtest.resource'));
            assert.noFile('internalflagtest.resource-meta.xml');
          }
        );
    }),
    describe('lightning test failures', () => {
      test
        .withOrg()
        //.withProject()
        .stderr()
        .command([
          'force:lightning:test:create',
          '--testname',
          'foo',
          '--template',
          'foo'
        ])
        .it('should throw invalid template name error', ctx => {
          expect(ctx.stderr).to.contain(messages.getMessage('InvalidTemplate'));
        });
      test
        .withOrg()
        //.withProject()
        .stderr()
        .command(['force:lightning:test:create', '--outputdir', 'aura'])
        .it('should throw missing testname error', ctx => {
          expect(ctx.stderr).to.contain(messages.getMessage('MissingTestName'));
        });

      test
        .withOrg()
        //.withProject()
        .stderr()
        .command(['force:lightning:test:create', '--testname', '/a'])
        .it(
          'should throw invalid non alphanumeric interfacename error',
          ctx => {
            expect(ctx.stderr).to.contain(
              nls.localize('AlphaNumericNameError')
            );
          }
        );

      test
        .withOrg()
        //.withProject()
        .stderr()
        .command([
          'force:lightning:test:create',
          '--testname',
          '3aa',
          '--outputdir',
          'aura'
        ])
        .it(
          'should throw invalid testname starting with numeric error',
          ctx => {
            expect(ctx.stderr).to.contain(
              nls.localize('NameMustStartWithLetterError')
            );
          }
        );

      test
        .withOrg()
        //.withProject()
        .stderr()
        .command(['force:lightning:test:create', '--testname', 'a_'])
        .it(
          'should throw invalid testname ending with underscore error',
          ctx => {
            expect(ctx.stderr).to.contain(
              nls.localize('EndWithUnderscoreError')
            );
          }
        );

      test
        .withOrg()
        //.withProject()
        .stderr()
        .command(['force:lightning:test:create', '--testname', 'a__a'])
        .it(
          'should throw invalid testname with double underscore error',
          ctx => {
            expect(ctx.stderr).to.contain(
              nls.localize('DoubleUnderscoreError')
            );
          }
        );
    });
});
