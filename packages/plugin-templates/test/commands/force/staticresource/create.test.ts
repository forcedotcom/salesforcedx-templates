/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@salesforce/command/lib/test';
import { Messages } from '@salesforce/core';
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'yeoman-assert';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');

describe('Static resource creation tests:', () => {
  // tslint:disable-next-line:no-unused-expression
  if (!fs.existsSync('testsoutput')) {
    fs.mkdirSync('testsoutput');
  }
  process.chdir('testsoutput');

  describe('Check static resource creation', () => {
    test
      .withOrg()
      .withProject()
      .stdout()
      .command([
        'force:staticresource:create',
        '--resourcename',
        'foo',
        '--contenttype',
        'text/css'
      ])
      .it(
        'should create foo css static resource in the default output directory',
        ctx => {
          assert.file(['foo.css', 'foo.resource-meta.xml']);
          assert.fileContent(
            path.join(process.cwd(), 'foo.css'),
            '/* Replace the contents of this file with your static resource */'
          );
        }
      );

    test
      .withOrg()
      .withProject()
      .stdout()
      .command([
        'force:staticresource:create',
        '--resourcename',
        'foo',
        '--contenttype',
        'application/javascript'
      ])
      .it(
        'should create foo javascript static resource in the default output directory',
        ctx => {
          assert.file(['foo.js', 'foo.resource-meta.xml']);
          assert.fileContent(
            path.join(process.cwd(), 'foo.js'),
            '// Replace the contents of this file with your static resource'
          );
        }
      );

    test
      .withOrg()
      .withProject()
      .stdout()
      .command([
        'force:staticresource:create',
        '--resourcename',
        'foo',
        '--contenttype',
        'application/json'
      ])
      .it(
        'should create foo json static resource in the default output directory',
        ctx => {
          assert.file(['foo.json', 'foo.resource-meta.xml']);
          assert.fileContent(
            path.join(process.cwd(), 'foo.json'),
            `{
              "__info": "Replace the contents of this file with your static resource"
            }`
          );
        }
      );

    test
      .withOrg()
      .withProject()
      .stdout()
      .command([
        'force:staticresource:create',
        '--resourcename',
        'foo',
        '--contenttype',
        'text/plain'
      ])
      .it(
        'should create foo json static resource in the default output directory',
        ctx => {
          assert.file(['foo.txt', 'foo.resource-meta.xml']);
          assert.fileContent(
            path.join(process.cwd(), 'foo.txt'),
            'Replace the contents of this file with your static resource'
          );
        }
      );

    test
      .withOrg()
      .withProject()
      .stdout()
      .command([
        'force:staticresource:create',
        '--resourcename',
        'foo',
        '--contenttype',
        'text/application/pdf'
      ])
      .it(
        'should create foo generic static resource in the default output directory',
        ctx => {
          assert.file(['foo.resource', 'foo.resource-meta.xml']);
          assert.fileContent(
            path.join(process.cwd(), 'foo.resource'),
            'Replace this file with your static resource (i.e. an image)'
          );
        }
      );

    test
      .withOrg()
      .withProject()
      .stdout()
      .command(['force:staticresource:create', '--resourcename', 'foo'])
      .it(
        'should create foo static resource in the default output directory',
        ctx => {
          assert.file(['foo/.gitkeep', 'foo.resource-meta.xml']);
          assert.fileContent(
            path.join(process.cwd(), 'foo/.gitkeep'),
            'This file can be deleted'
          );
        }
      );

    test
      .withOrg()
      .withProject()
      .stdout()
      .command([
        'force:staticresource:create',
        '--resourcename',
        'foo',
        '--outputdir',
        'testfolder'
      ])
      .it('should create foo resource with a targetpath set', ctx => {
        assert.file([
          path.join('testfolder', 'foo', '.gitkeep'),
          path.join('testfolder', 'foo.resource-meta.xml')
        ]);
        assert.fileContent(
          path.join('testfolder', 'foo', 'empty.js'),
          'This file can be deleted'
        );
      });

    test
      .withOrg()
      .withProject()
      .stdout()
      .command([
        'force:staticresource:create',
        '--resourcename',
        'foo',
        '--outputdir',
        'classes create'
      ])
      .it(
        'should create foo static resource in custom folder name that has a space in it',
        ctx => {
          assert.file([
            path.join('classes create', 'foo', '.gitkeep'),
            path.join('classes create', 'foo.resource-meta.xml')
          ]);
          assert.fileContent(
            path.join('classes create', 'foo', '.gitkeep'),
            'This file can be deleted'
          );
        }
      );
  });

  describe('Check that all invalid name errors are thrown', () => {
    test
      .withOrg()
      .withProject()
      .stderr()
      .command(['force:staticresource:create'])
      .it('should throw a missing resourcename error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('MissingResourcenameFlag')
        );
      });

    test
      .withOrg()
      .withProject()
      .stderr()
      .command(['force:staticresource:create', '--resourcename', '/a'])
      .it(
        'should throw invalid non alphanumeric static resource name error',
        ctx => {
          expect(ctx.stderr).to.contain(
            messages.getMessage('AlphaNumericNameError')
          );
        }
      );

    test
      .withOrg()
      .withProject()
      .stderr()
      .command(['force:staticresource:create', '--resourcename', '3aa'])
      .it(
        'should throw invalid static resource name starting with numeric error',
        ctx => {
          expect(ctx.stderr).to.contain(
            messages.getMessage('NameMustStartWithLetterError')
          );
        }
      );

    test
      .withOrg()
      .withProject()
      .stderr()
      .command(['force:staticresource:create', '--resourcename', 'a_'])
      .it(
        'should throw invalid static resource name ending with underscore error',
        ctx => {
          expect(ctx.stderr).to.contain(
            messages.getMessage('EndWithUnderscoreError')
          );
        }
      );

    test
      .withOrg()
      .withProject()
      .stderr()
      .command(['force:staticresource:create', '--resourcename', 'a__a'])
      .it(
        'should throw invalid static resource name with double underscore error',
        ctx => {
          expect(ctx.stderr).to.contain(
            messages.getMessage('DoubleUnderscoreError')
          );
        }
      );

    test
      .withOrg()
      .withProject()
      .stderr()
      .command([
        'force:staticresource:create',
        '--resourcename',
        'foo',
        '--contenttype',
        'notvalid'
      ])
      .it('should throw an invalid mime type error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('InvalidMimeType'));
      });
  });
});
