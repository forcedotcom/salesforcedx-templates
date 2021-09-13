/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fs from 'fs-extra';
import * as path from 'path';
import { stub } from 'sinon';
import * as assert from 'yeoman-assert';
import * as yeoman from 'yeoman-environment';
import { TemplateService, TemplateType } from '../../src';
import { nls } from '../../src/i18n';

chai.use(chaiAsPromised);
chai.should();

describe('TemplateService', () => {
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
    <apiVersion>52.0</apiVersion>
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
    <apiVersion>52.0</apiVersion>
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
      // TODO: update the branch to develop after PR is merged
      const customTemplates =
        'https://github.com/forcedotcom/salesforcedx-templates/tree/tests/packages/templates/test/custom-templates';
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
    <apiVersion>52.0</apiVersion>
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
      expect(result).to.eql({
        outputDir: path.resolve(
          process.cwd(),
          'testsoutput/libraryCreate/apexClass'
        ),
        created: [
          path.normalize(
            'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls'
          ),
          path.normalize(
            'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls-meta.xml'
          )
        ],
        rawOutput: `target dir = ${path.resolve(
          process.cwd(),
          'testsoutput/libraryCreate/apexClass'
        )}\n   create ${path.normalize(
          'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls'
        )}\n   create ${path.normalize(
          'testsoutput/libraryCreate/apexClass/LibraryCreateClass.cls-meta.xml'
        )}\n`
      });
    });

    it('should reject if create template fails', async () => {
      const runStub = stub(yeoman.prototype, 'run').callsFake(
        (args, options, callback) => {
          callback(new Error('error'));
        }
      );
      const templateService = TemplateService.getInstance(process.cwd());
      try {
        await templateService.create(TemplateType.ApexClass, {
          template: 'DefaultApexClass',
          classname: 'LibraryCreateClass',
          outputdir: path.join('testsoutput', 'libraryCreate', 'apexClass')
        });
      } catch (error) {
        expect(error.message).to.equal('error');
      }
      runStub.restore();
    });
  });
});
