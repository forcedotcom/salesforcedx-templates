/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@salesforce/command/lib/test';
import { nls } from '@salesforce/templates/lib/i18n';
import * as path from 'path';
import * as assert from 'yeoman-assert';

describe('Analytics template creation tests:', () => {
  describe('Check analytics template creation', () => {
    test
      .withOrg()
      .withProject()
      .stdout()
      .command([
        'force:analytics:template:create',
        '--templatename',
        'foo',
        '--outputdir',
        'waveTemplates'
      ])
      .it(
        'should create analytics template foo using foo as the output name and internal values',
        ctx => {
          assert.file('waveTemplates/foo/template-info.json');
          assert.fileContent(
            path.join('waveTemplates', 'foo', 'template-info.json'),
            '"label": "foo"'
          );
          assert.fileContent(
            path.join('waveTemplates', 'foo', 'folder.json'),
            '"name": "foo"'
          );
          assert.file('waveTemplates/foo/dashboards/fooDashboard.json');
          assert.fileContent(
            path.join(
              'waveTemplates',
              'foo',
              'dashboards',
              'fooDashboard.json'
            ),
            '"name": "fooDashboard_tp"'
          );
        }
      );
    test
      .withOrg()
      .withProject()
      .stderr()
      .command([
        'force:analytics:template:create',
        '--templatename',
        'foo',
        '--outputdir',
        'foo'
      ])
      .it(
        'should throw error output directory does not contain waveTemplates',
        ctx => {
          expect(ctx.stderr).to.contain(
            nls.localize('MissingWaveTemplatesDir')
          );
        }
      );
    test
      .withOrg()
      .withProject()
      .stderr()
      .command(['force:analytics:template:create'])
      .it('should throw error when missing required name field', ctx => {
        expect(ctx.stderr).to.contain('Missing required flag');
      });
    test
      .withOrg()
      .withProject()
      .stderr()
      .command([
        'force:analytics:template:create',
        '--templatename',
        'foo$^s',
        '--outputdir',
        'waveTemplates'
      ])
      .it(
        'should throw error with message about invalid characters in name',
        ctx => {
          expect(ctx.stderr).to.contain(nls.localize('AlphaNumericNameError'));
        }
      );
  });
});
