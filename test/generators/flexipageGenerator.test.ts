/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TemplateService, TemplateType } from '../../src/index';
import FlexipageGenerator from '../../src/generators/flexipageGenerator';
import { getDefaultApiVersion } from '../../src/generators/baseGenerator';

const remove = async (file: string) => {
  await fs.promises.rm(file, { force: true, recursive: true });
};

const assertFileExists = (file: string) => {
  expect(fs.existsSync(file), `Expected file to exist: ${file}`).toBe(true);
};

const assertFileContent = (file: string, regex: string | RegExp) => {
  expect(fs.existsSync(file), `File does not exist: ${file}`).toBe(true);

  const body = fs.readFileSync(file, 'utf8');

  const match =
    typeof regex === 'string' ? body.includes(regex) : regex.test(body);

  expect(match, `${file} did not match '${regex}'. Contained:\n\n${body}`).toBe(
    true,
  );
};

describe('FlexipageGenerator', () => {
  const apiVersion = getDefaultApiVersion();
  const outputDir = path.join('testsoutput', 'flexipages');

  beforeEach(async () => {
    await remove(outputDir);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateOptions', () => {
    it('should validate flexipagename is provided', () => {
      expect(() => {
        new FlexipageGenerator({
          flexipagename: '',
          template: 'HomePage',
          outputdir: outputDir,
          internal: true,
        });
      }).toThrow();
    });

    it('should validate template is provided', () => {
      expect(() => {
        new FlexipageGenerator({
          flexipagename: 'TestPage',
          template: '' as any,
          outputdir: outputDir,
          internal: true,
        });
      }).toThrow();
    });

    it('should validate template is one of the valid types', () => {
      expect(() => {
        new FlexipageGenerator({
          flexipagename: 'TestPage',
          template: 'InvalidTemplate' as any,
          outputdir: outputDir,
          internal: true,
        });
      }).toThrow(/Invalid.*template/i);
    });

    it('should validate RecordPage requires entityName', () => {
      expect(() => {
        new FlexipageGenerator({
          flexipagename: 'TestPage',
          template: 'RecordPage',
          outputdir: outputDir,
          internal: true,
        });
      }).toThrow(/entityName/i);
    });

    it('should validate max 11 secondary fields', () => {
      expect(() => {
        new FlexipageGenerator({
          flexipagename: 'TestPage',
          template: 'RecordPage',
          outputdir: outputDir,
          entityName: 'Account',
          secondaryFields: [
            'Field1',
            'Field2',
            'Field3',
            'Field4',
            'Field5',
            'Field6',
            'Field7',
            'Field8',
            'Field9',
            'Field10',
            'Field11',
            'Field12',
          ],
          internal: true,
        });
      }).toThrow(/Too many secondary fields/i);
    });

    it('should allow up to 11 secondary fields', () => {
      expect(() => {
        new FlexipageGenerator({
          flexipagename: 'TestPage',
          template: 'RecordPage',
          outputdir: outputDir,
          entityName: 'Account',
          secondaryFields: [
            'Field1',
            'Field2',
            'Field3',
            'Field4',
            'Field5',
            'Field6',
            'Field7',
            'Field8',
            'Field9',
            'Field10',
            'Field11',
          ],
          internal: true,
        });
      }).not.toThrow();
    });

    it('should not append flexipages to outputdir when it already contains flexipages', () => {
      const outputDirWithFlexipages = path.join('testsoutput', 'flexipages');
      const generator = new FlexipageGenerator({
        flexipagename: 'TestPage',
        template: 'HomePage',
        outputdir: outputDirWithFlexipages,
        internal: true,
      });
      // The outputdir should remain unchanged since it already contains 'flexipages'
      expect((generator as any).outputdir).toBe(outputDirWithFlexipages);
    });

    it('should append flexipages to outputdir when not internal and outputdir does not contain flexipages', () => {
      const outputDirWithoutFlexipages = path.join('testsoutput', 'mydir');
      const generator = new FlexipageGenerator({
        flexipagename: 'TestPage',
        template: 'HomePage',
        outputdir: outputDirWithoutFlexipages,
        internal: false,
      });
      // The outputdir should have 'flexipages' appended
      expect((generator as any).outputdir).toBe(
        path.join('testsoutput', 'mydir', 'flexipages'),
      );
    });
  });

  describe('generate HomePage', () => {
    it('should create HomePage FlexiPage with local templates', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const result = await templateService.create(TemplateType.Flexipage, {
        flexipagename: 'MyHomePage',
        template: 'HomePage',
        outputdir: outputDir,
        apiversion: apiVersion,
        masterlabel: 'My Home Page',
        description: 'Test home page',
        internal: true,
      });

      const expectedFile = path.join(
        outputDir,
        'MyHomePage.flexipage-meta.xml',
      );

      expect(result.created).toHaveLength(1);
      assertFileExists(expectedFile);
      assertFileContent(expectedFile, 'HomePage');
      assertFileContent(expectedFile, 'home:desktopTemplate');
      assertFileContent(expectedFile, 'My Home Page');
      assertFileContent(expectedFile, 'Test home page');
    });

    it('should use default label when not provided', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.Flexipage, {
        flexipagename: 'DefaultHomePage',
        template: 'HomePage',
        outputdir: outputDir,
        internal: true,
      });

      const expectedFile = path.join(
        outputDir,
        'DefaultHomePage.flexipage-meta.xml',
      );

      assertFileExists(expectedFile);
      assertFileContent(expectedFile, 'DefaultHomePage');
    });
  });

  describe('generate AppPage', () => {
    it('should create AppPage FlexiPage with local templates', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const result = await templateService.create(TemplateType.Flexipage, {
        flexipagename: 'MyAppPage',
        template: 'AppPage',
        outputdir: outputDir,
        masterlabel: 'My App Page',
        description: 'Test app page',
        internal: true,
      });

      const expectedFile = path.join(outputDir, 'MyAppPage.flexipage-meta.xml');

      expect(result.created).toHaveLength(1);
      assertFileExists(expectedFile);
      assertFileContent(expectedFile, 'AppPage');
      assertFileContent(expectedFile, 'My App Page');
      assertFileContent(expectedFile, 'Test app page');
    });
  });

  describe('generate RecordPage', () => {
    it('should create RecordPage FlexiPage with entityName', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const result = await templateService.create(TemplateType.Flexipage, {
        flexipagename: 'AccountRecordPage',
        template: 'RecordPage',
        outputdir: outputDir,
        entityName: 'Account',
        masterlabel: 'Account Record Page',
        description: 'Test account record page',
        internal: true,
      });

      const expectedFile = path.join(
        outputDir,
        'AccountRecordPage.flexipage-meta.xml',
      );

      expect(result.created).toHaveLength(1);
      assertFileExists(expectedFile);
      assertFileContent(expectedFile, 'RecordPage');
      assertFileContent(expectedFile, 'Account');
      assertFileContent(expectedFile, 'Account Record Page');
    });

    it('should create RecordPage with primary, secondary, and detail fields', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.Flexipage, {
        flexipagename: 'OpportunityPage',
        template: 'RecordPage',
        outputdir: outputDir,
        entityName: 'Opportunity',
        primaryField: 'Name',
        secondaryFields: ['Stage', 'CloseDate', 'Owner'],
        detailFields: ['Name', 'Amount', 'Stage', 'CloseDate'],
        internal: true,
      });

      const expectedFile = path.join(
        outputDir,
        'OpportunityPage.flexipage-meta.xml',
      );

      assertFileExists(expectedFile);
      assertFileContent(expectedFile, 'Opportunity');
      assertFileContent(expectedFile, 'Name');
      assertFileContent(expectedFile, 'Amount');
      assertFileContent(expectedFile, 'Stage');
      assertFileContent(expectedFile, 'CloseDate');
      assertFileContent(expectedFile, 'Owner');
    });

    it('should create RecordPage for custom object', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.Flexipage, {
        flexipagename: 'CustomObjectPage',
        template: 'RecordPage',
        outputdir: outputDir,
        entityName: 'Custom_Object__c',
        primaryFields: ['Name'],
        secondaryFields: ['Custom_Field__c'],
        internal: true,
      });

      const expectedFile = path.join(
        outputDir,
        'CustomObjectPage.flexipage-meta.xml',
      );

      assertFileExists(expectedFile);
      assertFileContent(expectedFile, 'Custom_Object__c');
      assertFileContent(expectedFile, 'Custom_Field__c');
    });
  });

  describe('file naming', () => {
    it('should replace _flexipage placeholder with actual name', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.Flexipage, {
        flexipagename: 'TestNaming',
        template: 'HomePage',
        outputdir: outputDir,
        internal: true,
      });

      const expectedFile = path.join(
        outputDir,
        'TestNaming.flexipage-meta.xml',
      );
      const unexpectedFile = path.join(
        outputDir,
        '_flexipage.flexipage-meta.xml',
      );

      assertFileExists(expectedFile);
      expect(
        fs.existsSync(unexpectedFile),
        'Template placeholder file should not exist',
      ).toBe(false);
    });
  });

  describe('template rendering', () => {
    it('should render EJS variables in templates', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.Flexipage, {
        flexipagename: 'VariableTest',
        template: 'HomePage',
        outputdir: outputDir,
        apiversion: '62.0',
        masterlabel: 'Variable Test Page',
        description: 'Testing EJS variables',
        internal: true,
      });

      const expectedFile = path.join(
        outputDir,
        'VariableTest.flexipage-meta.xml',
      );

      assertFileContent(expectedFile, 'Variable Test Page');
      assertFileContent(expectedFile, 'Testing EJS variables');
    });
  });

  describe('custom templates', () => {
    const customTemplatesDir = path.join('testsoutput', 'custom-templates');

    beforeEach(async () => {
      await remove(customTemplatesDir);
    });

    afterEach(async () => {
      await remove(customTemplatesDir);
    });

    it('should throw error when custom template path does not contain the template', async () => {
      // Create an empty custom templates directory
      const customFlexipageDir = path.join(customTemplatesDir, 'flexipage');
      await fs.promises.mkdir(customFlexipageDir, { recursive: true });

      const generator = new FlexipageGenerator({
        flexipagename: 'TestPage',
        template: 'HomePage',
        outputdir: outputDir,
        flexipageTemplatesGitRepo: customTemplatesDir,
        internal: true,
      });

      await expect(generator.generate()).rejects.toThrow(
        /template.*not found|MissingFlexipageTemplate/i,
      );
    });

    it('should handle subdirectories in custom templates', async () => {
      // Create custom template with subdirectory structure containing a template file
      const customSubdir = path.join(
        customTemplatesDir,
        'flexipage',
        'HomePage',
        'subdir',
      );
      await fs.promises.mkdir(customSubdir, { recursive: true });

      // Create the main template file
      const templateFile = path.join(
        customTemplatesDir,
        'flexipage',
        'HomePage',
        '_flexipage.flexipage-meta.xml',
      );
      await fs.promises.writeFile(
        templateFile,
        `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <masterLabel><%= masterlabel %></masterLabel>
    <type>HomePage</type>
</FlexiPage>`,
      );

      // Create a template file in subdirectory
      const subTemplateFile = path.join(
        customSubdir,
        '_flexipage.flexipage-meta.xml',
      );
      await fs.promises.writeFile(
        subTemplateFile,
        `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <masterLabel><%= masterlabel %> Sub</masterLabel>
    <type>HomePage</type>
</FlexiPage>`,
      );

      const generator = new FlexipageGenerator({
        flexipagename: 'SubdirTest',
        template: 'HomePage',
        outputdir: outputDir,
        flexipageTemplatesGitRepo: customTemplatesDir,
        masterlabel: 'Subdir Test Page',
        internal: true,
      });

      await generator.generate();

      // Check main file was created
      const expectedFile = path.join(
        outputDir,
        'SubdirTest.flexipage-meta.xml',
      );
      assertFileExists(expectedFile);
      assertFileContent(expectedFile, 'Subdir Test Page');

      // Check subdirectory template file was also processed
      const expectedSubFile = path.join(
        outputDir,
        'subdir',
        'SubdirTest.flexipage-meta.xml',
      );
      assertFileExists(expectedSubFile);
      assertFileContent(expectedSubFile, 'Subdir Test Page Sub');
    });
  });
});
