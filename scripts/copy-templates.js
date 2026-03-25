#!/usr/bin/env node
/*
 * Copies npm-based templates into src/templates/ (webapplication and project).
 * Run as part of build: yarn build:copy-templates
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const shell = require('shelljs');

/** Single source: shared with src/utils/webappTemplateUtils.ts (compiled to lib/utils/template-placeholders.js) */
const TEMPLATE_PLACEHOLDERS_SPEC = require(path.join(
  __dirname,
  '..',
  'lib',
  'utils',
  'template-placeholders.js'
)).default;

/**
 * Renames a directory to a placeholder name if it exists. Keeps template paths short for Windows.
 * @returns {string|undefined} The placeholder path if renamed, otherwise undefined.
 */
function renameDirToPlaceholder(parentDir, dirName, toPath) {
  const fullPath = path.join(parentDir, dirName);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    const placeholderPath = path.join(parentDir, toPath);
    fs.renameSync(fullPath, placeholderPath);
    return placeholderPath;
  }
  return undefined;
}

/** Optional renames keyed by parent placeholder; from dir comes from config. */
const PROJECT_OPTIONAL_RENAMES = [
  {
    parent: '_w_',
    getFrom: (config) => config.appFolderInNpm ?? null,
    to: '_a_',
  },
  {
    parent: '_s_',
    getFrom: (config) => config.appSiteFolderInNpm ?? null,
    to: '_a1_',
  },
];

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
    generateLockfile: true,
  },
  // Project templates (reactb2e, reactb2x)
  {
    packageName:
      '@salesforce/webapp-template-app-react-template-b2e-experimental',
    getSourceDir: (packageDir) => path.join(packageDir, 'dist'),
    destSubpath: 'project/reactb2e',
    appFolderInNpm: 'appreacttemplateb2e',
    appSiteFolderInNpm: 'appreacttemplateb2e1',
    lockfileDir: '_p_/_m_/_w_/_a_',
  },
  {
    packageName:
      '@salesforce/webapp-template-app-react-template-b2x-experimental',
    getSourceDir: (packageDir) => path.join(packageDir, 'dist'),
    destSubpath: 'project/reactb2x',
    appFolderInNpm: 'appreacttemplateb2x',
    appSiteFolderInNpm: 'appreacttemplateb2x1',
    lockfileDir: '_p_/_m_/_w_/_a_',
  },
];

function generateLockfile(destDir) {
  console.log(`Generating package-lock.json in ${destDir}...`);
  try {
    execSync(
      'npm install --package-lock-only --registry=https://registry.npmjs.org',
      {
        cwd: destDir,
        stdio: 'inherit',
      }
    );
  } catch (error) {
    console.error(`Failed to generate lockfile in ${destDir}:`, error.message);
    process.exit(1);
  }
}

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

    // Shorten paths per template-placeholders.json; placeholders replaced at generation in webappTemplateUtils.
    // Missing dirs are skipped; no failure.
    if (config.destSubpath.startsWith('project/')) {
      const paths = { dest: destDir };

      function getParentPath(step) {
        const base = paths[step.parent];
        if (!base) return null;
        return step.subpath ? path.join(base, step.subpath) : base;
      }

      for (const step of TEMPLATE_PLACEHOLDERS_SPEC) {
        const parentPath = getParentPath(step);
        if (!parentPath) continue;
        const toPath = step.toPath ?? step.placeholder;
        const newPath = renameDirToPlaceholder(
          parentPath,
          step.dirInNpm,
          toPath
        );
        if (newPath) {
          if (!toPath.includes(path.sep)) {
            paths[step.placeholder] = newPath;
          }
          if (step.removeEmptySibling) {
            const emptyDir = path.join(parentPath, step.removeEmptySibling);
            if (fs.existsSync(emptyDir)) {
              fs.rmSync(emptyDir, { recursive: true });
            }
          }
        }
      }

      for (const step of PROJECT_OPTIONAL_RENAMES) {
        const fromDir = step.getFrom(config);
        if (!fromDir) continue;
        const parentPath = paths[step.parent];
        if (parentPath) {
          const newPath = renameDirToPlaceholder(parentPath, fromDir, step.to);
          if (newPath) {
            paths[step.to] = newPath;
          }
        }
      }

      // Path-shortening steps under _a_ (features, global-search, etc.); _a_ is set by optional renames above.
      for (const step of TEMPLATE_PLACEHOLDERS_SPEC) {
        const parentPath = getParentPath(step);
        if (!parentPath) continue;
        const toPath = step.toPath ?? step.placeholder;
        const newPath = renameDirToPlaceholder(
          parentPath,
          step.dirInNpm,
          toPath
        );
        if (newPath && !toPath.includes(path.sep)) {
          paths[step.placeholder] = newPath;
        }
      }
    }

    if (config.generateLockfile) {
      generateLockfile(destDir);
    }

    if (config.lockfileDir) {
      const lockfileTarget = path.join(destDir, config.lockfileDir);
      generateLockfile(lockfileTarget);
      // Remove root-level lockfile copied from npm source
      const rootLockfile = path.join(destDir, 'package-lock.json');
      if (fs.existsSync(rootLockfile)) {
        fs.unlinkSync(rootLockfile);
      }
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

/** Derived from template-placeholders.json + optional _a_/_a1_; matches webappTemplateUtils PLACEHOLDER_KEYS. */
const PLACEHOLDERS = Object.fromEntries([
  ...TEMPLATE_PLACEHOLDERS_SPEC.map((e) => [e.key, e.placeholder]),
  ['APP_PLACEHOLDER', '_a_'],
  ['APP_SUFFIX_PLACEHOLDER', '_a1_'],
]);

module.exports = { copyAllTemplates, PLACEHOLDERS };

if (require.main === module) {
  copyAllTemplates();
}
