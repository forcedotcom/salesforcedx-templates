/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'path';

import templatePlaceholdersSpec from './template-placeholders';

/**
 * Trim trailing whitespace from a filename segment and warn when it differs.
 * Upstream packages occasionally ship files whose names end with a space
 * (e.g. "lds-guide-graphql.md "), which produces invalid OPC Part URIs
 * when vsce builds the .vsix.
 */
function sanitizeSegment(name: string): string {
  const trimmed = name.trimEnd();
  if (trimmed !== name) {
    console.warn(
      `[webappTemplateUtils] Sanitised filename: "${name}" → "${trimmed}"`
    );
  }
  return trimmed;
}

/**
 * Recursively copy a directory tree from src to dest, trimming trailing
 * whitespace from every path segment so that upstream filenames with stray
 * spaces never leak into the output.
 *
 * This is a drop-in replacement for `fs.cpSync(src, dest, { recursive: true })`
 * that is resilient to the "trailing-space filename" issue seen in
 * `@salesforce/templates`.
 */
export function copyTreeSanitized(src: string, dest: string): void {
  const stat = fs.statSync(src);
  if (stat.isFile()) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    return;
  }
  if (!stat.isDirectory()) {
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const sanitized = sanitizeSegment(entry.name);
    const srcChild = path.join(src, entry.name);
    const destChild = path.join(dest, sanitized);
    if (entry.isDirectory()) {
      copyTreeSanitized(srcChild, destChild);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcChild, destChild);
    }
  }
}

/** File extensions that should be processed as EJS templates */
export const EJS_EXTENSIONS = new Set([
  '.json',
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.md',
  '.txt',
  '.xml',
  '.html',
  '.yml',
  '.yaml',
  '.env',
  '.cfg',
  '.config.js',
  '.config.ts',
]);

/** Templates that have a full folder under src/templates/project/ (populated at build time from npm) */
export const BUILT_IN_FULL_TEMPLATES = new Set([
  'reactinternalapp',
  'reactexternalapp',
]);

/**
 * Default app/site names embedded in each full template; all are renamed to the project name.
 * Order matters: replace longer (suffix) first to avoid partial replacements.
 */
export const FULL_TEMPLATE_DEFAULT_NAMES: Record<
  string,
  { base: string; withSuffix: string }
> = {
  reactinternalapp: {
    base: 'appreacttemplateb2e',
    withSuffix: 'appreacttemplateb2e1',
  },
  reactexternalapp: {
    base: 'appreacttemplateb2x',
    withSuffix: 'appreacttemplateb2x1',
  },
};

/** Directories to skip when walking a full template dir (e.g. node_modules) */
export const FULL_TEMPLATE_SKIP_DIRS = new Set(['node_modules', '.git']);

/**
 * Max path length for package paths allowed by `sf pack:verify` on Windows.
 * Matches the "supported allowable path length" from ensureWindowsPathLengths in
 * salesforcecli/cli (plugin-release-management): 259 - supportedBaseWindowsPath.length
 * with --windows-username-buffer 34 (e.g. supported username length 34 → base path 102 → 157).
 * Paths with length >= this value fail pack:verify.
 */
export const WINDOWS_MAX_ALLOWABLE_PATH_LENGTH = 157;

/**
 * Path segment placeholders used in template dirs; replaced only during project generation.
 * Short names keep lib/templates paths short.
 */
export const PACKAGE_DIR_PLACEHOLDER = '_p_';
/** Replaced with defaultpackagedir (e.g. force-app). */
export const MAIN_DEFAULT_PLACEHOLDER = '_m_';
/** Replaced with literal "main/default". */
export const WEBAPPLICATIONS_PLACEHOLDER = '_w_';
/** Replaced with literal "webapplications". */
export const APP_PLACEHOLDER = '_a_';
/** Replaced with project name (alphanumeric) for the web app folder. */
export const DIGITAL_EXPERIENCES_PLACEHOLDER = '_d_';
/** Replaced with literal "digitalExperiences". */
export const SITE_PLACEHOLDER = '_s_';
/** Replaced with literal "site". */
export const APP_SUFFIX_PLACEHOLDER = '_a1_';
/** Replaced with project name + "1" (e.g. digital experience site folder). */
export const A4DRULES_PLACEHOLDER = '_r_';
/** Replaced with literal ".a4drules". */
export const A4D_SKILL_AGENTFORCE_PLACEHOLDER = '_k_';
/** Replaced with literal "feature-react-agentforce-conversation-client-embedded-agent". */
/** Replaced with literal "features" (under app src; short for Windows path length). */
export const FEATURES_PLACEHOLDER = '_f_';
/** Replaced with literal "object-search". */
export const OBJECT_SEARCH_PLACEHOLDER = '_os_';
/** Replaced with literal "__examples__". */
export const EXAMPLES_PLACEHOLDER = '_ex_';
/** Replaced with literal "global-search". */
export const GLOBAL_SEARCH_PLACEHOLDER = '_gs_';
/** Replaced with literal "components". */
export const COMPONENTS_PLACEHOLDER = '_c_';
/** Replaced with literal "detail". */
export const DETAIL_PLACEHOLDER = '_det_';
/** Replaced with literal "formatted". */
export const FORMATTED_PLACEHOLDER = '_fmt_';

