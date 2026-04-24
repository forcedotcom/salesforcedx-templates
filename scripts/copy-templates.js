#!/usr/bin/env node
/*
 * Copies npm-based templates into src/templates/ (uiBundles and project).
 * Run as part of build: yarn build:copy-templates
 */
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

/**
 * Recursive copy that trims trailing whitespace from each path segment.
 * Upstream packages occasionally ship files whose names end with a space
 * (e.g. "lds-guide-graphql.md "), which produces invalid OPC Part URIs
 * when vsce builds the .vsix.
 */
function cpSyncSanitized(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const safeName = entry.name.trimEnd();
    if (safeName !== entry.name) {
      console.warn(
        `[copy-templates] Sanitised filename: "${entry.name}" → "${safeName}"`,
      );
    }
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, safeName);
    if (entry.isDirectory()) {
      cpSyncSanitized(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/** Single source: shared with src/utils/uiBundleTemplateUtils.ts (compiled to lib/utils/template-placeholders.js) */
const TEMPLATE_PLACEHOLDERS_SPEC = require(
  path.join(__dirname, '..', 'lib', 'utils', 'template-placeholders.js'),
).default;

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
        'base-react-app',
      ),
    destSubpath: 'uiBundles/reactbasic',
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
];

function copyTemplate(config) {
  try {
    const packageJsonPath = require.resolve(
      `${config.packageName}/package.json`,
      { paths: [currDir] },
    );
    const packageDir = path.dirname(packageJsonPath);
    const sourceDir = config.getSourceDir(packageDir);

    if (!fs.existsSync(sourceDir)) {
      console.error(`Source directory not found: ${sourceDir}`);
      process.exit(1);
    }

    const destDir = path.join(templatesRoot, config.destSubpath);

    fs.rmSync(destDir, { recursive: true, force: true });

    cpSyncSanitized(sourceDir, destDir);

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
      fs.rmSync(path.join(destDir, dir), { recursive: true, force: true });
    }
    for (const file of artifactFiles) {
      fs.rmSync(path.join(destDir, file), { force: true });
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
          toPath,
        );
        if (newPath) {
          if (!toPath.includes(path.sep)) {
            paths[step.placeholder] = newPath;
          }
          if (step.removeEmptySibling) {
            const emptyDir = path.join(parentPath, step.removeEmptySibling);
            fs.rmSync(emptyDir, { recursive: true, force: true });
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
          toPath,
        );
        if (newPath && !toPath.includes(path.sep)) {
          paths[step.placeholder] = newPath;
        }
      }
    }

    console.log(
      `Copied ${config.packageName} to src/templates/${config.destSubpath}`,
    );
  } catch (error) {
    console.error(`Failed to copy ${config.packageName}:`, error.message);
    process.exit(1);
  }
}

async function copyAllTemplates() {
  console.log('Copying templates from npm packages...');
  for (const config of TEMPLATES) {
    copyTemplate(config);
  }
  await generateUiBundleLockFiles(templatesRoot);
  console.log('Templates copied successfully.');
}

/**
 * Generate package-lock.json for uibundle directories that contain a package.json.
 * These directories are under uiBundles/ (standalone templates) or _w_/ (placeholder
 * for uiBundles in project templates). The lock file ships with the template so that
 * `npm ci` works out of the box when users scaffold a new bundle.
 *
 * Runs in parallel — each call hits the npm registry for hundreds of transitive deps,
 * so wall-clock time is dominated by serial HTTP round-trips.
 */
async function generateUiBundleLockFiles(templatesDir) {
  const uiBundleDirs = findUiBundlePackageJsonDirs(templatesDir);
  const results = await Promise.allSettled(
    uiBundleDirs.map(async (dir) => {
      const rel = path.relative(currDir, dir);
      console.log(`Generating package-lock.json in ${rel}`);
      await execAsync('npm install --package-lock-only --ignore-scripts', {
        cwd: dir,
      });
      return rel;
    }),
  );
  const failures = results
    .map((r, i) => ({ r, dir: uiBundleDirs[i] }))
    .filter(({ r }) => r.status === 'rejected');
  if (failures.length > 0) {
    for (const { r, dir } of failures) {
      console.error(
        `Failed to generate package-lock.json in ${path.relative(
          currDir,
          dir,
        )}: ${r.reason.message}`,
      );
    }
    process.exit(1);
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
      (e) => e.isFile() && e.name === 'package.json',
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
        insideUiBundles || isUiBundleSegment,
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
  copyAllTemplates().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
