#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const currDir = process.cwd();
const libDir = path.join(currDir, 'lib');
const libTemplatesDir = path.join(libDir, 'templates');
const srcTemplatesDir = path.join(currDir, 'src', 'templates');

fs.cpSync(srcTemplatesDir, libTemplatesDir, { recursive: true });
