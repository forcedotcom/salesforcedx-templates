#!/usr/bin/env node

/**
 * Quick script to test TypeScript project generation locally
 * Usage: node test-local.js
 */

const path = require('path');
const fs = require('fs');
const { TemplateService, TemplateType } = require('./lib');

// Configure test directory (change this to wherever you want)
const TEST_DIR = process.env.TEST_DIR || '/tmp/sf-template-tests';
const PROJECTS_TO_TEST = [
  { name: 'ts-standard', template: 'standard', lwcLanguage: 'typescript' },
  { name: 'ts-empty', template: 'empty', lwcLanguage: 'typescript' },
  { name: 'js-standard', template: 'standard', lwcLanguage: 'javascript' },
  { name: 'js-empty', template: 'empty', lwcLanguage: undefined }, // Test without lwcLanguage
];

async function testProjectGeneration() {
  console.log('🧪 Testing TypeScript Project Generation\n');
  console.log(`📁 Test directory: ${TEST_DIR}\n`);

  // Clean up and create test directory
  if (fs.existsSync(TEST_DIR)) {
    console.log('🧹 Cleaning up previous tests...');
    fs.rmSync(TEST_DIR, { recursive: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });

  const templateService = TemplateService.getInstance();
  const results = [];

  for (const project of PROJECTS_TO_TEST) {
    console.log(
      `\n📦 Generating: ${project.name} (${project.template}, ${
        project.lwcLanguage || 'default'
      })`
    );

    try {
      await templateService.create(TemplateType.Project, {
        projectname: project.name,
        template: project.template,
        defaultpackagedir: 'force-app',
        manifest: false,
        ns: '',
        loginurl: 'https://login.salesforce.com',
        lwcLanguage: project.lwcLanguage,
        outputdir: TEST_DIR,
      });

      // Verify key files
      const projectPath = path.join(TEST_DIR, project.name);
      const checks = {
        'sfdx-project.json': fs.existsSync(
          path.join(projectPath, 'sfdx-project.json')
        ),
        'package.json': fs.existsSync(path.join(projectPath, 'package.json')),
        'tsconfig.json': fs.existsSync(path.join(projectPath, 'tsconfig.json')),
        'force-app': fs.existsSync(path.join(projectPath, 'force-app')),
      };

      // Check sfdx-project.json content
      const sfdxProject = JSON.parse(
        fs.readFileSync(path.join(projectPath, 'sfdx-project.json'), 'utf8')
      );
      const hasLwcLanguage = !!sfdxProject.defaultLwcLanguage;

      console.log(`  ✅ Project created at: ${projectPath}`);
      console.log(
        `  ✅ sfdx-project.json: ${checks['sfdx-project.json'] ? '✓' : '✗'}`
      );
      console.log(`  ✅ package.json: ${checks['package.json'] ? '✓' : '✗'}`);
      console.log(
        `  ${checks['tsconfig.json'] ? '✅' : '⚪'} tsconfig.json: ${
          checks['tsconfig.json'] ? '✓' : '✗ (expected for JS)'
        }`
      );
      console.log(
        `  ${hasLwcLanguage ? '✅' : '⚪'} defaultLwcLanguage: ${
          hasLwcLanguage ? sfdxProject.defaultLwcLanguage : '(not set)'
        }`
      );

      results.push({ ...project, success: true, checks, hasLwcLanguage });
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      results.push({ ...project, success: false, error: error.message });
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 Test Summary\n');

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`✅ Passed: ${passed}/${PROJECTS_TO_TEST.length}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}/${PROJECTS_TO_TEST.length}`);
  }

  console.log('\n📁 Generated projects:');
  results.forEach((r) => {
    if (r.success) {
      console.log(`  ${path.join(TEST_DIR, r.name)}`);
    }
  });

  console.log('\n🧹 To clean up:');
  console.log(`  rm -rf ${TEST_DIR}`);
  console.log('═══════════════════════════════════════════\n');

  return results;
}

// Run tests
testProjectGeneration()
  .then(() => {
    console.log('✨ Tests completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
