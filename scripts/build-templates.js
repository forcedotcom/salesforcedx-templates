#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

// Determine the directory based on the 'esbuild' argument
const isEsbuild = process.argv.includes('--esbuild');
const currDir = process.cwd();
const outputDir = isEsbuild ? 'dist' : 'lib';
const outputTemplatesDir = path.join(currDir, outputDir, 'templates');
const srcTemplatesDir = path.join(currDir, 'src', 'templates');

if (!fs.existsSync(outputDir)) {
  shell.mkdir(outputDir);
}

shell.cp('-rf', srcTemplatesDir, outputTemplatesDir);
