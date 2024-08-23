#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const currDir = process.cwd();
const libDir = path.join(currDir, 'lib');
const libTemplatesDir = path.join(libDir, 'templates');
const srcTemplatesDir = path.join(currDir, 'src', 'templates');
const libUtilsDir = path.join(libDir, 'utils');
const srcUtilsDir = path.join(currDir, 'src', 'utils');

if (!fs.existsSync(libDir)) {
  shell.mkdir(libDir);
}

shell.cp('-rf', srcTemplatesDir, libTemplatesDir);
shell.cp('-rf', srcUtilsDir, libUtilsDir);
