#!/usr/bin/env node
/*
 * Copies npm-based templates into src/templates/ (webapplication and project).
 * Run as part of build: yarn build:copy-templates
 */
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

/** Must match placeholders in src/utils/webappTemplateUtils.ts */
const PACKAGE_DIR_PLACEHOLDER = '_p_';
const MAIN_DEFAULT_PLACEHOLDER = '_m_';
const WEBAPPLICATIONS_PLACEHOLDER = '_w_';
const APP_PLACEHOLDER = '_a_';
const DIGITAL_EXPERIENCES_PLACEHOLDER = '_d_';
const SITE_PLACEHOLDER = '_s_';
const APP_SUFFIX_PLACEHOLDER = '_a1_';
const A4DRULES_PLACEHOLDER = '_r_';
const A4D_SKILL_AGENTFORCE_PLACEHOLDER = '_k_';
const PACKAGE_DIR_IN_NPM = 'force-app';
const MAIN_DEFAULT_IN_NPM = 'main';
const DEFAULT_IN_NPM = 'default';
const WEBAPPLICATIONS_IN_NPM = 'webapplications';
const DIGITAL_EXPERIENCES_IN_NPM = 'digitalExperiences';
const SITE_IN_NPM = 'site';
const A4DRULES_IN_NPM = '.a4drules';
const A4D_SKILL_AGENTFORCE_IN_NPM =
  'feature-react-agentforce-conversation-client-embedded-agent';

/**
 * Renames a directory to a placeholder name if it exists. Keeps template paths short for Windows.
 * @returns {string|undefined} The placeholder path if renamed, otherwise undefined.
 */
function renameDirToPlaceholder(parentDir, dirName, placeholder) {
  const fullPath = path.join(parentDir, dirName);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    const placeholderPath = path.join(parentDir, placeholder);
    fs.renameSync(fullPath, placeholderPath);
    return placeholderPath;
  }
  return undefined;
}

/**
 * Rename steps for project templates: (parent key, from dir, to placeholder).
 * Order matters: parent must refer to a placeholder already produced. Use 'dest' for destDir.
 * Optional steps use getFrom(config) and are skipped when getFrom returns null.
 */
const PROJECT_RENAME_SPEC = [
  { parent: 'dest', from: PACKAGE_DIR_IN_NPM, to: PACKAGE_DIR_PLACEHOLDER },
  {
    parent: PACKAGE_DIR_PLACEHOLDER,
    from: path.join(MAIN_DEFAULT_IN_NPM, DEFAULT_IN_NPM),
    to: MAIN_DEFAULT_PLACEHOLDER,
    removeEmptySibling: MAIN_DEFAULT_IN_NPM,
  },
  {
    parent: MAIN_DEFAULT_PLACEHOLDER,
    from: WEBAPPLICATIONS_IN_NPM,
    to: WEBAPPLICATIONS_PLACEHOLDER,
  },
  {
    parent: MAIN_DEFAULT_PLACEHOLDER,
    from: DIGITAL_EXPERIENCES_IN_NPM,
    to: DIGITAL_EXPERIENCES_PLACEHOLDER,
  },
  {
    parent: DIGITAL_EXPERIENCES_PLACEHOLDER,
    from: SITE_IN_NPM,
    to: SITE_PLACEHOLDER,
  },
  { parent: 'dest', from: A4DRULES_IN_NPM, to: A4DRULES_PLACEHOLDER },
  {
    parent: A4DRULES_PLACEHOLDER,
    from: path.join('skills', A4D_SKILL_AGENTFORCE_IN_NPM),
    to: path.join('skills', A4D_SKILL_AGENTFORCE_PLACEHOLDER),
  },
];

/** Optional renames keyed by parent placeholder; from dir comes from config. */
const PROJECT_OPTIONAL_RENAMES = [
  {
    parent: WEBAPPLICATIONS_PLACEHOLDER,
    getFrom: (config) => config.appFolderInNpm ?? null,
    to: APP_PLACEHOLDER,
  },
  {
    parent: SITE_PLACEHOLDER,
    getFrom: (config) => config.appSiteFolderInNpm ?? null,
    to: APP_SUFFIX_PLACEHOLDER,
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
  },
  // Project templates (reactb2e, reactb2x)
  {
    packageName:
      '@salesforce/webapp-template-app-react-template-b2e-experimental',
    getSourceDir: (packageDir) => path.join(packageDir, 'dist'),
    destSubpath: 'project/reactb2e',
    appFolderInNpm: 'appreacttemplateb2e',
    appSiteFolderInNpm: 'appreacttemplateb2e1',
  },
  {
    packageName:
      '@salesforce/webapp-template-app-react-template-b2x-experimental',
    getSourceDir: (packageDir) => path.join(packageDir, 'dist'),
    destSubpath: 'project/reactb2x',
    appFolderInNpm: 'appreacttemplateb2x',
    appSiteFolderInNpm: 'appreacttemplateb2x1',
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

    // Shorten paths in project templates so they stay under Windows max path length (pack:verify).
    // Placeholders are replaced at project generation time in webappTemplateUtils.
    if (config.destSubpath.startsWith('project/')) {
      const paths = { dest: destDir };

      for (const step of PROJECT_RENAME_SPEC) {
        const parentPath = paths[step.parent];
        if (!parentPath) continue;
        const newPath = renameDirToPlaceholder(parentPath, step.from, step.to);
        if (newPath) {
          if (!step.to.includes(path.sep)) {
            paths[step.to] = newPath;
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
          renameDirToPlaceholder(parentPath, fromDir, step.to);
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
  console.log('Templates copied successfully.');
}

/** Placeholder constants; must stay in sync with src/utils/webappTemplateUtils.ts */
const PLACEHOLDERS = {
  PACKAGE_DIR_PLACEHOLDER,
  MAIN_DEFAULT_PLACEHOLDER,
  WEBAPPLICATIONS_PLACEHOLDER,
  APP_PLACEHOLDER,
  DIGITAL_EXPERIENCES_PLACEHOLDER,
  SITE_PLACEHOLDER,
  APP_SUFFIX_PLACEHOLDER,
  A4DRULES_PLACEHOLDER,
  A4D_SKILL_AGENTFORCE_PLACEHOLDER,
};

module.exports = { copyAllTemplates, PLACEHOLDERS };

if (require.main === module) {
  copyAllTemplates();
}
