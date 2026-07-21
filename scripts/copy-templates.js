#!/usr/bin/env node
/*
 * Copies npm-based templates into src/templates/ (uiBundles and project).
 * Run as part of build: yarn build:copy-templates
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

/** Single source: shared with src/utils/uiBundleTemplateUtils.ts (compiled to lib/utils/template-placeholders.js) */
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
    packageName: '@salesforce/ui-bundle-template-base-web-app',
    getSourceDir: (packageDir) => path.join(packageDir, 'dist'),
    destSubpath: 'uiBundles/webappbasic',
  },
  {
    packageName: '@salesforce/ui-bundle-template-base-react-app',
    getSourceDir: (packageDir) =>
      path.join(
        packageDir,
        'src',
        'force-app',
        'main',
        'default',
        'uiBundles',
        'base-react-app'
      ),
    destSubpath: 'uiBundles/reactbasic',
  },
  {
    packageName: '@salesforce/ui-bundle-template-base-angular-app',
    getSourceDir: (packageDir) =>
      path.join(
        packageDir,
        'src',
        'force-app',
        'main',
        'default',
        'uiBundles',
        'base-angular-app'
      ),
    destSubpath: 'uiBundles/angularbasic',
  },
  // Project templates (reactinternalapp, reactexternalapp)
  {
    packageName: '@salesforce/ui-bundle-template-app-react-template-b2e',
    getSourceDir: (packageDir) => path.join(packageDir, 'dist'),
    destSubpath: 'project/reactinternalapp',
    appFolderInNpm: 'reactinternalapp',
  },
  {
    packageName: '@salesforce/ui-bundle-template-app-react-template-b2x',
    getSourceDir: (packageDir) => path.join(packageDir, 'dist'),
    destSubpath: 'project/reactexternalapp',
    appFolderInNpm: 'reactexternalapp',
  },
  // Angular project templates
  {
    packageName: '@salesforce/ui-bundle-template-app-angular-template-b2x',
    getSourceDir: (packageDir) => path.join(packageDir, 'dist'),
    destSubpath: 'project/angularextapp',
    appFolderInNpm: 'angularextapp',
  },
    {
    packageName: '@salesforce/ui-bundle-template-app-angular-template-b2e',
    getSourceDir: (packageDir) => path.join(packageDir, 'dist'),
    destSubpath: 'project/angularintapp',
    appFolderInNpm: 'angularintapp',
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

    // Remove build/test artifacts that may exist in source packages
    const artifactDirs = [
      'node_modules',
      'build',
      'dist',
      'e2e',
      'playwright-report',
      'test-results',
      'coverage',
      '.nyc_output',
    ];
    const artifactFiles = ['package-lock.json', 'tsconfig.tsbuildinfo'];
    for (const dir of artifactDirs) {
      const dirPath = path.join(destDir, dir);
      if (fs.existsSync(dirPath)) {
        shell.rm('-rf', dirPath);
      }
    }
    for (const file of artifactFiles) {
      const filePath = path.join(destDir, file);
      if (fs.existsSync(filePath)) {
        shell.rm('-f', filePath);
      }
    }

    // Shorten paths per template-placeholders.json; placeholders replaced at generation in uiBundleTemplateUtils.
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
  generateUiBundleLockFiles(templatesRoot);
  console.log('Templates copied successfully.');
}

/**
 * Generate package-lock.json for uibundle directories that contain a package.json.
 * These directories are under uiBundles/ (standalone templates) or _w_/ (placeholder
 * for uiBundles in project templates). The lock file ships with the template so that
 * `npm ci` works out of the box when users scaffold a new bundle.
 */
function generateUiBundleLockFiles(templatesDir) {
  const uiBundleDirs = findUiBundlePackageJsonDirs(templatesDir);
  for (const dir of uiBundleDirs) {
    const rel = path.relative(currDir, dir);
    console.log(`Generating package-lock.json in ${rel}`);
    try {
      execSync('npm install --package-lock-only --ignore-scripts', {
        cwd: dir,
        stdio: 'pipe',
      });
    } catch (error) {
      console.error(
        `Failed to generate package-lock.json in ${rel}: ${error.message}`
      );
      process.exit(1);
    }
  }
}

/**
 * Walk the templates directory and collect every directory that:
 *  1. Contains a package.json, AND
 *  2. Lives under a path segment named "uiBundles" or "_w_" (the build-time placeholder).
 */
function findUiBundlePackageJsonDirs(dir) {
  const results = [];

  function walk(current, insideUiBundles) {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    const hasPackageJson = entries.some(
      (e) => e.isFile() && e.name === 'package.json'
    );
    if (insideUiBundles && hasPackageJson) {
      results.push(current);
      return; // no need to descend further
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const isUiBundleSegment =
        entry.name === 'uiBundles' || entry.name === '_w_';
      walk(
        path.join(current, entry.name),
        insideUiBundles || isUiBundleSegment
      );
    }
  }

  walk(dir, false);
  return results;
}

/** Derived from template-placeholders.json + optional _a_/_a1_; matches uiBundleTemplateUtils PLACEHOLDER_KEYS. */
const PLACEHOLDERS = Object.fromEntries([
  ...TEMPLATE_PLACEHOLDERS_SPEC.map((e) => [e.key, e.placeholder]),
  ['APP_PLACEHOLDER', '_a_'],
  ['APP_SUFFIX_PLACEHOLDER', '_a1_'],
]);

module.exports = { copyAllTemplates, PLACEHOLDERS };

if (require.main === module) {
  copyAllTemplates();
}
