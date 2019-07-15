import { expect, test } from '@salesforce/command/lib/test';
import { Messages } from '@salesforce/core';
import * as path from 'path';
import * as assert from 'yeoman-assert';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'messages');
export class TestFormatter {
  public static fileformatter(pathway, filename) {
    const files = [];
    const suffixarray = [
      '.app',
      '.app-meta.xml',
      '.auradoc',
      '.css',
      'Controller.js',
      'Helper.js',
      'Renderer.js',
      '.svg'
    ];
    suffixarray.forEach(element => {
      files.push(path.join('aura', pathway, filename + element));
    });
    return files;
  }
}

describe('Lightning app creation tests:', () => {
  describe('Check lightning app creation', () => {
    test
      .withOrg()
      .withProject()
      .stdout()
      .command([
        'force:lightning:app:create',
        '--appname',
        'foo',
        '--outputdir',
        'aura',
        '--template',
        'DefaultLightningApp'
      ])
      .it(
        'should create lightning app foo using DefaultLightningApp template and aura output directory',
        ctx => {
          assert.file(TestFormatter.fileformatter('foo', 'foo'));
          assert.fileContent(
            path.join('aura', 'foo', 'foo.app'),
            '<aura:application>\n\n</aura:application>',
            path.join('aura', 'foo', 'foo.app-meta.xml'),
            '<AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">'
          );
        }
      );
    test
      .withOrg()
      .withProject()
      .stdout()
      .command([
        'force:lightning:app:create',
        '--appname',
        'foo',
        '--outputdir',
        path.join('aura', 'testing')
      ])
      .it('should create lightning app foo in a new directory', ctx => {
        assert.file(
          TestFormatter.fileformatter(path.join('testing', 'foo'), 'foo')
        );
      });
  });
  describe('lightning app failures', () => {
    test
      .withOrg()
      .withProject()
      .stderr()
      .command([
        'force:lightning:app:create',
        '--appname',
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
      .withProject()
      .stderr()
      .command(['force:lightning:app:create', '--appname', 'foo'])
      .it('should throw missing aura parent folder error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('MissingAuraFolder'));
      });

    test
      .withOrg()
      .withProject()
      .stderr()
      .command(['force:lightning:app:create', '--outputdir', 'aura'])
      .it('should throw missing appname error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('MissingAppname'));
      });

    test
      .withOrg()
      .withProject()
      .stderr()
      .command([
        'force:lightning:app:create',
        '--appname',
        '/a',
        '--outputdir',
        'aura'
      ])
      .it('should throw invalid non alphanumeric appname error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('AlphaNumericNameError')
        );
      });

    test
      .withOrg()
      .withProject()
      .stderr()
      .command([
        'force:lightning:app:create',
        '--appname',
        '3aa',
        '--outputdir',
        'aura'
      ])
      .it('should throw invalid appname starting with numeric error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('NameMustStartWithLetterError')
        );
      });

    test
      .withOrg()
      .withProject()
      .stderr()
      .command([
        'force:lightning:app:create',
        '--appname',
        'a_',
        '--outputdir',
        'aura'
      ])
      .it('should throw invalid appname ending with underscore error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('EndWithUnderscoreError')
        );
      });

    test
      .withOrg()
      .withProject()
      .stderr()
      .command([
        'force:lightning:app:create',
        '--appname',
        'a__a',
        '--outputdir',
        'aura'
      ])
      .it('should throw invalid appname with double underscore error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('DoubleUnderscoreError')
        );
      });
  });
});
