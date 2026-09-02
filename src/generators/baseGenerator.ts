/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as nodeFs from 'fs';
import * as path from 'path';
import { render } from 'ejs';
import { nls } from '../i18n';
import {
  DEFAULT_API_VERSION,
  dirnameTemplatesDefault,
} from '../utils/constants';
import {
  CreateOutput,
  GeneratorContext,
  TemplateOptions,
} from '../utils/types';

type Changes = {
  created: string[];
  conflicted: string[];
  identical: string[];
  forced: string[];
};

interface FsError extends Error {
  code: string;
}

export async function setCustomTemplatesRootPathOrGitRepo(
  pathOrRepoUri?: string,
  forceLoadingRemoteRepo = false,
  fs: typeof nodeFs = nodeFs
): Promise<string | undefined> {
  if (pathOrRepoUri === undefined) {
    return;
  }

  try {
    // if pathOrRepoUri is valid url, load the repo
    const url = new URL(pathOrRepoUri);
    if (process.env.ESBUILD_PLATFORM !== 'web' && url) {
      const { loadCustomTemplatesGitRepo } = await import(
        '../service/gitRepoUtils.js'
      );
      return await loadCustomTemplatesGitRepo(url, forceLoadingRemoteRepo, fs);
    }
  } catch (error) {
    const err = error as FsError;
    if (err.code !== 'ERR_INVALID_URL') {
      throw error;
    }

    const localTemplatesPath = pathOrRepoUri;
    if (fs.existsSync(localTemplatesPath)) {
      return localTemplatesPath;
    } else {
      throw new Error(
        nls.localize('localCustomTemplateDoNotExist', localTemplatesPath)
      );
    }
  }
}

/**
 * Look up package version of @salesforce/templates package to supply a default API version
 */
export function getDefaultApiVersion(): string {
  return DEFAULT_API_VERSION;
}

abstract class NotYeoman {
  public changes: Changes = {
    created: [],
    conflicted: [],
    identical: [],
    forced: [],
  };
  protected readonly _fs: typeof nodeFs;
  protected readonly _cwd: string;
  private _sourceRoot: string;
  private _destinationRoot: string;

  public constructor(context?: GeneratorContext, cwd?: string) {
    this._fs = context?.fs ?? nodeFs;
    this._cwd = cwd ?? process.cwd();
    const defaultTemplatesRoot =
      context?.templatesRootPath ?? dirnameTemplatesDefault;
    this._sourceRoot = this.sourceRoot(defaultTemplatesRoot);
    this._destinationRoot = this.destinationRoot(this._cwd);
  }

  public destinationPath(...dest: string[]): string {
    let filepath = path.join(...dest);

    if (!path.isAbsolute(filepath)) {
      filepath = path.join(this.destinationRoot(), filepath);
    }

    return filepath;
  }

  public destinationRoot(rootPath?: string) {
    if (typeof rootPath === 'string') {
      this._destinationRoot = path.resolve(rootPath);

      if (!this._fs.existsSync(this._destinationRoot)) {
        this._fs.mkdirSync(this._destinationRoot, { recursive: true });
      }
    }

    return this._destinationRoot || this._cwd;
  }

  public sourceRoot(rootPath?: string): string {
    if (rootPath) {
      this._sourceRoot = path.resolve(rootPath);
    }

    return this._sourceRoot;
  }

  public templatePath(...dest: string[]): string {
    let filepath = path.join(...dest);

    if (!path.isAbsolute(filepath)) {
      filepath = path.join(this.sourceRoot(), filepath);
    }

    return filepath;
  }

  public async render(
    source: string,
    destination: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    const template = await this._fs.promises.readFile(source, 'utf8');
    const rendered = render(template, data ?? {});

    if (rendered) {
      const relativePath = path.relative(this._cwd, destination);
      const existing = await this._fs.promises
        .readFile(destination, 'utf8')
        .catch(() => null);
      if (existing) {
        if (rendered.trim() === existing.trim()) {
          this.register('identical', relativePath);
          return;
        } else {
          this.register('conflicted', relativePath);
          this.register('forced', relativePath);
        }
      } else {
        this.register('created', relativePath);
      }

      const dir = path.dirname(destination);
      await this._fs.promises.mkdir(dir, { recursive: true });
      await this._fs.promises.writeFile(destination, rendered);
    }
  }

