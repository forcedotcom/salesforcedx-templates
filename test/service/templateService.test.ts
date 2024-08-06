/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fs from 'fs';
import { rm } from 'node:fs/promises';
import got from 'got';
import * as path from 'path';
import * as sinon from 'sinon';
import { TemplateService, TemplateType } from '../../src';
import { nls } from '../../src/i18n';
import { getStoragePathForCustomTemplates } from '../../src/service/gitRepoUtils';
import { getProxyForUrl } from 'proxy-from-env';
import {
  BaseGenerator,
  setCustomTemplatesRootPathOrGitRepo,
  getDefaultApiVersion,
} from '../../src/generators/baseGenerator';
import { importGenerator } from '../../src/service/templateService';

chai.use(chaiAsPromised);
chai.config.truncateThreshold = 100000;
chai.should();

async function remove(file: string) {
  await rm(file, { force: true, recursive: true });
}

function assertFileContent(file: string, regex: string | RegExp) {
  const exists = fs.existsSync(file);
  chai.expect(exists).to.be.true;

  const body = fs.readFileSync(file, 'utf8');

  let match = false;
  if (typeof regex === 'string') {
    match = body.indexOf(regex) !== -1;
  } else {
    match = regex.test(body);
  }

  chai.expect(match, `${file} did not match '${regex}'. Contained:\n\n${body}`);
}

