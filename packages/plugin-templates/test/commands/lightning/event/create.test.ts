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

describe('Lightning event creation tests:', () => {
  describe('Check lightning event creation', () => {
    test
      .withOrg()
      //.withProject()
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
      .withOrg()
      //.withProject()
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
        .withOrg()
        //.withProject()
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
        .withOrg()
        //.withProject()
        .stderr()
        .command(['force:lightning:event:create', '--eventname', 'foo'])
        .it('should throw missing aura parent folder error', ctx => {
          expect(ctx.stderr).to.contain(
            messages.getMessage('MissingAuraFolder')
          );
        });

      test
        .withOrg()
        //.withProject()
        .stderr()
        .command(['force:lightning:event:create', '--outputdir', 'aura'])
        .it('should throw missing eventname error', ctx => {
          expect(ctx.stderr).to.contain(
            messages.getMessage('MissingEventname')
          );
        });

      test
        .withOrg()
        //.withProject()
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
        .withOrg()
        //.withProject()
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
        .withOrg()
        //.withProject()
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
        .withOrg()
        //.withProject()
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
