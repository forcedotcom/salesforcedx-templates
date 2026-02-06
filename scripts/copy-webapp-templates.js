#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const currDir = process.cwd();

// Function to copy npm package templates to src/templates
function copyNpmTemplateToSrc(packageName, destSubpath) {
  try {
    const packageJsonPath = require.resolve(`${packageName}/package.json`);
    const packageDir = path.dirname(packageJsonPath);

    // Determine source path based on package
    let sourceDir;
    if (
      packageName === '@salesforce/webapp-template-base-web-app-experimental'
    ) {
      sourceDir = path.join(packageDir, 'dist');
    } else if (
      packageName === '@salesforce/webapp-template-base-react-app-experimental'
    ) {
      sourceDir = path.join(
        packageDir,
        'src',
        'force-app',
        'main',
        'default',
        'webapplications',
        'base-react-app'
      );
    }

    if (!fs.existsSync(sourceDir)) {
      console.error(`Source directory not found: ${sourceDir}`);
      process.exit(1);
    }

    const destDir = path.join(
      currDir,
      'src',
      'templates',
      'webapplication',
      destSubpath
    );

    // Remove existing directory if it exists
    if (fs.existsSync(destDir)) {
      shell.rm('-rf', destDir);
    }

    // Create destination directory
    shell.mkdir('-p', destDir);

    // Copy files (including dotfiles)
    // Use glob pattern to copy everything including hidden files
    const result = shell.cp('-r', sourceDir + '/.', destDir);
    if (result.code !== 0) {
      console.error(`Failed to copy files: ${result.stderr}`);
      process.exit(1);
    }

    console.log(`Copied ${packageName} to ${destDir}`);
  } catch (error) {
    console.error(`Failed to copy ${packageName}:`, error.message);
    process.exit(1);
  }
}

function copyWebappTemplates() {
  console.log('Copying web application templates from npm packages...');
  copyNpmTemplateToSrc(
    '@salesforce/webapp-template-base-web-app-experimental',
    'webappbasic'
  );
  copyNpmTemplateToSrc(
    '@salesforce/webapp-template-base-react-app-experimental',
    'reactbasic'
  );
  console.log('Web application templates copied successfully.');
}

// Export the function
module.exports = copyWebappTemplates;

// Run if called directly
if (require.main === module) {
  copyWebappTemplates();
}