/** All placeholder keys; used by tests to assert sync with copy-templates.js */
export const PLACEHOLDER_KEYS = [
  'PACKAGE_DIR_PLACEHOLDER',
  'MAIN_DEFAULT_PLACEHOLDER',
  'WEBAPPLICATIONS_PLACEHOLDER',
  'APP_PLACEHOLDER',
  'DIGITAL_EXPERIENCES_PLACEHOLDER',
  'SITE_PLACEHOLDER',
  'APP_SUFFIX_PLACEHOLDER',
  'A4DRULES_PLACEHOLDER',
  'A4D_SKILL_AGENTFORCE_PLACEHOLDER',
  'FEATURES_PLACEHOLDER',
  'OBJECT_SEARCH_PLACEHOLDER',
  'EXAMPLES_PLACEHOLDER',
  'GLOBAL_SEARCH_PLACEHOLDER',
  'COMPONENTS_PLACEHOLDER',
  'DETAIL_PLACEHOLDER',
  'FORMATTED_PLACEHOLDER',
] as const;

type PlaceholderReplacementCtx = {
  defaultpackagedir: string;
  projectnameAlphanumeric: string;
};

type TemplatePlaceholderEntry = {
  key?: string;
  placeholder: string;
  dirInNpm: string;
  parent: string;
  toPath?: string;
  removeEmptySibling?: string;
  /** Literal string or key: defaultpackagedir | projectname | projectname1 */
  replacement: string;
};

const TEMPLATE_PLACEHOLDERS_SPEC =
  templatePlaceholdersSpec as TemplatePlaceholderEntry[];

function resolveReplacement(
  replacement: string,
  ctx: PlaceholderReplacementCtx
): string {
  switch (replacement) {
    case 'defaultpackagedir':
      return ctx.defaultpackagedir;
    case 'projectname':
      return ctx.projectnameAlphanumeric;
    case 'projectname1':
      return ctx.projectnameAlphanumeric + '1';
    default:
      return replacement;
  }
}

/**
 * Returns a string containing only alphanumeric characters [A-Za-z0-9].
 * Used for folder and file names under webapplications, which must be alphanumeric.
 */
export function toAlphanumericForPath(name: string): string {
  return name.replace(/[^A-Za-z0-9]/g, '');
}

/**
 * For sfdc_cms__site content.json files, the urlName must be lowercase.
 * Name replacements preserve casing from the project name, so we need to
 * post-process the JSON to enforce this constraint.
 */
export function ensureLowercaseUrlName(
  content: string,
  destPath: string
): string {
  if (
    path.basename(destPath) !== 'content.json' ||
    !destPath.includes(`sfdc_cms__site${path.sep}`)
  ) {
    return content;
  }
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed.urlName === 'string') {
      const lower = parsed.urlName.toLowerCase();
      if (lower !== parsed.urlName) {
        parsed.urlName = lower;
        return JSON.stringify(parsed, null, 2) + '\n';
      }
    }
  } catch {
    // not valid JSON, return as-is
  }
  return content;
}

/** Heuristic: treat as text if no null byte in the first chunk and decodable as UTF-8 */
export function isLikelyText(filename: string, buffer: Buffer): boolean {
  const ext = path.extname(filename).toLowerCase();
  const binaryExts = new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.ico',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.pdf',
    '.zip',
  ]);
  if (binaryExts.has(ext)) {
    return false;
  }
  const chunk = buffer.slice(0, 1024);
  if (chunk.includes(0)) {
    return false;
  }
  try {
    chunk.toString('utf8');
    return true;
  } catch {
    return false;
  }
}

/** Renders an EJS template file with the given data (stateless, no generator dependency). */
export async function renderEjsFile(
  sourcePath: string,
  data: Record<string, unknown>
): Promise<string> {
  const { renderFile } = await import('ejs');
  return new Promise((resolve, reject) => {
    renderFile(sourcePath, data, (err, str) => {
      if (err) {
        reject(err);
      } else {
        resolve(str ?? '');
      }
    });
  });
}

export type GenerateBuiltInFullTemplateOptions = {
  templateDir: string;
  projectDir: string;
  defaultpackagedir: string;
  ns: string;
  loginurl: string;
  apiversion: string;
  /** Renders an EJS template file; use renderEjsFile from this module */
  renderEjs: (
    filePath: string,
    data: Record<string, unknown>
  ) => Promise<string>;
  /** Called for each file created (e.g. to push to generator changes) */
  onFileCreated: (destPath: string) => void;
};

/**
 * Generate project files from a built-in full template (e.g. reactinternalapp, reactexternalapp).
 * Builds template vars and name replacements and delegates to generateFromProjectTemplateDir.
 */
