/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, test } from '@salesforce/command/lib/test';
import { Messages } from '@salesforce/core';
import * as path from 'path';
import * as assert from 'yeoman-assert';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');

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

describe('Lightning component creation tests:', () => {
  describe('Check lightning aura components creation', () => {
    test
      .withOrg()
      .withProject()
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
      .withOrg()
      .withProject()
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
      .withOrg()
      .withProject()
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
      .withOrg()
      .withProject()
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
      .withOrg()
      .withProject()
      .stderr()
      .command(['force:lightning:component:create', '--outputdir', 'aura'])
      .it('should throw missing component name error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('MissingComponentName')
        );
      });
    test
      .withOrg()
      .withProject()
      .stderr()
      .command(['force:lightning:component:create', '--componentname', 'foo'])
      .it('should throw missing aura parent folder error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('MissingAuraFolder'));
      });
    test
      .withOrg()
      .withProject()
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
