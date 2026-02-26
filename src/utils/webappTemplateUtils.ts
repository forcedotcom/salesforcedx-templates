/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'path';

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
export const BUILT_IN_FULL_TEMPLATES = new Set(['reactb2e', 'reactb2x']);

/**
 * Default app/site names embedded in each full template; all are renamed to the project name.
 * Order matters: replace longer (suffix) first to avoid partial replacements.
 */
export const FULL_TEMPLATE_DEFAULT_NAMES: Record<
  string,
  { base: string; withSuffix: string }
> = {
  reactb2e: {
    base: 'appreacttemplateb2e',
    withSuffix: 'appreacttemplateb2e1',
  },
  reactb2x: {
    base: 'appreacttemplateb2x',
    withSuffix: 'appreacttemplateb2x1',
  },
};

/** Directories to skip when walking a full template dir (e.g. node_modules) */
export const FULL_TEMPLATE_SKIP_DIRS = new Set(['node_modules', '.git']);

/**
 * Returns a string containing only alphanumeric characters [A-Za-z0-9].
 * Used for folder and file names under webapplications, which must be alphanumeric.
 */
export function toAlphanumericForPath(name: string): string {
  return name.replace(/[^A-Za-z0-9]/g, '');
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
 * Generate project files from a built-in full template (e.g. reactb2e, reactb2x).
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
  const nameReplacements = nameReplacementsEntry
    ? ([
        [nameReplacementsEntry.withSuffix, projectnameAlphanumeric + '1'],
        [nameReplacementsEntry.base, projectnameAlphanumeric],
      ] as [string, string][])
    : undefined;

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
 * Recursively walk a full project template directory (e.g. reactb2e, reactb2x),
 * rendering EJS for text files and copying the rest. Renames template default app/site
 * names (e.g. appreacttemplateb2e) to the project name in paths and file contents.
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
    const sourcePath = path.join(sourceDir, entry.name);

    if (entry.isDirectory()) {
      if (FULL_TEMPLATE_SKIP_DIRS.has(entry.name)) {
        continue;
      }
      const destName = applyReplacements(entry.name);
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

    const destName = applyReplacements(entry.name);
    const destPath = path.join(destDir, destName);
    const ext = path.extname(entry.name);
    const isEjsTemplate =
      EJS_EXTENSIONS.has(ext) ||
      entry.name.endsWith('.config.js') ||
      entry.name.endsWith('.config.ts');

    if (isEjsTemplate) {
      try {
        const rendered = await renderEjs(sourcePath, templateVars);
        const content = applyReplacements(rendered);
        await mkdir(path.dirname(destPath), { recursive: true });
        await writeFile(destPath, content, 'utf8');
        onFileCreated(destPath);
      } catch {
        const raw = await readFile(sourcePath);
        const str = raw.toString('utf8');
        const content = applyReplacements(str);
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
        const replaced = applyReplacements(str);
        await writeFile(destPath, replaced, 'utf8');
      } else {
        await writeFile(destPath, new Uint8Array(content));
      }
      onFileCreated(destPath);
    }
  }
}