  private register(verb: keyof Changes, file: string): void {
    this.changes[verb].push(file);
  }
}

// Allowlist-based validator for custom EJS templates.
// Instead of trying to block dangerous patterns (infinite bypass surface),
// we only permit the narrow subset of JS that templates legitimately need.

const ALLOWED_EXPRESSION_CALL_TARGETS = new Set([
  'replace',
  'uuid',
  'join',
  'toString',
  'trim',
  'toLowerCase',
  'toUpperCase',
  'slice',
  'substring',
  'indexOf',
  'includes',
  'split',
  'concat',
  'startsWith',
  'endsWith',
  'padStart',
  'padEnd',
]);

const ALLOWED_SCRIPTLET_METHODS = new Set([
  'forEach',
  'map',
  'filter',
  'includes',
  'indexOf',
  'length',
  'push',
  'join',
  'some',
  'every',
  'find',
  'findIndex',
  'slice',
  'concat',
  'keys',
  'values',
  'entries',
]);

function extractEjsTags(template: string): { type: string; code: string }[] {
  const tags: { type: string; code: string }[] = [];
  let i = 0;
  while (i < template.length) {
    const start = template.indexOf('<%', i);
    if (start === -1) {
      break;
    }

    const afterOpen = start + 2;
    if (afterOpen >= template.length) {
      break;
    }

    const firstChar = template[afterOpen];
    if (firstChar === '#') {
      const end = template.indexOf('%>', afterOpen);
      i = end === -1 ? template.length : end + 2;
      continue;
    }

    let type: string;
    let codeStart: number;
    if (firstChar === '=' || firstChar === '-') {
      type = firstChar;
      codeStart = afterOpen + 1;
    } else {
      type = '%';
      codeStart = afterOpen;
    }

    let pos = codeStart;
    let code = '';
    let found = false;
    while (pos < template.length) {
      const ch = template[pos];
      if (ch === "'" || ch === '"' || ch === '`') {
        const quote = ch;
        pos++;
        while (pos < template.length && template[pos] !== quote) {
          if (template[pos] === '\\') {
            pos++;
          }
          pos++;
        }
        pos++;
      } else if (template[pos] === '%' && template[pos + 1] === '>') {
        code = template.slice(codeStart, pos);
        found = true;
        pos += 2;
        break;
      } else {
        pos++;
      }
    }

    if (!found) {
      code = template.slice(codeStart);
      pos = template.length;
    }

    tags.push({ type, code: code.trim() });
    i = pos;
  }
  return tags;
}