export async function generateBuiltInFullTemplate(
  template: string,
  projectname: string,
  options: GenerateBuiltInFullTemplateOptions
): Promise<void> {
  const {
    templateDir,
    projectDir,
    defaultpackagedir,
    ns,
    loginurl,
    apiversion,
    renderEjs,
    onFileCreated,
  } = options;

  const templateVars = {
    projectname,
    defaultpackagedir,
    namespace: ns,
    ns,
    loginurl,
    apiversion,
    name: projectname,
    company: (process.env.USER || 'Demo') + ' company',
  };

  const nameReplacementsEntry = FULL_TEMPLATE_DEFAULT_NAMES[template];
  const projectnameAlphanumeric = toAlphanumericForPath(projectname);
  const replacementCtx: PlaceholderReplacementCtx = {
    defaultpackagedir,
    projectnameAlphanumeric,
  };
  const nameReplacements: [string, string][] = TEMPLATE_PLACEHOLDERS_SPEC.map(
    (entry) => [
      entry.placeholder,
      resolveReplacement(entry.replacement, replacementCtx),
    ]
  );
  nameReplacements.push(
    [APP_PLACEHOLDER, projectnameAlphanumeric],
    [APP_SUFFIX_PLACEHOLDER, projectnameAlphanumeric + '1']
  );
  if (nameReplacementsEntry) {
    nameReplacements.push(
      [nameReplacementsEntry.withSuffix, projectnameAlphanumeric + '1'],
      [nameReplacementsEntry.base, projectnameAlphanumeric]
    );
  }

  await generateFromProjectTemplateDir(templateDir, projectDir, templateVars, {
    nameReplacements,
    renderEjs,
    onFileCreated,
  });
}

export type GenerateFromProjectTemplateDirOptions = {
  /** Pairs of [from, to] for renaming template default app/site names to project name */
  nameReplacements?: [string, string][];
  /** Renders an EJS template file with the given data; used for template files */
  renderEjs: (
    filePath: string,
    data: Record<string, unknown>
  ) => Promise<string>;
  /** Called for each file/dir created under destDir (for change tracking) */
  onFileCreated: (destPath: string) => void;
};

/**
 * Recursively walk a full project template directory (e.g. reactinternalapp, reactexternalapp),
 * rendering EJS for text files and copying the rest. Renames template default app/site
 * names (e.g. reactinternalapp) to the project name in paths and file contents.
 */
export async function generateFromProjectTemplateDir(
  sourceDir: string,
  destDir: string,
  templateVars: Record<string, unknown>,
  options: GenerateFromProjectTemplateDirOptions
): Promise<void> {
  const { nameReplacements, renderEjs, onFileCreated } = options;

  if (!fs.existsSync(sourceDir)) {
    return;
  }

  const applyReplacements = (s: string): string => {
    if (!nameReplacements) {
      return s;
    }
    let out = s;
    for (const [from, to] of nameReplacements) {
      out = out.split(from).join(to);
    }
    return out;
  };

  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const rawName = entry.name;
    const safeName = sanitizeSegment(rawName);
    const sourcePath = path.join(sourceDir, rawName);

    if (entry.isDirectory()) {
      if (FULL_TEMPLATE_SKIP_DIRS.has(safeName)) {
        continue;
      }
      const destName = applyReplacements(safeName);
      const destPath = path.join(destDir, destName);
      await mkdir(destPath, { recursive: true });
      await generateFromProjectTemplateDir(
        sourcePath,
        destPath,
        templateVars,
        options
      );
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const destName = applyReplacements(safeName);
    const destPath = path.join(destDir, destName);
    const ext = path.extname(safeName);
    const isEjsTemplate =
      EJS_EXTENSIONS.has(ext) ||
      safeName.endsWith('.config.js') ||
      safeName.endsWith('.config.ts');

    if (isEjsTemplate) {
      try {
        const rendered = await renderEjs(sourcePath, templateVars);
        const content = ensureLowercaseUrlName(
          applyReplacements(rendered),
          destPath
        );
        await mkdir(path.dirname(destPath), { recursive: true });
        await writeFile(destPath, content, 'utf8');
        onFileCreated(destPath);
      } catch {
        const raw = await readFile(sourcePath);
        const str = raw.toString('utf8');
        const content = ensureLowercaseUrlName(
          applyReplacements(str),
          destPath
        );
        await mkdir(path.dirname(destPath), { recursive: true });
        await writeFile(destPath, content, 'utf8');
        onFileCreated(destPath);
      }
    } else {
      await mkdir(path.dirname(destPath), { recursive: true });
      const content = await readFile(sourcePath);
      const isText = isLikelyText(entry.name, content);
      if (isText && nameReplacements?.length) {
        const str = content.toString('utf8');
        const replaced = ensureLowercaseUrlName(
          applyReplacements(str),
          destPath
        );
        await writeFile(destPath, replaced, 'utf8');
      } else {
        await writeFile(destPath, new Uint8Array(content));
      }
      onFileCreated(destPath);
    }
  }
}
