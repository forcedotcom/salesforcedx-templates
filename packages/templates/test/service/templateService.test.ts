/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import * as fs from 'fs-extra';
import * as path from 'path';
import { stub } from 'sinon';
import * as assert from 'yeoman-assert';
import * as yeoman from 'yeoman-environment';
import { TemplateService, TemplateType } from '../../src';

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
    <apiVersion>50.0</apiVersion>
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