describe('TemplateService', () => {
  const apiVersion = getDefaultApiVersion();
  describe('Setting cwd', () => {
    it('should set default cwd of yeoman env to process cwd on getting instance', () => {
      const templateService = TemplateService.getInstance();
      chai.expect(templateService.cwd).to.equal(process.cwd());
    });

    it('should set cwd of yeoman env on getting instance', () => {
      const mockWorkspacePath = path.join('root', 'project');
      const templateService = TemplateService.getInstance(mockWorkspacePath);
      chai.expect(templateService.cwd).to.equal(mockWorkspacePath);
    });

    it('should set cwd of yeoman env', () => {
      const mockWorkspacePath = path.join('root', 'project1');
      const mockNewWorkspacePath = path.join('root', 'project2');
      const templateService = TemplateService.getInstance(mockWorkspacePath);
      templateService.cwd = mockNewWorkspacePath;
      chai.expect(templateService.cwd).to.equal(mockNewWorkspacePath);
    });

    it('should create template', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.ApexClass, {
        template: 'DefaultApexClass',
        classname: 'LibraryCreateClass',
        outputdir: path.join('testsoutput', 'libraryCreate', 'apexClass'),
      });
      const expectedApexClassPath = path.join(
        'testsoutput',
        'libraryCreate',
        'apexClass',
        'LibraryCreateClass.cls'
      );
      const expectedApexClassContent =
        'public with sharing class LibraryCreateClass';
      const expectedApexClassMetaPath = path.join(
        'testsoutput',
        'libraryCreate',
        'apexClass',
        'LibraryCreateClass.cls-meta.xml'
      );
      const expectedApexClassMetaContent = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">',
        `    <apiVersion>${apiVersion}</apiVersion>`,
        '    <status>Active</status>',
        '</ApexClass>',
      ].join('\n');

      assertFileContent(expectedApexClassPath, expectedApexClassContent);
      assertFileContent(
        expectedApexClassMetaPath,
        expectedApexClassMetaContent
      );
    });
  });

  describe('create custom template', () => {
    const TEST_CUSTOM_TEMPLATES_REPO =
      'https://github.com/forcedotcom/salesforcedx-templates/tree/main/test/custom-templates';
    const TEST_CUSTOM_TEMPLATES_STORAGE_PATH = getStoragePathForCustomTemplates(
      new URL(TEST_CUSTOM_TEMPLATES_REPO)
    );

    beforeEach(async () => {
      await remove(
        path.join('testsoutput', 'customLibraryCreate', 'apexclass')
      );
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should create custom template from local folder', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const customTemplates = path.join('test', 'custom-templates');
      await templateService.create(
        TemplateType.ApexClass,
        {
          template: 'DefaultApexClass',
          classname: 'LibraryCreateClass',
          outputdir: path.join(
            'testsoutput',
            'customLibraryCreate',
            'apexClass'
          ),
        },
        customTemplates
      );
      const expectedApexClassPath = path.join(
        'testsoutput',
        'customLibraryCreate',
        'apexClass',
        'LibraryCreateClass.cls'
      );
      const expectedApexClassContent =
        'public with sharing class CustomLibraryCreateClass';
      const expectedApexClassMetaPath = path.join(
        'testsoutput',
        'customLibraryCreate',
        'apexClass',
        'LibraryCreateClass.cls-meta.xml'
      );
      const expectedApexClassMetaContent = `<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${apiVersion}</apiVersion>
    <status>Inactive</status>
</ApexClass>`;

      assertFileContent(expectedApexClassPath, expectedApexClassContent);
      assertFileContent(
        expectedApexClassMetaPath,
        expectedApexClassMetaContent
      );
    });

    it('should create custom template from GitHub repository', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO;
      await remove(TEST_CUSTOM_TEMPLATES_STORAGE_PATH);

      await templateService.create(
        TemplateType.ApexClass,
        {
          template: 'DefaultApexClass',
          classname: 'LibraryCreateClass',
          outputdir: path.join(
            'testsoutput',
            'customLibraryCreate',
            'apexClass'
          ),
        },
        customTemplates
      );
      const expectedApexClassPath = path.join(
        'testsoutput',
        'customLibraryCreate',
        'apexClass',
        'LibraryCreateClass.cls'
      );
      const expectedApexClassContent =
        'public with sharing class CustomLibraryCreateClass';
      const expectedApexClassMetaPath = path.join(
        'testsoutput',
        'customLibraryCreate',
        'apexClass',
        'LibraryCreateClass.cls-meta.xml'
      );
      const expectedApexClassMetaContent = `<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${apiVersion}</apiVersion>
    <status>Inactive</status>
</ApexClass>
`;
      assertFileContent(expectedApexClassPath, expectedApexClassContent);
      assertFileContent(
        expectedApexClassMetaPath,
        expectedApexClassMetaContent
      );
    });

    it('should throw error if local custom templates do not exist', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const localPath = 'this-folder-does-not-exist';
      const customTemplates = localPath;
      await templateService
        .create(
          TemplateType.ApexClass,
          {
            template: 'DefaultApexClass',
            classname: 'LibraryCreateClass',
            outputdir: path.join(
              'testsoutput',
              'customLibraryCreate',
              'apexClass'
            ),
          },
          customTemplates
        )
        .should.be.rejectedWith(
          Error,
          nls.localize('localCustomTemplateDoNotExist', localPath)
        );
    });

    it('should throw error if cannot retrieve default branch', async () => {
      const mockIt = {
        getProxyForUrl,
      };
      // @ts-ignore - function signature is not compatible with sinon stub
      sinon.stub(mockIt, 'getProxyForUrl').returns(undefined);
      const templateService = TemplateService.getInstance(process.cwd());
      const customTemplates =
        'https://github.com/forcedotcom/this-repo-does-not-exist';
      await templateService
        .create(
          TemplateType.ApexClass,
          {
            template: 'DefaultApexClass',
            classname: 'LibraryCreateClass',
            outputdir: path.join(
              'testsoutput',
              'customLibraryCreate',
              'apexClass'
            ),
          },
          customTemplates
        )
        .should.be.rejectedWith(
          Error,
          nls.localize(
            'customTemplatesCannotRetrieveDefaultBranch',
            customTemplates
          )
        );
    });

    it('should throw error if repo url is invalid', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const customTemplates =
        'https://github.com/forcedotcom/salesforcedx-templates/invalid-url';
      await templateService
        .create(
          TemplateType.ApexClass,
          {
            template: 'DefaultApexClass',
            classname: 'LibraryCreateClass',
            outputdir: path.join(
              'testsoutput',
              'customLibraryCreate',
              'apexClass'
            ),
          },
          customTemplates
        )
        .should.be.rejectedWith(
          Error,
          nls.localize('customTemplatesInvalidRepoUrl', customTemplates)
        );
    });

    it('should throw error if repo protocol is not https', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO.replace(
        'https',
        'http'
      );
      await templateService
        .create(
          TemplateType.ApexClass,
          {
            template: 'DefaultApexClass',
            classname: 'LibraryCreateClass',
            outputdir: path.join(
              'testsoutput',
              'customLibraryCreate',
              'apexClass'
            ),
          },
          customTemplates
        )
        .should.be.rejectedWith(
          Error,
          nls.localize('customTemplatesShouldUseHttpsProtocol', '"http:"')
        );
    });

    it('should throw error if not a GitHub repo', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO.replace(
        'github.com',
        'gitlab.com'
      );
      await templateService
        .create(
          TemplateType.ApexClass,
          {
            template: 'DefaultApexClass',
            classname: 'LibraryCreateClass',
            outputdir: path.join(
              'testsoutput',
              'customLibraryCreate',
              'apexClass'
            ),
          },
          customTemplates
        )
        .should.be.rejectedWith(
          Error,
          nls.localize('customTemplatesSupportsGitHubOnly', customTemplates)
        );
    });

    it('should download the repo if the folder does not exist', async () => {
      sinon
        .stub(fs, 'existsSync')
        .withArgs(TEST_CUSTOM_TEMPLATES_STORAGE_PATH)
        .returns(false);
      const streamStub = sinon.spy(got, 'stream');
      await remove(TEST_CUSTOM_TEMPLATES_STORAGE_PATH);
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO;

      await setCustomTemplatesRootPathOrGitRepo(customTemplates);

      sinon.assert.callCount(streamStub, 1);
    });

    it('should not download the repo if the folder already exists', async () => {
      sinon
        .stub(fs, 'existsSync')
        .withArgs(TEST_CUSTOM_TEMPLATES_STORAGE_PATH)
        .returns(true);
      const streamStub = sinon.spy(got, 'stream');

      await remove(TEST_CUSTOM_TEMPLATES_STORAGE_PATH);
      fs.mkdirSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH, { recursive: true });
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO;

      await setCustomTemplatesRootPathOrGitRepo(customTemplates);

      sinon.assert.notCalled(streamStub);
    });

    it('should download the repo if the folder already exists, but forcing a redownload', async () => {
      sinon
        .stub(fs, 'existsSync')
        .withArgs(TEST_CUSTOM_TEMPLATES_STORAGE_PATH)
        .returns(true);
      const streamStub = sinon.spy(got, 'stream');
      await remove(TEST_CUSTOM_TEMPLATES_STORAGE_PATH);
      fs.mkdirSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH, { recursive: true });
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO;

      const forceLoadingRemoteRepo = true;
      await setCustomTemplatesRootPathOrGitRepo(
        customTemplates,
        forceLoadingRemoteRepo
      );

      sinon.assert.calledOnce(streamStub);
    });
  }).timeout(20000);

  describe('create template', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('create template should return created output', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'apexClass'));
      const templateService = TemplateService.getInstance(process.cwd());
      const result = await templateService.create(TemplateType.ApexClass, {
        template: 'DefaultApexClass',
        classname: 'LibraryCreateClass',
        outputdir: path.join('testsoutput', 'libraryCreate', 'apexClass'),
      });

      chai
        .expect(result.outputDir)
        .to.equal(
          path.resolve(process.cwd(), 'testsoutput/libraryCreate/apexClass'),
          'outputDir property did not match'
        );

      chai
        .expect(result.created)
        .to.eql(
          [
            path.normalize(
              'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls'
            ),
            path.normalize(
              'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls-meta.xml'
            ),
          ],
          'Created property did not match'
        );

      const actual = `target dir = ${path.resolve(
        process.cwd(),
        'testsoutput/libraryCreate/apexClass'
      )}\n  create ${path.normalize(
        'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls'
      )}\n  create ${path.normalize(
        'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls-meta.xml'
      )}\n`;

      chai
        .expect(result.rawOutput)
        .to.equal(actual, 'Actual property did not match');
    });

    it('should reject if create template fails', async () => {
      sinon.stub(BaseGenerator.prototype, 'run').throws(new Error('error'));
      const templateService = TemplateService.getInstance(process.cwd());
      try {
        await templateService.create(TemplateType.ApexClass, {
          template: 'DefaultApexClass',
          classname: 'LibraryCreateClass',
          outputdir: path.join('testsoutput', 'libraryCreate', 'apexClass'),
        });
        throw new Error('should have thrown an error');
      } catch (error) {
        const err = error as Error;
        chai.expect(err.message).to.equal('error');
      }
    });
  });

  describe('Generators', () => {
    it('should have a generator for each TemplateType', () => {
      const templateTypes = Object.values(TemplateType).filter(
        (value) => typeof value === 'number'
      );

      for (const templateType of templateTypes) {
        try {
          // @ts-expect-error because we loose type safety when iterating over the values of an enum
          const generator = importGenerator(templateType);
          chai.expect(generator).to.not.be.undefined;
        } catch {
          throw new Error(
            `No generator found for template type: ${
              TemplateType[templateType as number]
            }`
          );
        }
      }
    });

    it('should create AnalyticsTemplate', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'waveTemplates'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(
        TemplateType.AnalyticsTemplate,
        {
          templatename: 'analytics',
          outputdir: path.join('testsoutput', 'libraryCreate', 'waveTemplates'),
        }
      );

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/waveTemplates/analytics/dashboards/analyticsDashboard.json',
            'testsoutput/libraryCreate/waveTemplates/analytics/app-to-template-rules.json',
            'testsoutput/libraryCreate/waveTemplates/analytics/folder.json',
            'testsoutput/libraryCreate/waveTemplates/analytics/releaseNotes.html',
            'testsoutput/libraryCreate/waveTemplates/analytics/template-info.json',
            'testsoutput/libraryCreate/waveTemplates/analytics/template-to-app-rules.json',
            'testsoutput/libraryCreate/waveTemplates/analytics/ui.json',
            'testsoutput/libraryCreate/waveTemplates/analytics/variables.json',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create ApexClass', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'apexClass'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.ApexClass, {
        template: 'DefaultApexClass',
        classname: 'LibraryCreateClass',
        outputdir: path.join('testsoutput', 'libraryCreate', 'apexClass'),
      });

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls',
            'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls-meta.xml',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create ApexTrigger', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'apexTrigger'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.ApexTrigger, {
        triggername: 'LibraryCreateTrigger',
        sobject: 'Account',
        event: 'before insert',
        outputdir: path.join('testsoutput', 'libraryCreate', 'apexTrigger'),
        template: 'ApexTrigger',
      });

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/apexTrigger/LibraryCreateTrigger.trigger',
            'testsoutput/libraryCreate/apexTrigger/LibraryCreateTrigger.trigger-meta.xml',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create LightningApp', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'aura'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.LightningApp, {
        appname: 'LibraryCreateApp',
        internal: false,
        outputdir: path.join('testsoutput', 'libraryCreate', 'aura'),
        template: 'DefaultLightningApp',
      });

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/aura/LibraryCreateApp/LibraryCreateApp.app-meta.xml',
            'testsoutput/libraryCreate/aura/LibraryCreateApp/LibraryCreateApp.app',
            'testsoutput/libraryCreate/aura/LibraryCreateApp/LibraryCreateApp.auradoc',
            'testsoutput/libraryCreate/aura/LibraryCreateApp/LibraryCreateAppController.js',
            'testsoutput/libraryCreate/aura/LibraryCreateApp/LibraryCreateApp.css',
            'testsoutput/libraryCreate/aura/LibraryCreateApp/LibraryCreateAppHelper.js',
            'testsoutput/libraryCreate/aura/LibraryCreateApp/LibraryCreateAppRenderer.js',
            'testsoutput/libraryCreate/aura/LibraryCreateApp/LibraryCreateApp.svg',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create LightningComponent (aura)', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'aura'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(
        TemplateType.LightningComponent,
        {
          componentname: 'LibraryCreateComponent',
          outputdir: path.join('testsoutput', 'libraryCreate', 'aura'),
          template: 'default',
          type: 'aura',
        }
      );

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/aura/LibraryCreateComponent/LibraryCreateComponent.cmp-meta.xml',
            'testsoutput/libraryCreate/aura/LibraryCreateComponent/LibraryCreateComponent.auradoc',
            'testsoutput/libraryCreate/aura/LibraryCreateComponent/LibraryCreateComponent.cmp',
            'testsoutput/libraryCreate/aura/LibraryCreateComponent/LibraryCreateComponent.css',
            'testsoutput/libraryCreate/aura/LibraryCreateComponent/LibraryCreateComponent.design',
            'testsoutput/libraryCreate/aura/LibraryCreateComponent/LibraryCreateComponent.svg',
            'testsoutput/libraryCreate/aura/LibraryCreateComponent/LibraryCreateComponentController.js',
            'testsoutput/libraryCreate/aura/LibraryCreateComponent/LibraryCreateComponentHelper.js',
            'testsoutput/libraryCreate/aura/LibraryCreateComponent/LibraryCreateComponentRenderer.js',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create LightningComponent (lwc)', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'lwc'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(
        TemplateType.LightningComponent,
        {
          componentname: 'LibraryCreateComponent',
          outputdir: path.join('testsoutput', 'libraryCreate', 'lwc'),
          template: 'default',
          type: 'lwc',
        }
      );

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/lwc/libraryCreateComponent/libraryCreateComponent.js',
            'testsoutput/libraryCreate/lwc/libraryCreateComponent/libraryCreateComponent.html',
            'testsoutput/libraryCreate/lwc/libraryCreateComponent/__tests__/libraryCreateComponent.test.js',
            'testsoutput/libraryCreate/lwc/libraryCreateComponent/libraryCreateComponent.js-meta.xml',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create LightningComponent (lwc) with TypeScript', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'lwc'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(
        TemplateType.LightningComponent,
        {
          componentname: 'LibraryCreateComponent',
          outputdir: path.join('testsoutput', 'libraryCreate', 'lwc'),
          template: 'typeScript',
          type: 'lwc',
        }
      );

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/lwc/libraryCreateComponent/libraryCreateComponent.ts',
            'testsoutput/libraryCreate/lwc/libraryCreateComponent/libraryCreateComponent.html',
            'testsoutput/libraryCreate/lwc/libraryCreateComponent/__tests__/libraryCreateComponent.test.ts',
            'testsoutput/libraryCreate/lwc/libraryCreateComponent/libraryCreateComponent.js-meta.xml',
            'testsoutput/libraryCreate/lwc/libraryCreateComponent/.gitignore',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create LightningEvent', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'aura'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.LightningEvent, {
        eventname: 'LibraryCreateEvent',
        outputdir: path.join('testsoutput', 'libraryCreate', 'aura'),
        template: 'DefaultLightningEvt',
      });

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/aura/LibraryCreateEvent/LibraryCreateEvent.evt-meta.xml',
            'testsoutput/libraryCreate/aura/LibraryCreateEvent/LibraryCreateEvent.evt',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create LightningInterface', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'aura'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(
        TemplateType.LightningInterface,
        {
          interfacename: 'LibraryCreateInterface',
          outputdir: path.join('testsoutput', 'libraryCreate', 'aura'),
          template: 'DefaultLightningIntf',
        }
      );

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/aura/LibraryCreateInterface/LibraryCreateInterface.intf-meta.xml',
            'testsoutput/libraryCreate/aura/LibraryCreateInterface/LibraryCreateInterface.intf',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create LightningTest', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'aura'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.LightningTest, {
        testname: 'LibraryCreateTest',
        outputdir: path.join('testsoutput', 'libraryCreate', 'aura'),
        template: 'DefaultLightningTest',
      });

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/aura/LibraryCreateTest.resource-meta.xml',
            'testsoutput/libraryCreate/aura/LibraryCreateTest.resource',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create Project (standard)', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'project'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.Project, {
        outputdir: path.join('testsoutput', 'libraryCreate', 'project'),
        projectname: 'LibraryCreateProject',
        template: 'standard',
        defaultpackagedir: 'force-app',
      });

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/project/LibraryCreateProject/.forceignore',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.gitignore',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.husky/pre-commit',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.prettierignore',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.prettierrc',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.vscode/extensions.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.vscode/launch.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.vscode/settings.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/README.md',
            'testsoutput/libraryCreate/project/LibraryCreateProject/config/project-scratch-def.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/force-app/main/default/aura/.eslintrc.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/force-app/main/default/lwc/.eslintrc.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/jest.config.js',
            'testsoutput/libraryCreate/project/LibraryCreateProject/package.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/scripts/apex/hello.apex',
            'testsoutput/libraryCreate/project/LibraryCreateProject/scripts/soql/account.soql',
            'testsoutput/libraryCreate/project/LibraryCreateProject/sfdx-project.json',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create Project (empty)', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'project'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.Project, {
        outputdir: path.join('testsoutput', 'libraryCreate', 'project'),
        projectname: 'LibraryCreateProject',
        template: 'empty',
        defaultpackagedir: 'force-app',
      });

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/project/LibraryCreateProject/config/project-scratch-def.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/README.md',
            'testsoutput/libraryCreate/project/LibraryCreateProject/sfdx-project.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.forceignore',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create Project (analytics)', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'project'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.Project, {
        outputdir: path.join('testsoutput', 'libraryCreate', 'project'),
        projectname: 'LibraryCreateProject',
        template: 'analytics',
        defaultpackagedir: 'force-app',
      });

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/project/LibraryCreateProject/config/project-scratch-def.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/README.md',
            'testsoutput/libraryCreate/project/LibraryCreateProject/sfdx-project.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.husky/pre-commit',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.vscode/extensions.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.vscode/launch.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.vscode/settings.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/force-app/main/default/lwc/.eslintrc.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/force-app/main/default/aura/.eslintrc.json',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.forceignore',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.gitignore',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.prettierignore',
            'testsoutput/libraryCreate/project/LibraryCreateProject/.prettierrc',
            'testsoutput/libraryCreate/project/LibraryCreateProject/jest.config.js',
            'testsoutput/libraryCreate/project/LibraryCreateProject/package.json',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create StaticResource', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'staticResource'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.StaticResource, {
        resourcename: 'LibraryCreateResource',
        outputdir: path.join('testsoutput', 'libraryCreate', 'staticResource'),
        template: 'empty',
        contenttype: 'application/zip',
      });

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/staticResource/LibraryCreateResource/.gitkeep',
            'testsoutput/libraryCreate/staticResource/LibraryCreateResource.resource-meta.xml',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create VisualforceComponent', async () => {
      await remove(
        path.join('testsoutput', 'libraryCreate', 'visualforceComponent')
      );
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(
        TemplateType.VisualforceComponent,
        {
          componentname: 'LibraryCreateComponent',
          label: 'LibraryCreateComponent',
          outputdir: path.join(
            'testsoutput',
            'libraryCreate',
            'visualforceComponent'
          ),
          template: 'DefaultVFComponent',
        }
      );

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/visualforceComponent/LibraryCreateComponent.component',
            'testsoutput/libraryCreate/visualforceComponent/LibraryCreateComponent.component-meta.xml',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });

    it('should create VisualforcePage', async () => {
      await remove(
        path.join('testsoutput', 'libraryCreate', 'visualforcePage')
      );
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(
        TemplateType.VisualforcePage,
        {
          pagename: 'LibraryCreatePage',
          label: 'LibraryCreatePage',
          outputdir: path.join(
            'testsoutput',
            'libraryCreate',
            'visualforcePage'
          ),
          template: 'DefaultVFPage',
        }
      );

      chai
        .expect(result.created.sort())
        .to.deep.equal(
          [
            'testsoutput/libraryCreate/visualforcePage/LibraryCreatePage.page',
            'testsoutput/libraryCreate/visualforcePage/LibraryCreatePage.page-meta.xml',
          ]
            .map((p) => path.normalize(p))
            .sort()
        );
    });
  });
});
