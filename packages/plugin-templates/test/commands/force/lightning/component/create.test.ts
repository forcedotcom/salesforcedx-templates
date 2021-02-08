/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@salesforce/command/lib/test';
import { Messages, SfdxProject } from '@salesforce/core';
import * as path from 'path';
import { createSandbox, SinonSandbox } from 'sinon';
import * as assert from 'yeoman-assert';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages(
  '@salesforce/plugin-templates',
  'messages'
);

export class AuraLightningTestFormatter {
  public static fileformatter(pathway: string, filename: string): string[] {
    const files: string[] = [];
    const suffixarray = [
      '.cmp',
      '.auradoc',
      '.css',
      'Controller.js',
      'Helper.js',
      'Renderer.js',
      '.svg',
      '.design'
    ];
    suffixarray.forEach(element => {
      files.push(path.join('aura', pathway, filename + element));
    });
    return files;
  }
}

const SFDX_PROJECT_PATH = 'test-sfdx-project';
const TEST_USERNAME = 'test@example.com';
const projectPath = path.resolve(SFDX_PROJECT_PATH);
const sfdxProjectJson = {
  packageDirectories: [{ path: 'force-app', default: true }],
  namespace: '',
  sfdcLoginUrl: 'https://login.salesforce.com',
  sourceApiVersion: '49.0'
};

describe('Lightning component creation tests:', () => {
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

  describe('Check lightning aura components creation', () => {
    test
    .withOrg({ username: TEST_USERNAME }, true)
    .loadConfig({
      root: __dirname
    })
    .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command([
        'force:lightning:component:create',
        '--componentname',
        'foo',
        '--outputdir',
        'aura'
      ])
      .it(
        'should create lightning aura component files in the aura output directory',
        ctx => {
          assert.file(AuraLightningTestFormatter.fileformatter('foo', 'foo'));
          assert.file(path.join('aura', 'foo', 'foo.cmp-meta.xml'));
          assert.fileContent(
            path.join('aura', 'foo', 'foo.cmp-meta.xml'),
            '<AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">'
          );
        }
      );
  });

  describe('Check lightning aura components creation without -meta.xml file', () => {
    test
    .withOrg({ username: TEST_USERNAME }, true)
    .loadConfig({
      root: __dirname
    })
    .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command([
        'force:lightning:component:create',
        '--componentname',
        'internalflagtest',
        '--outputdir',
        'aura',
        '--internal'
      ])
      .it(
        'should create lightning aura component files in the aura output directory without a -meta.xml file',
        ctx => {
          assert.file(
            AuraLightningTestFormatter.fileformatter(
              'internalflagtest',
              'internalflagtest'
            )
          );
          assert.noFile(
            path.join(
              'aura',
              'internalflagtest',
              'internalflagtest.cmp-meta.xml'
            )
          );
        }
      );
  });

  describe('Check lightning web components creation without -meta-xml file', () => {
    test
    .withOrg({ username: TEST_USERNAME }, true)
    .loadConfig({
      root: __dirname
    })
    .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command([
        'force:lightning:component:create',
        '--componentname',
        'internallwctest',
        '--outputdir',
        'lwc',
        '--type',
        'lwc',
        '--internal'
      ])
      .it(
        'should create lightning web component files in the lwc output directory with the internal flag for disabling -meta.xml files',
        ctx => {
          assert.file(
            path.join('lwc', 'internallwctest', 'internallwctest.html')
          );
          assert.noFile(
            path.join('lwc', 'internallwctest', 'internallwctest.js-meta.xml')
          );
          assert.file(
            path.join('lwc', 'internallwctest', 'internallwctest.js')
          );
          assert.fileContent(
            path.join('lwc', 'internallwctest', 'internallwctest.js'),
            'export default class Internallwctest extends LightningElement {}'
          );
        }
      );
  });

  describe('Check lightning web components creation with -meta-xml file', () => {
    test
    .withOrg({ username: TEST_USERNAME }, true)
    .loadConfig({
      root: __dirname
    })
    .stub(process, 'cwd', () => projectPath)
      .stdout()
      .command([
        'force:lightning:component:create',
        '--componentname',
        'foo',
        '--outputdir',
        'lwc',
        '--type',
        'lwc'
      ])
      .it(
        'should create lightning web component files in the lwc output directory with the internal flag for disabling -meta.xml files',
        ctx => {
          assert.file(path.join('lwc', 'foo', 'foo.js-meta.xml'));
        }
      );
  });

  describe('lightning component failures', () => {
    test
    .withOrg({ username: TEST_USERNAME }, true)
    .loadConfig({
      root: __dirname
    })
    .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command(['force:lightning:component:create', '--outputdir', 'aura'])
      .it('should throw missing component name error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('MissingComponentName')
        );
      });

    test
    .withOrg({ username: TEST_USERNAME }, true)
    .loadConfig({
      root: __dirname
    })
    .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command(['force:lightning:component:create', '--componentname', 'foo'])
      .it('should throw missing aura parent folder error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('MissingAuraFolder'));
      });

    test
      .withOrg({ username: TEST_USERNAME }, true)
      .loadConfig({
        root: __dirname
      })
      .stub(process, 'cwd', () => projectPath)
      .stderr()
      .command([
        'force:lightning:component:create',
        '--componentname',
        'foo',
        '--type',
        'lwc'
      ])
      .it('should throw missing lwc parent folder error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('MissingLWCFolder'));
      });
  });
});
