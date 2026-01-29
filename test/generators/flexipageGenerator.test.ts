/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as chai from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import { TemplateService, TemplateType } from '../../src';
import FlexipageGenerator from '../../src/generators/flexipageGenerator';
import { getDefaultApiVersion } from '../../src/generators/baseGenerator';

chai.config.truncateThreshold = 100000;
const { expect } = chai;

async function remove(file: string) {
  await fs.promises.rm(file, { force: true, recursive: true });
}

function assertFileExists(file: string) {
  const exists = fs.existsSync(file);
  expect(exists, `Expected file to exist: ${file}`).to.be.true;
}

function assertFileContent(file: string, regex: string | RegExp) {
  const exists = fs.existsSync(file);
  expect(exists, `File does not exist: ${file}`).to.be.true;

  const body = fs.readFileSync(file, 'utf8');

  let match = false;
  if (typeof regex === 'string') {
    match = body.indexOf(regex) !== -1;
  } else {
    match = regex.test(body);
  }

  expect(match, `${file} did not match '${regex}'. Contained:\n\n${body}`).to.be
    .true;
}

describe('FlexipageGenerator', () => {
  const apiVersion = getDefaultApiVersion();
  const outputDir = path.join('testsoutput', 'flexipages');

  beforeEach(async () => {
    await remove(outputDir);
  });

  afterEach(() => {
    sinon.restore();
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
      }).to.throw();
    });

    it('should validate template is provided', () => {
      expect(() => {
        new FlexipageGenerator({
          flexipagename: 'TestPage',
          template: '' as any,
          outputdir: outputDir,
          internal: true,
        });
      }).to.throw();
    });

    it('should validate template is one of the valid types', () => {
      expect(() => {
        new FlexipageGenerator({
          flexipagename: 'TestPage',
          template: 'InvalidTemplate' as any,
          outputdir: outputDir,
          internal: true,
        });
      }).to.throw(/Invalid.*template/i);
    });

    it('should validate RecordPage requires entityName', () => {
      expect(() => {
        new FlexipageGenerator({
          flexipagename: 'TestPage',
          template: 'RecordPage',
          outputdir: outputDir,
          internal: true,
        });
      }).to.throw(/entityName/i);
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
      }).to.throw(/Too many secondary fields/i);
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
      }).to.not.throw();
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
      expect((generator as any).outputdir).to.equal(outputDirWithFlexipages);
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
      expect((generator as any).outputdir).to.equal(
        path.join('testsoutput', 'mydir', 'flexipages')
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
        'MyHomePage.flexipage-meta.xml'
      );

      expect(result.created).to.have.lengthOf(1);
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
        'DefaultHomePage.flexipage-meta.xml'
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

      expect(result.created).to.have.lengthOf(1);
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
        'AccountRecordPage.flexipage-meta.xml'
      );

      expect(result.created).to.have.lengthOf(1);
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
        'OpportunityPage.flexipage-meta.xml'
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
        'CustomObjectPage.flexipage-meta.xml'
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
        'TestNaming.flexipage-meta.xml'
      );
      const unexpectedFile = path.join(
        outputDir,
        '_flexipage.flexipage-meta.xml'
      );

      assertFileExists(expectedFile);
      expect(
        fs.existsSync(unexpectedFile),
        'Template placeholder file should not exist'
      ).to.be.false;
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
        'VariableTest.flexipage-meta.xml'
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

      try {
        await generator.generate();
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).to.match(
          /template.*not found|MissingFlexipageTemplate/i
        );
      }
    });

    it('should handle subdirectories in custom templates', async () => {
      // Create custom template with subdirectory structure
      const customFlexipageDir = path.join(
        customTemplatesDir,
        'flexipage',
        'HomePage',
        'subdir'
      );
      await fs.promises.mkdir(customFlexipageDir, { recursive: true });

      // Create a non-template file in subdirectory
      const subFile = path.join(customFlexipageDir, 'helper.txt');
      await fs.promises.writeFile(subFile, 'Helper content');

      // Create the template file in parent
      const templateFile = path.join(
        customTemplatesDir,
        'flexipage',
        'HomePage',
        '_flexipage.flexipage-meta.xml'
      );
      await fs.promises.writeFile(
        templateFile,
        `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <masterLabel><%= masterlabel %></masterLabel>
    <type>HomePage</type>
</FlexiPage>`
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
        'SubdirTest.flexipage-meta.xml'
      );
      assertFileExists(expectedFile);
      assertFileContent(expectedFile, 'Subdir Test Page');

      // Check subdirectory file was copied
      const expectedSubFile = path.join(outputDir, 'subdir', 'helper.txt');
      assertFileExists(expectedSubFile);
      assertFileContent(expectedSubFile, 'Helper content');
    });

    it('should copy non-template files as-is', async () => {
      // Create custom template directory
      const customFlexipageDir = path.join(
        customTemplatesDir,
        'flexipage',
        'HomePage'
      );
      await fs.promises.mkdir(customFlexipageDir, { recursive: true });

      // Create a template file
      const templateFile = path.join(
        customFlexipageDir,
        '_flexipage.flexipage-meta.xml'
      );
      await fs.promises.writeFile(
        templateFile,
        `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <masterLabel><%= masterlabel %></masterLabel>
    <type>HomePage</type>
</FlexiPage>`
      );

      // Create a non-template file (e.g., a README or config)
      const nonTemplateFile = path.join(customFlexipageDir, 'README.md');
      await fs.promises.writeFile(
        nonTemplateFile,
        '# Custom Template\nThis is a readme.'
      );

      const generator = new FlexipageGenerator({
        flexipagename: 'CopyTest',
        template: 'HomePage',
        outputdir: outputDir,
        flexipageTemplatesGitRepo: customTemplatesDir,
        masterlabel: 'Copy Test Page',
        internal: true,
      });

      await generator.generate();

      // Check template file was rendered
      const expectedFile = path.join(outputDir, 'CopyTest.flexipage-meta.xml');
      assertFileExists(expectedFile);
      assertFileContent(expectedFile, 'Copy Test Page');

      // Check non-template file was copied as-is
      const copiedReadme = path.join(outputDir, 'README.md');
      assertFileExists(copiedReadme);
      assertFileContent(copiedReadme, '# Custom Template');
    });

    it('should handle identical existing files', async () => {
      // Create custom template directory
      const customFlexipageDir = path.join(
        customTemplatesDir,
        'flexipage',
        'HomePage'
      );
      await fs.promises.mkdir(customFlexipageDir, { recursive: true });

      // Create template file
      const templateFile = path.join(
        customFlexipageDir,
        '_flexipage.flexipage-meta.xml'
      );
      await fs.promises.writeFile(
        templateFile,
        `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <masterLabel><%= masterlabel %></masterLabel>
    <type>HomePage</type>
</FlexiPage>`
      );

      // Create a non-template file
      const staticFile = path.join(customFlexipageDir, 'static.txt');
      await fs.promises.writeFile(staticFile, 'Static content');

      // Create output dir and pre-existing identical file
      await fs.promises.mkdir(outputDir, { recursive: true });
      const existingFile = path.join(outputDir, 'static.txt');
      await fs.promises.writeFile(existingFile, 'Static content');

      const generator = new FlexipageGenerator({
        flexipagename: 'IdenticalTest',
        template: 'HomePage',
        outputdir: outputDir,
        flexipageTemplatesGitRepo: customTemplatesDir,
        masterlabel: 'Identical Test Page',
        internal: true,
      });

      await generator.generate();

      // The static.txt file should be marked as identical
      expect(generator.changes.identical.some((f) => f.includes('static.txt')))
        .to.be.true;
    });

    it('should handle conflicting existing files', async () => {
      // Create custom template directory
      const customFlexipageDir = path.join(
        customTemplatesDir,
        'flexipage',
        'HomePage'
      );
      await fs.promises.mkdir(customFlexipageDir, { recursive: true });

      // Create template file
      const templateFile = path.join(
        customFlexipageDir,
        '_flexipage.flexipage-meta.xml'
      );
      await fs.promises.writeFile(
        templateFile,
        `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <masterLabel><%= masterlabel %></masterLabel>
    <type>HomePage</type>
</FlexiPage>`
      );

      // Create a non-template file
      const staticFile = path.join(customFlexipageDir, 'config.json');
      await fs.promises.writeFile(staticFile, '{"version": 2}');

      // Create output dir and pre-existing different file
      await fs.promises.mkdir(outputDir, { recursive: true });
      const existingFile = path.join(outputDir, 'config.json');
      await fs.promises.writeFile(existingFile, '{"version": 1}');

      const generator = new FlexipageGenerator({
        flexipagename: 'ConflictTest',
        template: 'HomePage',
        outputdir: outputDir,
        flexipageTemplatesGitRepo: customTemplatesDir,
        masterlabel: 'Conflict Test Page',
        internal: true,
      });

      await generator.generate();

      // The config.json file should be marked as conflicted and forced
      expect(
        generator.changes.conflicted.some((f) => f.includes('config.json'))
      ).to.be.true;
      expect(generator.changes.forced.some((f) => f.includes('config.json'))).to
        .be.true;

      // The file should have been overwritten with new content
      const newContent = fs.readFileSync(existingFile, 'utf8');
      expect(newContent).to.include('"version": 2');
    });
  });
});
