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

describe('Apex trigger creation tests:', () => {
  describe('Check apex trigger creation', () => {
    test
      .withOrg()
      //.withProject()
      .stdout()
      .command(['force:apex:trigger:create', '--triggername', 'foo'])
      .it(
        'should create foo trigger using ApexTrigger template and default output directory',
        ctx => {
          assert.file(['foo.trigger', 'foo.trigger-meta.xml']);
          assert.fileContent(
            path.join(process.cwd(), 'foo.trigger'),
            'trigger foo on SOBJECT (before insert)'
          );
        }
      );
    test
      .withOrg()
      //.withProject()
      .stdout()
      .command([
        'force:apex:trigger:create',
        '--triggername',
        'foo',
        '--sobject',
        'customsobject',
        '--outputdir',
        'apextriggertestfolder'
      ])
      .it(
        'should create foo trigger with a targetpath and sobject set',
        ctx => {
          assert.file([
            path.join('apextriggertestfolder', 'foo.trigger'),
            path.join('apextriggertestfolder', 'foo.trigger-meta.xml')
          ]);
          assert.fileContent(
            path.join('apextriggertestfolder', 'foo.trigger'),
            'trigger foo on customsobject (before insert)'
          );
        }
      );

    test
      .withOrg()
      //.withProject()
      .stdout()
      .command([
        'force:apex:trigger:create',
        '--triggername',
        'foo',
        '--sobject',
        'override',
        '--triggerevents',
        'after insert'
      ])
      .it(
        'should override foo trigger with a different sobject and triggerevent',
        ctx => {
          assert.file(['foo.trigger', 'foo.trigger-meta.xml']);
          assert.fileContent(
            'foo.trigger',
            'trigger foo on override (after insert)'
          );
        }
      );

    test
      .withOrg()
      //.withProject()
      .stdout()
      .command([
        'force:apex:trigger:create',
        '--triggername',
        'foo',
        '--outputdir',
        'classes create'
      ])
      .it(
        'should create foo trigger in custom folder name that has a space in it',
        ctx => {
          assert.file([
            path.join('classes create', 'foo.trigger'),
            path.join('classes create', 'foo.trigger-meta.xml')
          ]);
          assert.fileContent(
            path.join('classes create', 'foo.trigger'),
            'trigger foo on SOBJECT (before insert)'
          );
        }
      );
  });
  describe('Check that all invalid name errors are thrown', () => {
    test
      .withOrg()
      //.withProject()
      .stderr()
      .command(['force:apex:trigger:create'])
      .it('should throw a missing trigger name error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('MissingTriggernameFlag')
        );
      });

    test
      .withOrg()
      //.withProject()
      .stderr()
      .command(['force:apex:trigger:create', '--triggername', '/a'])
      .it('should throw invalid non alphanumeric trigger name error', ctx => {
        expect(ctx.stderr).to.contain(nls.localize('AlphaNumericNameError'));
      });

    test
      .withOrg()
      //.withProject()
      .stderr()
      .command(['force:apex:trigger:create', '--triggername', '3aa'])
      .it(
        'should throw invalid trigger name starting with numeric error',
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
      .command(['force:apex:trigger:create', '--triggername', 'a_'])
      .it(
        'should throw invalid trigger name ending with underscore error',
        ctx => {
          expect(ctx.stderr).to.contain(nls.localize('EndWithUnderscoreError'));
        }
      );

    test
      .withOrg()
      //.withProject()
      .stderr()
      .command(['force:apex:trigger:create', '--triggername', 'a__a'])
      .it(
        'should throw invalid trigger name with double underscore error',
        ctx => {
          expect(ctx.stderr).to.contain(nls.localize('DoubleUnderscoreError'));
        }
      );
  });
});
