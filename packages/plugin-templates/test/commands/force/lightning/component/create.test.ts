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
          assert.file(path.join('aura', 'foo', 'foo.cmp-meta.xml'));
          assert.fileContent(
            path.join('aura', 'foo', 'foo.cmp-meta.xml'),
            '<AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">'
          );
        }
      );

    test
      .withOrg()
      //.withProject()
      .stdout()
      .command([
        'force:lightning:component:create',
        '--componentname',
        'foo',
        '--outputdir',
        'aura',
        '--template',
        'default'
      ])
      .it(
        'should create lightning aura component files from default template in the aura output directory',
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
      //.withProject()
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
      //.withProject()
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
          assert.noFile(
            path.join('lwc', 'internallwctest', 'internallwctest.js-meta.xml')
          );
          assert.file(
            path.join('lwc', 'internallwctest', 'internallwctest.html')
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
          assert.file(path.join('lwc', 'foo', 'foo.js-meta.xml'));
          assert.file(path.join('lwc', 'foo', 'foo.html'));
          assert.file(path.join('lwc', 'foo', 'foo.js'));
          assert.fileContent(
            path.join('lwc', 'foo', 'foo.js'),
            'export default class Foo extends LightningElement {}'
          );
        }
      );

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
        'lwc',
        '--template',
        'default'
      ])
      .it(
        'should create lightning web component files from default template in the lwc output directory',
        ctx => {
          assert.file(path.join('lwc', 'foo', 'foo.js-meta.xml'));
          assert.file(path.join('lwc', 'foo', 'foo.html'));
          assert.file(path.join('lwc', 'foo', 'foo.js'));
          assert.fileContent(
            path.join('lwc', 'foo', 'foo.js'),
            'export default class Foo extends LightningElement {}'
          );
        }
      );
  });

  describe('Check analytics dashboard lwc creation', () => {
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
        'lwc',
        '--template',
        'analyticsDashboard'
      ])
      .it(
        'should create analyticsDashboard lwc files in the lwc output directory',
        ctx => {
          const jsFile = path.join('lwc', 'foo', 'foo.js');
          const metaFile = path.join('lwc', 'foo', 'foo.js-meta.xml');
          assert.file(metaFile);
          assert.file(path.join('lwc', 'foo', 'foo.html'));
          assert.file(jsFile);
          assert.fileContent(metaFile, '<masterLabel>Foo</masterLabel>');
          assert.fileContent(metaFile, '<target>analytics__Dashboard</target>');
          assert.fileContent(metaFile, 'targets="analytics__Dashboard"');
          assert.fileContent(metaFile, '<hasStep>false</hasStep>');
          assert.fileContent(
            jsFile,
            'export default class Foo extends LightningElement {'
          );
          assert.fileContent(jsFile, '@api getState;');
          assert.fileContent(jsFile, '@api setState;');
          assert.fileContent(jsFile, '@api refresh;');
        }
      );
    test
      .withOrg()
      //.withProject()
      .stdout()
      .command([
        'force:lightning:component:create',
        '--componentname',
        'fooWithStep',
        '--outputdir',
        'lwc',
        '--type',
        'lwc',
        '--template',
        'analyticsDashboardWithStep'
      ])
      .it(
        'should create analyticsDashboardWithStep lwc files in the lwc output directory',
        ctx => {
          const jsFile = path.join('lwc', 'fooWithStep', 'fooWithStep.js');
          const metaFile = path.join(
            'lwc',
            'fooWithStep',
            'fooWithStep.js-meta.xml'
          );
          assert.file(metaFile);
          assert.file(path.join('lwc', 'fooWithStep', 'fooWithStep.html'));
          assert.file(jsFile);
          assert.fileContent(
            metaFile,
            '<masterLabel>Foo With Step</masterLabel>'
          );
          assert.fileContent(metaFile, '<target>analytics__Dashboard</target>');
          assert.fileContent(metaFile, 'targets="analytics__Dashboard"');
          assert.fileContent(metaFile, '<hasStep>true</hasStep>');
          assert.fileContent(
            jsFile,
            'export default class FooWithStep extends LightningElement {'
          );
          assert.fileContent(jsFile, '@api getState;');
          assert.fileContent(jsFile, '@api setState;');
          assert.fileContent(jsFile, '@api refresh;');
          assert.fileContent(jsFile, '@api results;');
          assert.fileContent(jsFile, '@api metadata;');
          assert.fileContent(jsFile, '@api selection;');
          assert.fileContent(jsFile, '@api setSelection;');
          assert.fileContent(jsFile, '@api selectMode;');
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
    test
      .withOrg()
      //.withProject()
      .stderr()
      .command([
        'force:lightning:component:create',
        '--outputdir',
        'lwc',
        '--componentname',
        'foo',
        '--type',
        'lwc',
        '--template',
        'foo'
      ])
      .it('should throw invalid template error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('InvalidTemplate'));
      });
    test
      .withOrg()
      //.withProject()
      .stderr()
      .command([
        'force:lightning:component:create',
        '--outputdir',
        'aura',
        '--componentname',
        'foo',
        '--type',
        'aura',
        '--template',
        'analyticsDashboard'
      ])
      .it('should throw missing template error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('MissingLightningComponentTemplate', [
            'analyticsDashboard',
            'aura'
          ])
        );
      });
  });
});