function isSafeBracketContent(inner: string): boolean {
  if (/^\d+$/.test(inner)) {
    return true;
  }
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(inner)) {
    return true;
  }
  const strLitMatch = inner.match(/^(['"])([a-zA-Z_$][\w.]*)\1$/);
  if (strLitMatch) {
    return true;
  }
  return false;
}

function containsDangerousBrackets(code: string): boolean {
  const bracketContent = /\[([^\]]*)\]/g;
  let m;
  while ((m = bracketContent.exec(code)) !== null) {
    if (!isSafeBracketContent(m[1].trim())) {
      return true;
    }
  }
  return false;
}

function isSimpleExpression(code: string): boolean {
  const blocked =
    /\b(function|class|new|delete|typeof|void|this|process|global|globalThis|require|import|module|eval|Function|constructor|__proto__|prototype|Reflect|Proxy|Object\s*\.\s*(?:create|assign|definePropert|getOwnPropertyNames|getPrototypeOf|setPrototypeOf)|Array\s*\.\s*from|String\s*\.\s*fromCharCode|Symbol|Buffer|setTimeout|setInterval|setImmediate|clearTimeout|clearInterval|queueMicrotask|Promise|async|await|yield|return|throw|try|catch|finally|while|for|do|switch|with)\b/;

  if (blocked.test(code)) {
    return false;
  }

  if (containsDangerousBrackets(code)) {
    return false;
  }

  if (/`[^`]*\$\{/.test(code)) {
    return false;
  }

  if (/(?<![=!<>])=(?!=)/.test(code)) {
    return false;
  }

  const callPattern = /\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  let m;
  while ((m = callPattern.exec(code)) !== null) {
    if (!ALLOWED_EXPRESSION_CALL_TARGETS.has(m[1])) {
      return false;
    }
  }

  const bareCalls = /(?<![.\w])([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  while ((m = bareCalls.exec(code)) !== null) {
    if (!ALLOWED_EXPRESSION_CALL_TARGETS.has(m[1])) {
      return false;
    }
  }

  return true;
}

function isAllowedScriptlet(code: string): boolean {
  const statements = code.split(/[;\n]/).map((s) => s.trim()).filter(Boolean);

  for (const stmt of statements) {
    if (!isAllowedStatement(stmt)) {
      return false;
    }
  }
  return true;
}

function isAllowedStatement(stmt: string): boolean {
  const hardBlocked =
    /\b(process|global|globalThis|require|import|module|eval|Function|Reflect|Proxy|Buffer|setTimeout|setInterval|setImmediate|clearTimeout|clearInterval|queueMicrotask|__dirname|__filename|constructor|__proto__|prototype|with|yield|async|await)\b/;
  if (hardBlocked.test(stmt)) {
    return false;
  }

  if (/`[^`]*\$\{/.test(stmt)) {
    return false;
  }

  if (containsDangerousBrackets(stmt)) {
    return false;
  }

  if (/^\}?\s*\)?\s*;?\s*\}?\s*;?$/.test(stmt)) {
    return true;
  }

  if (stmt === '{') {
    return true;
  }

  if (/^(?:else\s+)?if\s*\(/.test(stmt)) {
    return isSimpleCondition(stmt);
  }
  if (/^}\s*else\s*\{?$/.test(stmt) || stmt === 'else {' || stmt === 'else') {
    return true;
  }

  if (/^for\s*\(/.test(stmt)) {
    return isSimpleForLoop(stmt);
  }

  if (/^\w[\w.]*\s*\.\s*(forEach|map|filter|some|every|find|findIndex)\s*\(/.test(stmt)) {
    return isSimpleIterator(stmt);
  }

  if (/^(?:const|let|var)\s+/.test(stmt)) {
    return isSimpleDeclaration(stmt);
  }

  if (/^[a-zA-Z_$][\w.]*\s*\.\s*(push|pop|shift|unshift)\s*\(/.test(stmt)) {
    return isSimpleMethodCall(stmt);
  }

  return false;
}

function isSimpleCondition(stmt: string): boolean {
  const condMatch = stmt.match(/^(?:else\s+)?if\s*\(([\s\S]*)\)\s*\{?\s*$/);
  if (!condMatch) {
    return false;
  }
  const cond = condMatch[1];
  const hardBlocked =
    /\b(process|global|globalThis|require|import|module|eval|Function|Reflect|Proxy|constructor|__proto__)\b/;
  if (hardBlocked.test(cond)) {
    return false;
  }
  if (/`[^`]*\$\{/.test(cond)) {
    return false;
  }
  const callPattern = /\.([a-zA-Z_$]\w*)\s*\(/g;
  let m;
  while ((m = callPattern.exec(cond)) !== null) {
    if (!ALLOWED_SCRIPTLET_METHODS.has(m[1])) {
      return false;
    }
  }
  if (containsDangerousBrackets(cond)) {
    return false;
  }
  return true;
}

function isSimpleForLoop(stmt: string): boolean {
  if (/^for\s*\(\s*(?:const|let|var)\s+\[?\s*\w+(?:\s*,\s*\w+)*\s*\]?\s+(?:of|in)\s+/.test(stmt)) {
    const hardBlocked = /\b(process|global|globalThis|require|import|module|eval|Function|Reflect|Proxy|constructor|__proto__)\b/;
    return !hardBlocked.test(stmt);
  }
  return false;
}

function isSimpleIterator(stmt: string): boolean {
  const hardBlocked =
    /\b(process|global|globalThis|require|import|module|eval|Function|Reflect|Proxy|constructor|__proto__)\b/;
  if (hardBlocked.test(stmt)) {
    return false;
  }
  if (/`[^`]*\$\{/.test(stmt)) {
    return false;
  }
  if (containsDangerousBrackets(stmt)) {
    return false;
  }
  return true;
}

function isSimpleDeclaration(stmt: string): boolean {
  const hardBlocked =
    /\b(process|global|globalThis|require|import|module|eval|Function|Reflect|Proxy|constructor|__proto__|prototype)\b/;
  if (hardBlocked.test(stmt)) {
    return false;
  }
  if (/`[^`]*\$\{/.test(stmt)) {
    return false;
  }
  if (/\bfunction\b/.test(stmt)) {
    return false;
  }
  if (/=>\s*\{/.test(stmt)) {
    return false;
  }
  if (containsDangerousBrackets(stmt)) {
    return false;
  }
  return true;
}

function isSimpleMethodCall(stmt: string): boolean {
  const hardBlocked =
    /\b(process|global|globalThis|require|import|module|eval|Function|Reflect|Proxy|constructor|__proto__)\b/;
  if (hardBlocked.test(stmt)) {
    return false;
  }
  if (/`[^`]*\$\{/.test(stmt)) {
    return false;
  }
  if (containsDangerousBrackets(stmt)) {
    return false;
  }
  return true;
}

function normalizeCode(code: string): string {
  let result = code;
  // Strip JS comments that could hide content from analysis
  result = result.replace(/\/\*[\s\S]*?\*\//g, ' ');
  result = result.replace(/\/\/[^\n]*/g, ' ');
  // Resolve string concatenations: 'a' + 'b' -> 'ab'
  let prev = '';
  while (result !== prev) {
    prev = result;
    result = result.replace(/'([^'\\]*)'\s*\+\s*'([^'\\]*)'/g, "'$1$2'");
    result = result.replace(/"([^"\\]*)"\s*\+\s*"([^"\\]*)"/g, '"$1$2"');
    result = result.replace(/'([^'\\]*)'\s*\+\s*"([^"\\]*)"/g, "'$1$2'");
    result = result.replace(/"([^"\\]*)"\s*\+\s*'([^'\\]*)'/g, '"$1$2"');
  }
  // Normalize hex escapes in strings: '\x63' -> 'c'
  result = result.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  // Normalize unicode escapes: '\u0063' -> 'c'
  result = result.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  return result;
}

export function validateCustomTemplate(
  templateContent: string,
  templatePath: string
): void {
  const tags = extractEjsTags(templateContent);
  for (const tag of tags) {
    const code = normalizeCode(tag.code);
    if (tag.type === '=' || tag.type === '-') {
      if (!isSimpleExpression(code)) {
        throw new Error(
          `Custom template "${templatePath}" contains disallowed code in expression tag: ${tag.code.slice(0, 80)}`
        );
      }
    } else {
      if (!isAllowedScriptlet(code)) {
        throw new Error(
          `Custom template "${templatePath}" contains disallowed code in scriptlet tag: ${tag.code.slice(0, 80)}`
        );
      }
    }
  }
}

export abstract class BaseGenerator<
  TOptions extends TemplateOptions
> extends NotYeoman {
  /**
   * Set by sourceRootWithPartialPath called in generator
   */
  public builtInTemplatesRootPath?: string;
  protected outputdir: string;
  protected apiversion: string;
  private customTemplatesRootPath: string | undefined;
  protected readonly templatesRootPath: string | undefined;

  /**
   * The constructor for the SfGenerator.
   *
   * @param options SfGenerator specific options.
   * @param context optional generator context for fs and template path injection
   */
  constructor(
    public options: TOptions,
    context?: GeneratorContext,
    cwd?: string
  ) {
    super(context, cwd);
    this.templatesRootPath = context?.templatesRootPath;
    this.apiversion = options.apiversion ?? getDefaultApiVersion();
    this.outputdir = options.outputdir ?? this._cwd;
    this.validateOptions();
  }

  /**
   * Set source root to built-in templates or custom templates root if available.
   * @param partialPath the relative path from the templates folder to templates root folder.
   */
  public sourceRootWithPartialPath(partialPath: string): void {
    this.builtInTemplatesRootPath = path.join(
      this.templatesRootPath ?? dirnameTemplatesDefault ?? '',
      partialPath
    );
    // set generator source directory to custom templates root if available
    if (!this.customTemplatesRootPath) {
      this.sourceRoot(path.join(this.builtInTemplatesRootPath));
    } else {
      if (
        this._fs.existsSync(
          path.join(this.customTemplatesRootPath, partialPath)
        )
      ) {
        this.sourceRoot(path.join(this.customTemplatesRootPath, partialPath));
      }
    }
  }

  public templatePath(...paths: string[]): string {
    // The template paths are relative to the generator's source root
    // If we have set a custom template root, the source root should have already been set.
    // Otherwise we'll fallback to the built-in templates
    const customPath = super.templatePath(...paths);
    if (this._fs.existsSync(customPath)) {
      return customPath;
    } else {
      // files that are builtin and not in the custom template folder
      return super.templatePath(
        path.join(this.builtInTemplatesRootPath!, ...paths)
      );
    }
  }

  public async render(
    source: string,
    destination: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    const isBuiltIn = this.builtInTemplatesRootPath && source.startsWith(this.builtInTemplatesRootPath);
    if (!isBuiltIn) {
      const template = await this._fs.promises.readFile(source, 'utf8');
      validateCustomTemplate(template, source);
      const rendered = render(template, data ?? {});
      if (rendered) {
        const relativePath = path.relative(this._cwd, destination);
        const existing = await this._fs.promises
          .readFile(destination, 'utf8')
          .catch(() => null);
        if (existing) {
          if (rendered.trim() === existing.trim()) {
            this.changes.identical.push(relativePath);
            return;
          } else {
            this.changes.conflicted.push(relativePath);
            this.changes.forced.push(relativePath);
          }
        } else {
          this.changes.created.push(relativePath);
        }
        const dir = path.dirname(destination);
        await this._fs.promises.mkdir(dir, { recursive: true });
        await this._fs.promises.writeFile(destination, rendered);
      }
      return;
    }
    return super.render(source, destination, data);
  }

  public async run(opts?: {
    cwd?: string;
    customTemplatesRootPathOrGitRepo?: string;
    sourceRootPartial?: string;
  }): Promise<CreateOutput> {
    const cwd = opts?.cwd ?? this._cwd;
    this.customTemplatesRootPath = await setCustomTemplatesRootPathOrGitRepo(
      opts?.customTemplatesRootPathOrGitRepo,
      false,
      this._fs
    );

    await this.generate();

    const created = [...this.changes.created, ...this.changes.forced];
    const outputDir = path.resolve(cwd, this.outputdir);
    const rawOutput = nls.localize('RawOutput', [
      outputDir,
      [
        ...(this.changes.created ?? []).map((file) => `  create ${file}`),
        ...(this.changes.identical ?? []).map((file) => `  identical ${file}`),
        ...(this.changes.conflicted ?? []).map((file) => `  conflict ${file}`),
        ...(this.changes.forced ?? []).map((file) => `  force ${file}`),
      ].join('\n') + '\n',
    ]);

    return {
      outputDir,
      created,
      rawOutput,
    };
  }

  /**
   * Validate provided options
   */
  public abstract validateOptions(): void;
  /**
   * Generate the files
   */
  public abstract generate(): Promise<void>;
}
