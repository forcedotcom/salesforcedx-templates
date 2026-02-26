#!/usr/bin/env node
/*
 * Copies npm-based templates into src/templates/ (webapplication and project).
 * Run as part of build: yarn build:copy-templates
 */
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const currDir = process.cwd();
const templatesRoot = path.join(currDir, 'src', 'templates');

const TEMPLATES = [
  // Web application templates
  {
    packageName: '@salesforce/webapp-template-base-web-app-experimental',
    getSourceDir: (packageDir) => path.join(packageDir, 'dist'),
    destSubpath: 'webapplication/webappbasic',
  },
  {
    packageName: '@salesforce/webapp-template-base-react-app-experimental',
    getSourceDir: (packageDir) =>
      path.join(
        packageDir,
        'src',
        'force-app',
        'main',
        'default',
        'webapplications',
        'base-react-app'
      ),
    destSubpath: 'webapplication/reactbasic',
  },
  // Project templates (reactb2e, reactb2x)
  {
    packageName:
      '@salesforce/webapp-template-app-react-template-b2e-experimental',
    getSourceDir: (packageDir) => path.join(packageDir, 'dist'),
    destSubpath: 'project/reactb2e',
  },
  {
    packageName:
      '@salesforce/webapp-template-app-react-template-b2x-experimental',
    getSourceDir: (packageDir) => path.join(packageDir, 'dist'),
    destSubpath: 'project/reactb2x',
  },
];

function copyTemplate(config) {
  try {
    const packageJsonPath = require.resolve(
      `${config.packageName}/package.json`,
      { paths: [currDir] }
    );
    const packageDir = path.dirname(packageJsonPath);
    const sourceDir = config.getSourceDir(packageDir);

    if (!fs.existsSync(sourceDir)) {
      console.error(`Source directory not found: ${sourceDir}`);
      process.exit(1);
    }

    const destDir = path.join(templatesRoot, config.destSubpath);

    if (fs.existsSync(destDir)) {
      shell.rm('-rf', destDir);
    }

    shell.mkdir('-p', destDir);
    const result = shell.cp('-r', sourceDir + '/.', destDir);
    if (result.code !== 0) {
      console.error(`Failed to copy files: ${result.stderr}`);
      process.exit(1);
    }

    console.log(
      `Copied ${config.packageName} to src/templates/${config.destSubpath}`
    );
  } catch (error) {
    console.error(`Failed to copy ${config.packageName}:`, error.message);
    process.exit(1);
  }
}

function copyAllTemplates() {
  console.log('Copying templates from npm packages...');
  for (const config of TEMPLATES) {
    copyTemplate(config);
  }
  console.log('Templates copied successfully.');
}

module.exports = copyAllTemplates;

if (require.main === module) {
  copyAllTemplates();
}
