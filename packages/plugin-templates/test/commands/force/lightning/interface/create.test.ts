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

describe('Lightning interface creation tests:', () => {
  describe('Check lightning interface creation', () => {
    test
      .withOrg()
      //.withProject()
      .stdout()
      .command([
        'force:lightning:interface:create',
        '--interfacename',
        'foo',
        '--outputdir',
        'aura',
        '--template',
        'DefaultLightningIntf'
      ])
      .it(
        'should create lightning interface foo using DefaultLightningIntf template and aura output directory',
        ctx => {
          assert.file(path.join('aura', 'foo', 'foo.intf'));
          assert.file(path.join('aura', 'foo', 'foo.intf-meta.xml'));
        }
      ),
      test
        .withOrg()
        //.withProject()
        .stdout()
        .command([
          'force:lightning:interface:create',
          '--interfacename',
          'foometa',
          '--outputdir',
          'aura',
          '--template',
          'DefaultLightningIntf',
          '--internal'
        ])
        .it(
          'should create lightning interface foo using DefaultLightningIntf template and aura output directory and no -meta.xml file',
          ctx => {
            assert.file(path.join('aura', 'foometa', 'foometa.intf'));
            assert.noFile(
              path.join('aura', 'foometa', 'foometa.intf-meta.xml')
            );
          }
        ),
      test
        .withOrg()
        //.withProject()
        .stdout()
        .command([
          'force:lightning:interface:create',
          '--interfacename',
          'foo',
          '--outputdir',
          path.join('aura', 'interfacetest'),
          '--template',
          'DefaultLightningIntf'
        ])
        .it(
          'should create lightning interface foo using DefaultLightningIntf template and custom output directory',
          ctx => {
            assert.file(path.join('aura', 'interfacetest', 'foo', 'foo.intf'));
            assert.file(
              path.join('aura', 'interfacetest', 'foo', 'foo.intf-meta.xml')
            );
          }
        );
  }),
    describe('lightning interface failures', () => {
      test
        .withOrg()
        //.withProject()
        .stderr()
        .command([
          'force:lightning:interface:create',
          '--interfacename',
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
        .command(['force:lightning:interface:create', '--interfacename', 'foo'])
        .it('should throw missing aura parent folder error', ctx => {
          expect(ctx.stderr).to.contain(
            messages.getMessage('MissingAuraFolder')
          );
        });
      test
        .withOrg()
        //.withProject()
        .stderr()
        .command(['force:lightning:interface:create', '--outputdir', 'aura'])
        .it('should throw missing interfacename error', ctx => {
          expect(ctx.stderr).to.contain(
            messages.getMessage('MissingInterfacename')
          );
        });

      test
        .withOrg()
        //.withProject()
        .stderr()
        .command([
          'force:lightning:interface:create',
          '--interfacename',
          '/a',
          '--outputdir',
          'aura'
        ])
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
          'force:lightning:interface:create',
          '--interfacename',
          '3aa',
          '--outputdir',
          'aura'
        ])
        .it(
          'should throw invalid interfacename starting with numeric error',
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
          'force:lightning:interface:create',
          '--interfacename',
          'a_',
          '--outputdir',
          'aura'
        ])
        .it(
          'should throw invalid interfacename ending with underscore error',
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
          'force:lightning:interface:create',
          '--interfacename',
          'a__a',
          '--outputdir',
          'aura'
        ])
        .it(
          'should throw invalid interfacename with double underscore error',
          ctx => {
            expect(ctx.stderr).to.contain(
              nls.localize('DoubleUnderscoreError')
            );
          }
        );
    });
});
