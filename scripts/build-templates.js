#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const currDir = process.cwd();
const libDir = path.join(currDir, 'lib');
const libTemplatesDir = path.join(libDir, 'templates');
const srcTemplatesDir = path.join(currDir, 'src', 'templates');

if (!fs.existsSync(libDir)) {
  shell.mkdir(libDir);
}

shell.cp('-rf', srcTemplatesDir, libTemplatesDir);
