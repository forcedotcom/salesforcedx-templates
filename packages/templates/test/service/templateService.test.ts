/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fsOriginal from 'fs';
import * as fs from 'fs-extra';
import got from 'got';
import * as path from 'path';
import { assert as sinonAssert, spy, stub } from 'sinon';
import * as assert from 'yeoman-assert';
import * as yeoman from 'yeoman-environment';
import { TemplateService, TemplateType } from '../../src';
import { nls } from '../../src/i18n';
import { getStoragePathForCustomTemplates } from '../../src/service/gitRepoUtils';

chai.use(chaiAsPromised);
chai.should();

describe('TemplateService', () => {
  const apiVersion = TemplateService.getDefaultApiVersion();
  describe('Setting cwd', () => {
    it('should set default cwd of yeoman env to process cwd on getting instance', () => {
      const templateService = TemplateService.getInstance();
      expect(templateService.cwd).to.equal(process.cwd());
    });

    it('should set cwd of yeoman env on getting instance', () => {
      const mockWorkspacePath = path.join('root', 'project');
      const templateService = TemplateService.getInstance(mockWorkspacePath);
      expect(templateService.cwd).to.equal(mockWorkspacePath);
    });

    it('should set cwd of yeoman env', () => {
      const mockWorkspacePath = path.join('root', 'project1');
      const mockNewWorkspacePath = path.join('root', 'project2');
      const templateService = TemplateService.getInstance(mockWorkspacePath);
      templateService.cwd = mockNewWorkspacePath;
      expect(templateService.cwd).to.equal(mockNewWorkspacePath);
    });

    it('should create template', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.ApexClass, {
        template: 'DefaultApexClass',
        classname: 'LibraryCreateClass',
        outputdir: path.join('testsoutput', 'libraryCreate', 'apexClass')
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
      const expectedApexClassMetaContent = `<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${apiVersion}</apiVersion>
    <status>Active</status>
</ApexClass>
`;
      assert.file([expectedApexClassPath, expectedApexClassMetaPath]);
      assert.fileContent(expectedApexClassPath, expectedApexClassContent);
      assert.fileContent(
        expectedApexClassMetaPath,
        expectedApexClassMetaContent
      );
    });
  });

  describe('create custom template', () => {
    const TEST_CUSTOM_TEMPLATES_REPO =
      'https://github.com/forcedotcom/salesforcedx-templates/tree/main/packages/templates/test/custom-templates';
    const TEST_CUSTOM_TEMPLATES_STORAGE_PATH = getStoragePathForCustomTemplates(
      new URL(TEST_CUSTOM_TEMPLATES_REPO)
    );

    beforeEach(async () => {
      await fs.remove(
        path.join('testsoutput', 'customLibraryCreate', 'apexclass')
      );
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
          )
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
      assert.file([expectedApexClassPath, expectedApexClassMetaPath]);
      assert.fileContent(expectedApexClassPath, expectedApexClassContent);
      assert.fileContent(
        expectedApexClassMetaPath,
        expectedApexClassMetaContent
      );
    });

    it('should create custom template from GitHub repository', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO;
      if (fs.existsSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH)) {
        fs.removeSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH);
      }
      await templateService.create(
        TemplateType.ApexClass,
        {
          template: 'DefaultApexClass',
          classname: 'LibraryCreateClass',
          outputdir: path.join(
            'testsoutput',
            'customLibraryCreate',
            'apexClass'
          )
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
      assert.file([expectedApexClassPath, expectedApexClassMetaPath]);
      assert.fileContent(expectedApexClassPath, expectedApexClassContent);
      assert.fileContent(
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
            )
          },
          customTemplates
        )
        .should.be.rejectedWith(
          Error,
          nls.localize('localCustomTemplateDoNotExist', localPath)
        );
    });

    it('should throw error if cannot retrieve default branch', async () => {
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
            )
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
            )
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
            )
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
            )
          },
          customTemplates
        )
        .should.be.rejectedWith(
          Error,
          nls.localize('customTemplatesSupportsGitHubOnly', customTemplates)
        );
    });

    it('should download the repo if the folder does not exist', async () => {
      const existsSyncStub = stub(fsOriginal, 'existsSync');
      existsSyncStub.callsFake(fsPath => {
        if (fsPath === TEST_CUSTOM_TEMPLATES_REPO) {
          return true;
        }
        return fs.existsSync(fsPath);
      });
      const streamStub = spy(got, 'stream');
      const templateService = TemplateService.getInstance(process.cwd());
      if (fs.existsSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH)) {
        fs.removeSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH);
      }
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO;

      await templateService.setCustomTemplatesRootPathOrGitRepo(
        customTemplates
      );

      sinonAssert.calledOnce(streamStub);
      streamStub.restore();
      existsSyncStub.restore();
    });

    it('should not download the repo if the folder already exists', async () => {
      const existsSyncStub = stub(fsOriginal, 'existsSync');
      existsSyncStub.callsFake(fsPath => {
        if (fsPath === TEST_CUSTOM_TEMPLATES_REPO) {
          return true;
        }
        return fs.existsSync(fsPath);
      });
      const streamStub = spy(got, 'stream');
      const templateService = TemplateService.getInstance(process.cwd());
      if (fs.existsSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH)) {
        fs.removeSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH);
      }
      fs.mkdirSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH, { recursive: true });
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO;

      await templateService.setCustomTemplatesRootPathOrGitRepo(
        customTemplates
      );

      sinonAssert.notCalled(streamStub);
      streamStub.restore();
      existsSyncStub.restore();
    });

    it('should download the repo if the folder already exists, but forcing a redownload', async () => {
      const existsSyncStub = stub(fsOriginal, 'existsSync');
      existsSyncStub.callsFake(fsPath => {
        if (fsPath === TEST_CUSTOM_TEMPLATES_REPO) {
          return true;
        }
        return fs.existsSync(fsPath);
      });
      const streamStub = spy(got, 'stream');
      const templateService = TemplateService.getInstance(process.cwd());
      if (fs.existsSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH)) {
        fs.removeSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH);
      }
      fs.mkdirSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH, { recursive: true });
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO;

      const forceLoadingRemoteRepo = true;
      await templateService.setCustomTemplatesRootPathOrGitRepo(
        customTemplates,
        forceLoadingRemoteRepo
      );

      sinonAssert.calledOnce(streamStub);
      streamStub.restore();
      existsSyncStub.restore();
    });
  }).timeout(20000);

  describe('create template', () => {
    it('create template should return created output', async () => {
      await fs.remove(path.join('testsoutput', 'libraryCreate', 'apexClass'));
      const templateService = TemplateService.getInstance(process.cwd());
      const result = await templateService.create(TemplateType.ApexClass, {
        template: 'DefaultApexClass',
        classname: 'LibraryCreateClass',
        outputdir: path.join('testsoutput', 'libraryCreate', 'apexClass')
      });

      expect(result.outputDir).to.equal(
        path.resolve(process.cwd(), 'testsoutput/libraryCreate/apexClass'),
        'outputDir property did not match'
      );

      expect(result.created).to.eql(
        [
          path.normalize(
            'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls'
          ),
          path.normalize(
            'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls-meta.xml'
          )
        ],
        'Created property did not match'
      );

      const actual = `target dir = ${path.resolve(
        process.cwd(),
        'testsoutput/libraryCreate/apexClass'
      )}\n   create ${path.normalize(
        'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls'
      )}\n   create ${path.normalize(
        'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls-meta.xml'
      )}\n`;

      expect(result.rawOutput).to.equal(
        actual,
        'Actual property did not match'
      );
    });

    it('should reject if create template fails', async () => {
      const runStub = stub(yeoman.prototype, 'run').rejects(new Error('error'));
      const templateService = TemplateService.getInstance(process.cwd());
      try {
        await templateService.create(TemplateType.ApexClass, {
          template: 'DefaultApexClass',
          classname: 'LibraryCreateClass',
          outputdir: path.join('testsoutput', 'libraryCreate', 'apexClass')
        });
      } catch (error) {
        const err = error as Error;
        expect(err.message).to.equal('error');
      }
      runStub.restore();
    });
  });
});
