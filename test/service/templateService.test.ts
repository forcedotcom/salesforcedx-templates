/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import got from 'got';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getProxyForUrl } from 'proxy-from-env';
import { TemplateService, TemplateType } from '../../src/index';
import { nls } from '../../src/i18n/index';
import { getStoragePathForCustomTemplates } from '../../src/service/gitRepoUtils';
import {
  BaseGenerator,
  setCustomTemplatesRootPathOrGitRepo,
  getDefaultApiVersion,
} from '../../src/generators/baseGenerator';
import { importGenerator } from '../../src/service/templateService';

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return { ...actual, existsSync: vi.fn(actual.existsSync) };
});

const remove = async (file: string) => {
  await fs.promises.rm(file, { force: true, recursive: true });
};

const assertFileContent = (file: string, regex: string | RegExp) => {
  expect(fs.existsSync(file)).toBe(true);

  // normalize line endings.  Respects users gitattributes settings
  const body = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

  const match =
    typeof regex === 'string' ? body.includes(regex) : regex.test(body);

  expect(match, `${file} did not match '${regex}'. Contained:\n\n${body}`).toBe(
    true,
  );
};

describe('TemplateService', () => {
  const apiVersion = getDefaultApiVersion();
  describe('Setting cwd', () => {
    it('should set default cwd of yeoman env to process cwd on getting instance', () => {
      const templateService = TemplateService.getInstance();
      expect(templateService.cwd).toBe(process.cwd());
    });

    it('should set cwd of yeoman env on getting instance', () => {
      const mockWorkspacePath = path.join('root', 'project');
      const templateService = TemplateService.getInstance(mockWorkspacePath);
      expect(templateService.cwd).toBe(mockWorkspacePath);
    });

    it('should set cwd of yeoman env', () => {
      const mockWorkspacePath = path.join('root', 'project1');
      const mockNewWorkspacePath = path.join('root', 'project2');
      const templateService = TemplateService.getInstance(mockWorkspacePath);
      templateService.cwd = mockNewWorkspacePath;
      expect(templateService.cwd).toBe(mockNewWorkspacePath);
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
        'LibraryCreateClass.cls',
      );
      const expectedApexClassContent =
        'public with sharing class LibraryCreateClass';
      const expectedApexClassMetaPath = path.join(
        'testsoutput',
        'libraryCreate',
        'apexClass',
        'LibraryCreateClass.cls-meta.xml',
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
        expectedApexClassMetaContent,
      );
    });
  });

  describe('create custom template', () => {
    const TEST_CUSTOM_TEMPLATES_REPO =
      'https://github.com/forcedotcom/salesforcedx-templates/tree/main/test/custom-templates';
    const TEST_CUSTOM_TEMPLATES_STORAGE_PATH = getStoragePathForCustomTemplates(
      new URL(TEST_CUSTOM_TEMPLATES_REPO),
    );

    beforeEach(async () => {
      await remove(
        path.join('testsoutput', 'customLibraryCreate', 'apexclass'),
      );
    });
    afterEach(async () => {
      vi.restoreAllMocks();
      const actualFs = await vi.importActual<typeof import('fs')>('fs');
      vi.mocked(fs.existsSync).mockImplementation(actualFs.existsSync);
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
            'apexClass',
          ),
        },
        customTemplates,
      );
      const expectedApexClassPath = path.join(
        'testsoutput',
        'customLibraryCreate',
        'apexClass',
        'LibraryCreateClass.cls',
      );
      const expectedApexClassContent =
        'public with sharing class CustomLibraryCreateClass';
      const expectedApexClassMetaPath = path.join(
        'testsoutput',
        'customLibraryCreate',
        'apexClass',
        'LibraryCreateClass.cls-meta.xml',
      );
      const expectedApexClassMetaContent = `<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${apiVersion}</apiVersion>
    <status>Inactive</status>
</ApexClass>`;

      assertFileContent(expectedApexClassPath, expectedApexClassContent);
      assertFileContent(
        expectedApexClassMetaPath,
        expectedApexClassMetaContent,
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
            'apexClass',
          ),
        },
        customTemplates,
      );
      const expectedApexClassPath = path.join(
        'testsoutput',
        'customLibraryCreate',
        'apexClass',
        'LibraryCreateClass.cls',
      );
      const expectedApexClassContent =
        'public with sharing class CustomLibraryCreateClass';
      const expectedApexClassMetaPath = path.join(
        'testsoutput',
        'customLibraryCreate',
        'apexClass',
        'LibraryCreateClass.cls-meta.xml',
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
        expectedApexClassMetaContent,
      );
    });

    it('should throw error if local custom templates do not exist', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const localPath = 'this-folder-does-not-exist';
      const customTemplates = localPath;
      await expect(
        templateService.create(
          TemplateType.ApexClass,
          {
            template: 'DefaultApexClass',
            classname: 'LibraryCreateClass',
            outputdir: path.join(
              'testsoutput',
              'customLibraryCreate',
              'apexClass',
            ),
          },
          customTemplates,
        ),
      ).rejects.toThrow(
        nls.localize('localCustomTemplateDoNotExist', localPath),
      );
    });

    it('should throw error if cannot retrieve default branch', async () => {
      const mockIt = {
        getProxyForUrl,
      };
      vi.spyOn(mockIt, 'getProxyForUrl').mockReturnValue(undefined);
      const templateService = TemplateService.getInstance(process.cwd());
      const customTemplates =
        'https://github.com/forcedotcom/this-repo-does-not-exist';
      await expect(
        templateService.create(
          TemplateType.ApexClass,
          {
            template: 'DefaultApexClass',
            classname: 'LibraryCreateClass',
            outputdir: path.join(
              'testsoutput',
              'customLibraryCreate',
              'apexClass',
            ),
          },
          customTemplates,
        ),
      ).rejects.toThrow(
        nls.localize(
          'customTemplatesCannotRetrieveDefaultBranch',
          customTemplates,
        ),
      );
    });

    it('should throw error if repo url is invalid', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const customTemplates =
        'https://github.com/forcedotcom/salesforcedx-templates/invalid-url';
      await expect(
        templateService.create(
          TemplateType.ApexClass,
          {
            template: 'DefaultApexClass',
            classname: 'LibraryCreateClass',
            outputdir: path.join(
              'testsoutput',
              'customLibraryCreate',
              'apexClass',
            ),
          },
          customTemplates,
        ),
      ).rejects.toThrow(
        nls.localize('customTemplatesInvalidRepoUrl', customTemplates),
      );
    });

    it('should throw error if repo protocol is not https', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO.replace(
        'https',
        'http',
      );
      await expect(
        templateService.create(
          TemplateType.ApexClass,
          {
            template: 'DefaultApexClass',
            classname: 'LibraryCreateClass',
            outputdir: path.join(
              'testsoutput',
              'customLibraryCreate',
              'apexClass',
            ),
          },
          customTemplates,
        ),
      ).rejects.toThrow(
        nls.localize('customTemplatesShouldUseHttpsProtocol', '"http:"'),
      );
    });

    it('should throw error if not a GitHub repo', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO.replace(
        'github.com',
        'gitlab.com',
      );
      await expect(
        templateService.create(
          TemplateType.ApexClass,
          {
            template: 'DefaultApexClass',
            classname: 'LibraryCreateClass',
            outputdir: path.join(
              'testsoutput',
              'customLibraryCreate',
              'apexClass',
            ),
          },
          customTemplates,
        ),
      ).rejects.toThrow(
        nls.localize('customTemplatesSupportsGitHubOnly', customTemplates),
      );
    });

    it('should download the repo if the folder does not exist', async () => {
      await remove(TEST_CUSTOM_TEMPLATES_STORAGE_PATH);
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO;

      const result = await setCustomTemplatesRootPathOrGitRepo(customTemplates);

      assert(typeof result === 'string');
      expect(fs.existsSync(result)).toBe(true);
    });

    it('should not download the repo if the folder already exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      const gotSpy = vi.fn(got);

      await remove(TEST_CUSTOM_TEMPLATES_STORAGE_PATH);
      fs.mkdirSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH, { recursive: true });
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO;

      await setCustomTemplatesRootPathOrGitRepo(customTemplates);

      expect(gotSpy).not.toHaveBeenCalled();
    });

    it('should download the repo if the folder already exists, but forcing a redownload', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      await remove(TEST_CUSTOM_TEMPLATES_STORAGE_PATH);
      fs.mkdirSync(TEST_CUSTOM_TEMPLATES_STORAGE_PATH, { recursive: true });
      const customTemplates = TEST_CUSTOM_TEMPLATES_REPO;

      const forceLoadingRemoteRepo = true;
      const result = await setCustomTemplatesRootPathOrGitRepo(
        customTemplates,
        forceLoadingRemoteRepo,
      );

      assert(typeof result === 'string');
      expect(fs.existsSync(result)).toBe(true);
    });
  });

  describe('create template', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('create template should return created output', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'apexClass'));
      const templateService = TemplateService.getInstance(process.cwd());
      const result = await templateService.create(TemplateType.ApexClass, {
        template: 'DefaultApexClass',
        classname: 'LibraryCreateClass',
        outputdir: path.join('testsoutput', 'libraryCreate', 'apexClass'),
      });

      expect(result.outputDir, 'outputDir property did not match').toBe(
        path.resolve(process.cwd(), 'testsoutput/libraryCreate/apexClass'),
      );

      expect(result.created, 'Created property did not match').toEqual([
        path.normalize(
          'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls',
        ),
        path.normalize(
          'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls-meta.xml',
        ),
      ]);

      const actual = `target dir = ${path.resolve(
        process.cwd(),
        'testsoutput/libraryCreate/apexClass',
      )}\n  create ${path.normalize(
        'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls',
      )}\n  create ${path.normalize(
        'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls-meta.xml',
      )}\n`;

      expect(result.rawOutput, 'Actual property did not match').toBe(actual);
    });

    it('should reject if create template fails', async () => {
      vi.spyOn(BaseGenerator.prototype, 'run').mockRejectedValue(
        new Error('error'),
      );
      const templateService = TemplateService.getInstance(process.cwd());
      await expect(
        templateService.create(TemplateType.ApexClass, {
          template: 'DefaultApexClass',
          classname: 'LibraryCreateClass',
          outputdir: path.join('testsoutput', 'libraryCreate', 'apexClass'),
        }),
      ).rejects.toThrow('error');
    });
  });

  describe('Generators', () => {
    it('should have a generator for each TemplateType', () => {
      const templateTypes = Object.values(TemplateType).filter(
        (value) => typeof value === 'number',
      );

      for (const templateType of templateTypes) {
        try {
          const generator = importGenerator(templateType);
          expect(generator).toBeDefined();
        } catch {
          throw new Error(
            `No generator found for template type: ${
              TemplateType[templateType]
            }`,
          );
        }
      }
    });

    it('should return an error if the generator does not exist', () => {
      expect(() => importGenerator(20 as TemplateType)).toThrow(
        nls.localize('templateTypeNotFound'),
      );
    });

    it('should create AnalyticsTemplate', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'waveTemplates'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(
        TemplateType.AnalyticsTemplate,
        {
          templatename: 'analytics',
          outputdir: path.join('testsoutput', 'libraryCreate', 'waveTemplates'),
        },
      );

      expect(result.created.sort()).toEqual(
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
          .sort(),
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

      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls',
          'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls-meta.xml',
        ]
          .map((p) => path.normalize(p))
          .sort(),
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

      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/apexTrigger/LibraryCreateTrigger.trigger',
          'testsoutput/libraryCreate/apexTrigger/LibraryCreateTrigger.trigger-meta.xml',
        ]
          .map((p) => path.normalize(p))
          .sort(),
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

      expect(result.created.sort()).toEqual(
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
          .sort(),
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
        },
      );

      expect(result.created.sort()).toEqual(
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
          .sort(),
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
        },
      );

      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/lwc/libraryCreateComponent/libraryCreateComponent.js',
          'testsoutput/libraryCreate/lwc/libraryCreateComponent/libraryCreateComponent.html',
          'testsoutput/libraryCreate/lwc/libraryCreateComponent/__tests__/libraryCreateComponent.test.js',
          'testsoutput/libraryCreate/lwc/libraryCreateComponent/libraryCreateComponent.js-meta.xml',
        ]
          .map((p) => path.normalize(p))
          .sort(),
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
        },
      );

      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/lwc/libraryCreateComponent/libraryCreateComponent.ts',
          'testsoutput/libraryCreate/lwc/libraryCreateComponent/libraryCreateComponent.html',
          'testsoutput/libraryCreate/lwc/libraryCreateComponent/__tests__/libraryCreateComponent.test.ts',
          'testsoutput/libraryCreate/lwc/libraryCreateComponent/libraryCreateComponent.js-meta.xml',
          'testsoutput/libraryCreate/lwc/libraryCreateComponent/.gitignore',
        ]
          .map((p) => path.normalize(p))
          .sort(),
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

      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/aura/LibraryCreateEvent/LibraryCreateEvent.evt-meta.xml',
          'testsoutput/libraryCreate/aura/LibraryCreateEvent/LibraryCreateEvent.evt',
        ]
          .map((p) => path.normalize(p))
          .sort(),
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
        },
      );

      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/aura/LibraryCreateInterface/LibraryCreateInterface.intf-meta.xml',
          'testsoutput/libraryCreate/aura/LibraryCreateInterface/LibraryCreateInterface.intf',
        ]
          .map((p) => path.normalize(p))
          .sort(),
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

      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/aura/LibraryCreateTest.resource-meta.xml',
          'testsoutput/libraryCreate/aura/LibraryCreateTest.resource',
        ]
          .map((p) => path.normalize(p))
          .sort(),
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

      expect(result.created.sort()).toEqual(
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
          'testsoutput/libraryCreate/project/LibraryCreateProject/eslint.config.js',
          'testsoutput/libraryCreate/project/LibraryCreateProject/jest.config.js',
          'testsoutput/libraryCreate/project/LibraryCreateProject/package.json',
          'testsoutput/libraryCreate/project/LibraryCreateProject/scripts/apex/hello.apex',
          'testsoutput/libraryCreate/project/LibraryCreateProject/scripts/soql/account.soql',
          'testsoutput/libraryCreate/project/LibraryCreateProject/sfdx-project.json',
        ]
          .map((p) => path.normalize(p))
          .sort(),
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

      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/project/LibraryCreateProject/config/project-scratch-def.json',
          'testsoutput/libraryCreate/project/LibraryCreateProject/README.md',
          'testsoutput/libraryCreate/project/LibraryCreateProject/sfdx-project.json',
          'testsoutput/libraryCreate/project/LibraryCreateProject/.forceignore',
        ]
          .map((p) => path.normalize(p))
          .sort(),
      );
    });

    it('should create Project (nativemobile)', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'project'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.Project, {
        outputdir: path.join('testsoutput', 'libraryCreate', 'project'),
        projectname: 'LibraryCreateNativeMobile',
        template: 'nativemobile',
        defaultpackagedir: 'force-app',
      });

      const ecBase =
        'testsoutput/libraryCreate/project/LibraryCreateNativeMobile/force-app/main/default/digitalExperiences/experiencecontainer/libraryCreateNativeMobile';
      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/project/LibraryCreateNativeMobile/config/project-scratch-def.json',
          'testsoutput/libraryCreate/project/LibraryCreateNativeMobile/README.md',
          'testsoutput/libraryCreate/project/LibraryCreateNativeMobile/sfdx-project.json',
          'testsoutput/libraryCreate/project/LibraryCreateNativeMobile/.forceignore',
          `${ecBase}/libraryCreateNativeMobile.digitalExperience-meta.xml`,
          `${ecBase}/experience__camaECDefinition/libraryCreateNativeMobile/_meta.json`,
          `${ecBase}/experience__camaECDefinition/libraryCreateNativeMobile/content.json`,
          `${ecBase}/experience__camaAppMetadata/appMetadata/_meta.json`,
          `${ecBase}/experience__camaAppMetadata/appMetadata/content.json`,
          `${ecBase}/experience__camaBuildMetadata/buildMetadata/_meta.json`,
          `${ecBase}/experience__camaBuildMetadata/buildMetadata/content.json`,
          `${ecBase}/experience__camaScreen/homeScreen/_meta.json`,
          `${ecBase}/experience__camaScreen/homeScreen/content.json`,
        ]
          .map((p) => path.normalize(p))
          .sort(),
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

      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/project/LibraryCreateProject/config/project-scratch-def.json',
          'testsoutput/libraryCreate/project/LibraryCreateProject/README.md',
          'testsoutput/libraryCreate/project/LibraryCreateProject/sfdx-project.json',
          'testsoutput/libraryCreate/project/LibraryCreateProject/.husky/pre-commit',
          'testsoutput/libraryCreate/project/LibraryCreateProject/.vscode/extensions.json',
          'testsoutput/libraryCreate/project/LibraryCreateProject/.vscode/launch.json',
          'testsoutput/libraryCreate/project/LibraryCreateProject/.vscode/settings.json',
          'testsoutput/libraryCreate/project/LibraryCreateProject/eslint.config.js',
          'testsoutput/libraryCreate/project/LibraryCreateProject/.forceignore',
          'testsoutput/libraryCreate/project/LibraryCreateProject/.gitignore',
          'testsoutput/libraryCreate/project/LibraryCreateProject/.prettierignore',
          'testsoutput/libraryCreate/project/LibraryCreateProject/.prettierrc',
          'testsoutput/libraryCreate/project/LibraryCreateProject/jest.config.js',
          'testsoutput/libraryCreate/project/LibraryCreateProject/package.json',
        ]
          .map((p) => path.normalize(p))
          .sort(),
      );
    });

    it('should create Project (standard) with TypeScript', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'tsproject'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.Project, {
        outputdir: path.join('testsoutput', 'libraryCreate', 'tsproject'),
        projectname: 'TypeScriptProject',
        template: 'standard',
        defaultpackagedir: 'force-app',
        lwcLanguage: 'typescript',
      });

      expect(result.created.sort()).toEqual(
        expect.arrayContaining(
          [
            'testsoutput/libraryCreate/tsproject/TypeScriptProject/tsconfig.json',
            'testsoutput/libraryCreate/tsproject/TypeScriptProject/.forceignore',
            'testsoutput/libraryCreate/tsproject/TypeScriptProject/.gitignore',
            'testsoutput/libraryCreate/tsproject/TypeScriptProject/package.json',
            'testsoutput/libraryCreate/tsproject/TypeScriptProject/sfdx-project.json',
            'testsoutput/libraryCreate/tsproject/TypeScriptProject/eslint.config.js',
            'testsoutput/libraryCreate/tsproject/TypeScriptProject/.vscode/settings.json',
          ].map((p) => path.normalize(p)),
        ),
      );

      // Verify tsconfig.json was created
      const tsconfigPath = path.join(
        'testsoutput',
        'libraryCreate',
        'tsproject',
        'TypeScriptProject',
        'tsconfig.json',
      );
      expect(fs.existsSync(tsconfigPath)).toBe(true);

      // Verify sfdx-project.json has defaultLwcLanguage
      const projectJsonPath = path.join(
        'testsoutput',
        'libraryCreate',
        'tsproject',
        'TypeScriptProject',
        'sfdx-project.json',
      );
      const projectJsonContent = JSON.parse(
        fs.readFileSync(projectJsonPath, 'utf-8'),
      );
      expect(projectJsonContent.defaultLwcLanguage).toBe('typescript');
    });

    it('should create Project (analytics) with TypeScript', async () => {
      await remove(
        path.join('testsoutput', 'libraryCreate', 'tsanalyticsproject'),
      );
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.Project, {
        outputdir: path.join(
          'testsoutput',
          'libraryCreate',
          'tsanalyticsproject',
        ),
        projectname: 'TSAnalyticsProject',
        template: 'analytics',
        defaultpackagedir: 'force-app',
        lwcLanguage: 'typescript',
      });

      expect(result.created.sort()).toEqual(
        expect.arrayContaining(
          [
            'testsoutput/libraryCreate/tsanalyticsproject/TSAnalyticsProject/tsconfig.json',
            'testsoutput/libraryCreate/tsanalyticsproject/TSAnalyticsProject/.forceignore',
            'testsoutput/libraryCreate/tsanalyticsproject/TSAnalyticsProject/eslint.config.js',
            'testsoutput/libraryCreate/tsanalyticsproject/TSAnalyticsProject/.vscode/settings.json',
            'testsoutput/libraryCreate/tsanalyticsproject/TSAnalyticsProject/sfdx-project.json',
          ].map((p) => path.normalize(p)),
        ),
      );

      // Verify TypeScript-specific files
      const tsconfigPath = path.join(
        'testsoutput',
        'libraryCreate',
        'tsanalyticsproject',
        'TSAnalyticsProject',
        'tsconfig.json',
      );
      expect(fs.existsSync(tsconfigPath)).toBe(true);
    });
    it('should create Project (agent)', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'project'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.Project, {
        outputdir: path.join('testsoutput', 'libraryCreate', 'project'),
        projectname: 'LibraryCreateProject',
        template: 'agent',
        defaultpackagedir: 'force-app',
      });

      const p = 'testsoutput/libraryCreate/project/LibraryCreateProject';
      const md = `${p}/force-app/main/default`;

      expect(result.created.sort()).toEqual(
        [
          `${p}/config/project-scratch-def.json`,
          `${p}/README.md`,
          `${p}/sfdx-project.json`,
          `${p}/.vscode/extensions.json`,
          `${p}/.vscode/launch.json`,
          `${p}/.vscode/settings.json`,
          `${p}/.forceignore`,
          `${p}/.gitignore`,
          `${p}/.prettierignore`,
          `${p}/.prettierrc`,
          `${p}/package.json`,
          `${md}/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.bundle-meta.xml`,
          `${md}/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.agent`,
          `${md}/classes/CheckWeather.cls`,
          `${md}/classes/CheckWeather.cls-meta.xml`,
          `${md}/classes/CurrentDate.cls`,
          `${md}/classes/CurrentDate.cls-meta.xml`,
          `${md}/classes/CurrentDateTest.cls`,
          `${md}/classes/CurrentDateTest.cls-meta.xml`,
          `${md}/classes/WeatherService.cls`,
          `${md}/classes/WeatherService.cls-meta.xml`,
          `${md}/classes/WeatherServiceTest.cls`,
          `${md}/classes/WeatherServiceTest.cls-meta.xml`,
          `${md}/flows/Get_Resort_Hours.flow-meta.xml`,
          `${md}/genAiPromptTemplates/Get_Event_Info.genAiPromptTemplate-meta.xml`,
          `${md}/permissionsets/Resort_Agent.permissionset-meta.xml`,
          `${md}/permissionsets/Resort_Admin.permissionset-meta.xml`,
          `${md}/permissionsetgroups/AFDX_Agent_Perms.permissionsetgroup-meta.xml`,
          `${md}/permissionsetgroups/AFDX_User_Perms.permissionsetgroup-meta.xml`,
        ]
          .map((f) => path.normalize(f))
          .sort(),
      );

      assertFileContent(
        path.join(result.outputDir, 'LibraryCreateProject', 'README.md'),
        '# Agentforce Project',
      );
      assertFileContent(
        path.join(
          result.outputDir,
          'LibraryCreateProject',
          'config',
          'project-scratch-def.json',
        ),
        'einsteinGptSettings',
      );
    });

    it('should create Project (reactinternalapp) from built-in template', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'project'));
      // Use relative path so Windows absolute paths (e.g. D:\...) are not passed to URL parser
      const fixtureRoot = path.join('test', 'fixtures', 'project-templates');
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(
        TemplateType.Project,
        {
          outputdir: path.join('testsoutput', 'libraryCreate', 'project'),
          projectname: 'MyReactInternalApp',
          template: 'reactinternalapp',
          defaultpackagedir: 'force-app',
        },
        fixtureRoot,
      );

      expect(result.created).toContain(
        path.normalize(
          'testsoutput/libraryCreate/project/MyReactInternalApp/config/project-scratch-def.json',
        ),
      );
      expect(result.created).toContain(
        path.normalize(
          'testsoutput/libraryCreate/project/MyReactInternalApp/sfdx-project.json',
        ),
      );
      expect(result.created).toContain(
        path.normalize(
          'testsoutput/libraryCreate/project/MyReactInternalApp/sample.txt',
        ),
      );
      const samplePath = path.join(
        result.outputDir,
        'MyReactInternalApp',
        'sample.txt',
      );
      expect(fs.existsSync(samplePath)).toBe(true);
      const sampleContent = fs.readFileSync(samplePath, 'utf8');
      expect(sampleContent).toContain('MyReactInternalApp');
    });

    it('should create Project (reactexternalapp) from built-in template', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'project'));
      // Use relative path so Windows absolute paths (e.g. D:\...) are not passed to URL parser
      const fixtureRoot = path.join('test', 'fixtures', 'project-templates');
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(
        TemplateType.Project,
        {
          outputdir: path.join('testsoutput', 'libraryCreate', 'project'),
          projectname: 'MyReactExternalApp',
          template: 'reactexternalapp',
          defaultpackagedir: 'force-app',
        },
        fixtureRoot,
      );

      expect(result.created).toContain(
        path.normalize(
          'testsoutput/libraryCreate/project/MyReactExternalApp/config/project-scratch-def.json',
        ),
      );
      expect(result.created).toContain(
        path.normalize(
          'testsoutput/libraryCreate/project/MyReactExternalApp/sample.txt',
        ),
      );
      const samplePath = path.join(
        result.outputDir,
        'MyReactExternalApp',
        'sample.txt',
      );
      expect(fs.existsSync(samplePath)).toBe(true);
      const sampleContent = fs.readFileSync(samplePath, 'utf8');
      expect(sampleContent).toContain('MyReactExternalApp');
    });

    it('should use alphanumeric name for uiBundles under reactinternalapp template', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'project'));
      // Use relative path so Windows absolute paths (e.g. D:\...) are not passed to URL parser
      const fixtureRoot = path.join('test', 'fixtures', 'project-templates');
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(
        TemplateType.Project,
        {
          outputdir: path.join('testsoutput', 'libraryCreate', 'project'),
          projectname: 'My_React_Internal_App',
          template: 'reactinternalapp',
          defaultpackagedir: 'force-app',
        },
        fixtureRoot,
      );

      expect(result.created.length).toBeGreaterThan(0);
      const projectDir = path.join(result.outputDir, 'My_React_Internal_App');
      expect(fs.existsSync(projectDir)).toBe(true);
      const appnamePath = path.join(projectDir, 'appname.txt');
      expect(fs.existsSync(appnamePath)).toBe(true);
      const appnameContent = fs.readFileSync(appnamePath, 'utf8');
      expect(appnameContent.trim()).toBe('MyReactInternalApp');
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

      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/staticResource/LibraryCreateResource/.gitkeep',
          'testsoutput/libraryCreate/staticResource/LibraryCreateResource.resource-meta.xml',
        ]
          .map((p) => path.normalize(p))
          .sort(),
      );
    });

    it('should create VisualforceComponent', async () => {
      await remove(
        path.join('testsoutput', 'libraryCreate', 'visualforceComponent'),
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
            'visualforceComponent',
          ),
          template: 'DefaultVFComponent',
        },
      );

      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/visualforceComponent/LibraryCreateComponent.component',
          'testsoutput/libraryCreate/visualforceComponent/LibraryCreateComponent.component-meta.xml',
        ]
          .map((p) => path.normalize(p))
          .sort(),
      );
    });

    it('should create VisualforcePage', async () => {
      await remove(
        path.join('testsoutput', 'libraryCreate', 'visualforcePage'),
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
            'visualforcePage',
          ),
          template: 'DefaultVFPage',
        },
      );

      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/visualforcePage/LibraryCreatePage.page',
          'testsoutput/libraryCreate/visualforcePage/LibraryCreatePage.page-meta.xml',
        ]
          .map((p) => path.normalize(p))
          .sort(),
      );
    });

    it('should create UIBundle', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'uiBundles'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.UIBundle, {
        bundlename: 'LibraryCreateUIBundle',
        outputdir: path.join('testsoutput', 'libraryCreate', 'uiBundles'),
        template: 'default',
        internal: true,
      });

      expect(result.created.sort()).toEqual(
        [
          'testsoutput/libraryCreate/uiBundles/LibraryCreateUIBundle/LibraryCreateUIBundle.uibundle-meta.xml',
          'testsoutput/libraryCreate/uiBundles/LibraryCreateUIBundle/README.md',
          'testsoutput/libraryCreate/uiBundles/LibraryCreateUIBundle/src/index.html',
          'testsoutput/libraryCreate/uiBundles/LibraryCreateUIBundle/ui-bundle.json',
        ]
          .map((p) => path.normalize(p))
          .sort(),
      );
    });

    it('should create UIBundle (reactbasic)', async () => {
      await remove(path.join('testsoutput', 'libraryCreate', 'uiBundles'));
      const templateService = TemplateService.getInstance();
      const result = await templateService.create(TemplateType.UIBundle, {
        bundlename: 'LibraryCreateReactApp',
        outputdir: path.join('testsoutput', 'libraryCreate', 'uiBundles'),
        template: 'reactbasic',
        internal: true,
      });

      const created = result.created.map((p) => path.normalize(p));
      const uiBundleJson = path.normalize(
        'testsoutput/libraryCreate/uiBundles/LibraryCreateReactApp/ui-bundle.json',
      );
      const uiBundleMetaXml = path.normalize(
        'testsoutput/libraryCreate/uiBundles/LibraryCreateReactApp/LibraryCreateReactApp.uibundle-meta.xml',
      );
      expect(created).toContain(uiBundleJson);
      expect(created).toContain(uiBundleMetaXml);
    });
  });
});
