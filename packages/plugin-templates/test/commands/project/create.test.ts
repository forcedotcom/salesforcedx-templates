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

const standardfolderarray = [
  'aura',
  'applications',
  'classes',
  'contentassets',
  'flexipages',
  'layouts',
  'objects',
  'permissionsets',
  'staticresources',
  'tabs',
  'triggers'
];
const filestocopy = [
  '.eslintignore',
  '.forceignore',
  '.gitignore',
  '.prettierignore',
  '.prettierrc',
  'jest.config.js',
  'package.json'
];
const emptyfolderarray = ['aura', 'lwc'];
const analyticsfolderarray = ['aura', 'classes', 'lwc', 'waveTemplates'];
const huskyhookarray = ['pre-commit'];
const vscodearray = ['extensions', 'launch', 'settings'];

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages(
  '@salesforce/plugin-templates',
  'messages'
);

describe('Project creation tests:', () => {
  describe('Check project creation', () => {
    test
      .withOrg()
      //.withProject()
      .stdout()
      .command(['force:project:create', '--projectname', 'foo'])
      .it('should create project with default values and foo name', ctx => {
        assert.file([path.join('foo', 'config', 'project-scratch-def.json')]);
        assert.file([path.join('foo', 'scripts', 'soql', 'account.soql')]);
        assert.file([path.join('foo', 'scripts', 'apex', 'hello.apex')]);
        assert.file([path.join('foo', 'README.md')]);
        assert.file([path.join('foo', 'sfdx-project.json')]);
        assert.fileContent(
          path.join('foo', 'sfdx-project.json'),
          '"namespace": "",'
        );
        assert.fileContent(
          path.join('foo', 'sfdx-project.json'),
          '"path": "force-app",'
        );
        assert.fileContent(
          path.join('foo', 'sfdx-project.json'),
          'sourceApiVersion'
        );
        assert.fileContent(
          path.join('foo', 'sfdx-project.json'),
          '"sfdcLoginUrl": "https://login.salesforce.com"'
        );
        assert.fileContent(
          path.join('foo', 'sfdx-project.json'),
          '"name": "foo"'
        );

        // Check for Husky hooks
        for (const file of huskyhookarray) {
          assert.file([path.join('foo', '.husky', file)]);
        }

        for (const file of vscodearray) {
          assert.file([path.join('foo', '.vscode', `${file}.json`)]);
        }
        assert.fileContent(
          path.join('foo', 'README.md'),
          messages.getMessage('StandardReadMe')
        );
        assert.file([
          path.join(
            'foo',
            'force-app',
            'main',
            'default',
            'lwc',
            '.eslintrc.json'
          )
        ]);
        assert.file([
          path.join(
            'foo',
            'force-app',
            'main',
            'default',
            'aura',
            '.eslintrc.json'
          )
        ]);
        for (const file of filestocopy) {
          assert.file([path.join('foo', file)]);
        }
        for (const folder of standardfolderarray) {
          assert(
            fs.existsSync(
              path.join('foo', 'force-app', 'main', 'default', folder)
            )
          );
        }
      });

    test
      .withOrg()
      //.withProject()
      .stdout()
      .command([
        'force:project:create',
        '--projectname',
        'foo',
        '--outputdir',
        'test outputdir'
      ])
      .it(
        'should create project with default values and foo name in a custom output directory with spaces in its name',
        ctx => {
          assert.file([
            path.join(
              'test outputdir',
              'foo',
              'config',
              'project-scratch-def.json'
            )
          ]);
          assert.file([path.join('test outputdir', 'foo', 'README.md')]);
          assert.file([
            path.join('test outputdir', 'foo', 'sfdx-project.json')
          ]);
          for (const file of vscodearray) {
            assert.file([
              path.join('test outputdir', 'foo', '.vscode', `${file}.json`)
            ]);
          }
          assert.file([
            path.join(
              'test outputdir',
              'foo',
              'force-app',
              'main',
              'default',
              'lwc',
              '.eslintrc.json'
            )
          ]);
          assert.file([
            path.join(
              'test outputdir',
              'foo',
              'force-app',
              'main',
              'default',
              'aura',
              '.eslintrc.json'
            )
          ]);
          for (const file of filestocopy) {
            assert.file([path.join('test outputdir', 'foo', file)]);
          }
          for (const folder of standardfolderarray) {
            assert(
              fs.existsSync(
                path.join(
                  'test outputdir',
                  'foo',
                  'force-app',
                  'main',
                  'default',
                  folder
                )
              )
            );
          }
        }
      );

    test
      .withOrg()
      //.withProject()
      .stdout()
      .command([
        'force:project:create',
        '--projectname',
        'duplicate-project-test',
        '--outputdir',
        'test outputdir'
      ])
      .it(
        'should not create duplicate project in the directory where command is executed',
        ctx => {
          assert.file(
            path.join('test outputdir', 'duplicate-project-test', 'force-app')
          );
          assert.noFile(path.join('.', 'duplicate-project-test', 'force-app'));
        }
      );

    test
      .withOrg()
      //.withProject()
      .stdout()
      .command(['force:project:create', '--projectname', 'foo-project'])
      .it(
        'should create project with default values and foo-project name in a custom output directory with spaces in its name',
        ctx => {
          assert.file([
            path.join('foo-project', 'config', 'project-scratch-def.json')
          ]);
          assert.file([path.join('foo-project', 'README.md')]);
          assert.file([path.join('foo-project', 'sfdx-project.json')]);
          for (const file of vscodearray) {
            assert.file([path.join('foo-project', '.vscode', `${file}.json`)]);
          }
          assert.file([
            path.join(
              'foo-project',
              'force-app',
              'main',
              'default',
              'lwc',
              '.eslintrc.json'
            )
          ]);
          for (const file of filestocopy) {
            assert.file([path.join('foo-project', file)]);
          }
          for (const folder of standardfolderarray) {
            assert(
              fs.existsSync(
                path.join('foo-project', 'force-app', 'main', 'default', folder)
              )
            );
          }
        }
      );

    test
      .withOrg()
      //.withProject()
      .stdout()
      .command([
        'force:project:create',
        '--projectname',
        'footest',
        '--manifest'
      ])
      .it(
        'should create project with footest name and manifest folder',
        ctx => {
          assert.file([path.join('footest', 'manifest', 'package.xml')]);
        }
      );

    test
      .withOrg()
      //.withProject()
      .stdout()
      .command([
        'force:project:create',
        '--projectname',
        'fooempty',
        '--template',
        'empty',
        '--defaultpackagedir',
        'empty',
        '--namespace',
        'testnamespace'
      ])
      .it(
        'should create project with fooempty name, empty template, empty default package directory, and a custom namespace',
        ctx => {
          assert.file(path.join('fooempty', '.forceignore'));
          assert.fileContent(
            path.join('fooempty', 'sfdx-project.json'),
            '"namespace": "testnamespace",'
          );
          assert.fileContent(
            path.join('fooempty', 'sfdx-project.json'),
            '"path": "empty",'
          );
          assert.fileContent(
            path.join('fooempty', 'sfdx-project.json'),
            'sourceApiVersion'
          );
          for (const folder of emptyfolderarray) {
            assert(
              fs.existsSync(
                path.join('fooempty', 'empty', 'main', 'default', folder)
              )
            );
          }
          assert.fileContent(
            path.join('fooempty', 'README.md'),
            '# Salesforce DX Project: Next Steps'
          );
        }
      );

    test
      .withOrg()
      //.withProject()
      .stdout()
      .command([
        'force:project:create',
        '--projectname',
        'fooempty',
        '--template',
        'empty',
        '--defaultpackagedir',
        'empty',
        '--loginurl',
        'https://vandelay-industries.my.salesforce.com'
      ])
      .it(
        'should create project with fooempty name, empty template, empty default package directory, empty namespace and custom login url',
        ctx => {
          assert.file(path.join('fooempty', '.forceignore'));
          assert.fileContent(
            path.join('fooempty', 'sfdx-project.json'),
            '"namespace": "",'
          );
          assert.fileContent(
            path.join('fooempty', 'sfdx-project.json'),
            '"path": "empty",'
          );
          assert.fileContent(
            path.join('fooempty', 'sfdx-project.json'),
            'sourceApiVersion'
          );
          assert.fileContent(
            path.join('fooempty', 'sfdx-project.json'),
            '"sfdcLoginUrl": "https://vandelay-industries.my.salesforce.com"'
          );
          for (const folder of emptyfolderarray) {
            assert(
              fs.existsSync(
                path.join('fooempty', 'empty', 'main', 'default', folder)
              )
            );
          }
          assert.fileContent(
            path.join('fooempty', 'README.md'),
            '# Salesforce DX Project: Next Steps'
          );
        }
      );

    test
      .withOrg()
      //.withProject()
      .stdout()
      .command([
        'force:project:create',
        '--projectname',
        'analytics1',
        '--template',
        'analytics',
        '--manifest'
      ])
      .it(
        'should create project with analytics1 name using analytics template and a manifest',
        ctx => {
          assert.file(path.join('analytics1', '.forceignore'));
          assert.fileContent(
            path.join('analytics1', 'sfdx-project.json'),
            '"path": "force-app",'
          );
          assert.fileContent(
            path.join('analytics1', 'sfdx-project.json'),
            'sourceApiVersion'
          );
          const srcDir = path.join(
            'analytics1',
            'force-app',
            'main',
            'default'
          );
          for (const folder of analyticsfolderarray) {
            const dir = path.join(srcDir, folder);
            assert(fs.existsSync(dir), `Missing ${dir}`);
          }

          // Check for Husky hooks
          for (const file of huskyhookarray) {
            assert.file([path.join('foo', '.husky', file)]);
          }

          for (const file of vscodearray) {
            assert.file(path.join('analytics1', '.vscode', `${file}.json`));
          }
          assert.fileContent(
            path.join('analytics1', '.vscode', 'extensions.json'),
            '"salesforce.analyticsdx-vscode"'
          );
          assert.fileContent(
            path.join('analytics1', '.vscode', 'extensions.json'),
            '"salesforce.salesforcedx-vscode"'
          );
          assert.fileContent(
            path.join('analytics1', 'config', 'project-scratch-def.json'),
            '"DevelopmentWave"'
          );
          assert.fileContent(
            path.join('analytics1', 'manifest', 'package.xml'),
            '<name>WaveTemplateBundle</name>'
          );
          assert.fileContent(
            path.join('analytics1', 'README.md'),
            '# Salesforce DX Project: Next Steps'
          );
          assert.file([path.join(srcDir, 'lwc', '.eslintrc.json')]);
          assert.file([path.join(srcDir, 'aura', '.eslintrc.json')]);
        }
      );

    test
      .command(['force:project:create', '-n', 'GitIgnoreTest'])
      .it('should rename gitignore to .gitignore in standard template', ctx => {
        const srcPath = path.join(
          path.dirname(require.resolve('@salesforce/templates')),
          'templates/project'
        );
        assert.noFile(path.join(srcPath, '.gitignore'));
        assert.file(path.join(srcPath, 'gitignore'));
        assert.file(path.normalize('GitIgnoreTest/.gitignore'));
      });

    test
      .command([
        'force:project:create',
        '-n',
        'GitIgnoreTest2',
        '-t',
        'analytics'
      ])
      .it(
        'should rename gitignore to .gitignore in analytics template',
        ctx => {
          const srcPath = path.join(
            path.dirname(require.resolve('@salesforce/templates')),
            'templates/project'
          );
          assert.noFile(path.join(srcPath, '.gitignore'));
          assert.file(path.join(srcPath, 'gitignore'));
          assert.file(path.normalize('GitIgnoreTest2/.gitignore'));
        }
      );
  });

  describe('project creation failures', () => {
    test
      .withOrg()
      //.withProject()
      .stderr()
      .command(['force:project:create'])
      .it('should throw invalid template name error', ctx => {
        expect(ctx.stderr).to.contain(
          messages.getMessage('MissingProjectname')
        );
      });
    test
      .withOrg()
      //.withProject()
      .stderr()
      .command([
        'force:project:create',
        '--projectname',
        'foo',
        '--template',
        'foo'
      ])
      .it('should throw invalid template name error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('InvalidTemplate'));
      });
  });
});
