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

describe('Visualforce page creation tests:', () => {
  describe('Check visualforce page creation', () => {
    test
      .withOrg()
      //.withProject()
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
      .withOrg()
      //.withProject()
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
      .withOrg()
      //.withProject()
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
      .withOrg()
      //.withProject()
      .stderr()
      .command(['force:visualforce:page:create'])
      .it('should throw a missing pagename error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('MissingPagenameFlag')
        );
      });

    test
      .withOrg()
      //.withProject()
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
      .withOrg()
      //.withProject()
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
      .withOrg()
      //.withProject()
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
      .withOrg()
      //.withProject()
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
