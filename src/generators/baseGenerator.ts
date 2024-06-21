/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import * as path from 'path';
import { CreateOutput, TemplateOptions } from '../utils/types';
import { renderFile } from 'ejs';
import { nls } from '../i18n';
import { loadCustomTemplatesGitRepo } from '../service/gitRepoUtils';

async function outputFile(file: string, data: string): Promise<void> {
  const dir = path.dirname(file);

  await mkdir(dir, { recursive: true });

  return writeFile(file, data);
}

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
  forceLoadingRemoteRepo = false
): Promise<string | undefined> {
  if (pathOrRepoUri === undefined) {
    return;
  }

  try {
    // if pathOrRepoUri is valid url, load the repo
    const url = new URL(pathOrRepoUri);
    if (url) {
      return await loadCustomTemplatesGitRepo(url, forceLoadingRemoteRepo);
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
  const packageJsonPath = path.join('..', '..', 'package.json');
  const versionTrimmed = require(packageJsonPath).salesforceApiVersion.trim();
  return `${versionTrimmed.split('.')[0]}.0`;
}

abstract class NotYeoman {
  public changes: Changes = {
    created: [],
    conflicted: [],
    identical: [],
    forced: [],
  };
  private _sourceRoot: string;
  private _destinationRoot: string;

  public constructor() {
    this._sourceRoot = this.sourceRoot(path.join(__dirname, '..', 'templates'));
    this._destinationRoot = this.destinationRoot(process.cwd());
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

      if (!fs.existsSync(this._destinationRoot)) {
        fs.mkdirSync(this._destinationRoot, { recursive: true });
      }
    }

    return this._destinationRoot || process.cwd();
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
    const rendered = await new Promise<string>((resolve, reject) => {
      renderFile(source, data ?? {}, (err, str) => {
        if (err) {
          reject(err);
        }
        return resolve(str);
      });
    });

    if (rendered) {
      const relativePath = path.relative(process.cwd(), destination);
      const existing = await readFile(destination, 'utf8').catch(() => null);
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

      await outputFile(destination, rendered);
    }
  }

  private register(verb: keyof Changes, file: string): void {
    this.changes[verb].push(file);
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

  /**
   * The constructor for the SfGenerator.
   *
   * @param options SfGenerator specific options.
   */
  constructor(public options: TOptions) {
    super();
    this.apiversion = options.apiversion ?? getDefaultApiVersion();
    this.outputdir = options.outputdir ?? process.cwd();
    this.validateOptions();
  }

  /**
   * Set source root to built-in templates or custom templates root if available.
   * @param partialPath the relative path from the templates folder to templates root folder.
   */
  public sourceRootWithPartialPath(partialPath: string): void {
    this.builtInTemplatesRootPath = path.join(
      __dirname,
      '..',
      'templates',
      partialPath
    );
    // set generator source directory to custom templates root if available
    if (!this.customTemplatesRootPath) {
      this.sourceRoot(path.join(this.builtInTemplatesRootPath));
    } else {
      if (fs.existsSync(path.join(this.customTemplatesRootPath, partialPath))) {
        this.sourceRoot(path.join(this.customTemplatesRootPath, partialPath));
      }
    }
  }

  public templatePath(...paths: string[]): string {
    // The template paths are relative to the generator's source root
    // If we have set a custom template root, the source root should have already been set.
    // Otherwise we'll fallback to the built-in templates
    const customPath = super.templatePath(...paths);
    if (fs.existsSync(customPath)) {
      return customPath;
    } else {
      // files that are builtin and not in the custom template folder
      return super.templatePath(
        path.join(this.builtInTemplatesRootPath!, ...paths)
      );
    }
  }

  public async run(opts?: {
    cwd?: string;
    customTemplatesRootPathOrGitRepo?: string;
    sourceRootPartial?: string;
  }): Promise<CreateOutput> {
    const cwd = opts?.cwd ?? process.cwd();
    this.customTemplatesRootPath = await setCustomTemplatesRootPathOrGitRepo(
      opts?.customTemplatesRootPathOrGitRepo
    );

    await this.generate();

    const created = [
      ...this.changes.created,
      ...this.changes.identical,
      ...this.changes.forced,
    ];
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
