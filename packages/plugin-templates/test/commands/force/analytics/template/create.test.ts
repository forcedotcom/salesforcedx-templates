/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@salesforce/command/lib/test';
import { SfdxProject } from '@salesforce/core/lib/sfdxProject';
import { nls } from '@salesforce/templates/lib/i18n';
import * as path from 'path';
import { createSandbox, SinonSandbox } from 'sinon';
import * as assert from 'yeoman-assert';

const SFDX_PROJECT_PATH = 'test-sfdx-project';
const TEST_USERNAME = 'test@example.com';
const projectPath = path.resolve(SFDX_PROJECT_PATH);
const sfdxProjectJson = {
  packageDirectories: [{ path: 'force-app', default: true }],
  namespace: '',
  sfdcLoginUrl: 'https://login.salesforce.com',
  sourceApiVersion: '49.0'
};

describe('Analytics template creation tests:', () => {
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

  describe('Check analytics template creation', () => {
    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
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
          assert.jsonFileContent(
            path.join('waveTemplates', 'foo', 'template-info.json'),
            {
              label: 'foo',
              assetVersion: 49.0
            }
          );

          assert.jsonFileContent(
            path.join('waveTemplates', 'foo', 'folder.json'),
            { name: 'foo' }
          );

          assert.jsonFileContent(
            path.join(
              'waveTemplates',
              'foo',
              'dashboards',
              'fooDashboard.json'
            ),
            {
              name: 'fooDashboard_tp',
              state: {
                widgets: {
                  text_1: {
                    parameters: {
                      content: {
                        displayTemplate: 'foo Analytics Dashboard'
                      }
                    }
                  }
                }
              }
            }
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
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command(['force:analytics:template:create'])
      .it('should throw error when missing required name field', ctx => {
        expect(ctx.stderr).to.contain('Missing required flag');
      });

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
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
