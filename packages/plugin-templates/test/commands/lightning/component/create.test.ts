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
const messages = Messages.loadMessages(
  '@salesforce/plugin-templates',
  'messages'
);
export class AuraLightningTestFormatter {
  public static fileformatter(pathway: string, filename: string): string[] {
    const files: string[] = [];
    const suffixarray = [
      '.cmp',
      '.cmp-meta.xml',
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
      //.withProject()
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
          assert.fileContent(
            path.join('aura', 'foo', 'foo.cmp-meta.xml'),
            '<AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">'
          );
        }
      );
  });
  describe('Check lightning web components creation', () => {
    test
      .stdout()
      .command([
        'force:lightning:component:create',
        '--componentname',
        'FooBar',
        '--outputdir',
        'lwc',
        '--type',
        'lwc'
      ])
      .it('should force first letter of component name to lowercase', ctx => {
        const camelCaseName = 'fooBar';
        const bundlePath = path.join('lwc', camelCaseName);
        const jsPath = path.join(bundlePath, `${camelCaseName}.js`);
        assert.file(bundlePath);
        assert.file(jsPath);
        assert.file(path.join(bundlePath, `${camelCaseName}.html`));
        assert.file(path.join(bundlePath, `${camelCaseName}.js-meta.xml`));
        // but verify the class name is consistent with the exact flag value
        assert.fileContent(
          jsPath,
          'export default class FooBar extends LightningElement {}'
        );
      });

    test
      .withOrg()
      //.withProject()
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
        'should create lightning web component files in the lwc output directory',
        ctx => {
          assert.file(path.join('lwc', 'foo', 'foo.html'));
          assert.file(path.join('lwc', 'foo', 'foo.js-meta.xml'));
          assert.file(path.join('lwc', 'foo', 'foo.js'));
          assert.fileContent(
            path.join('lwc', 'foo', 'foo.js'),
            'export default class Foo extends LightningElement {}'
          );
        }
      );
  });
  describe('lightning component failures', () => {
    test
      .withOrg()
      //.withProject()
      .stderr()
      .command(['force:lightning:component:create', '--outputdir', 'aura'])
      .it('should throw missing component name error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('MissingComponentName')
        );
      });
    test
      .withOrg()
      //.withProject()
      .stderr()
      .command(['force:lightning:component:create', '--componentname', 'foo'])
      .it('should throw missing aura parent folder error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('MissingAuraFolder'));
      });
    test
      .withOrg()
      //.withProject()
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
