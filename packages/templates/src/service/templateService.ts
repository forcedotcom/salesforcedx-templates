/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Global } from '@salesforce/core';
import * as crypto from 'crypto';
import * as fs from 'fs';
import got from 'got';
import * as path from 'path';
import { Stream } from 'stream';
import * as tar from 'tar';
import { promisify } from 'util';
import * as yeoman from 'yeoman-environment';

import { nls } from '../i18n';
import { ForceGeneratorAdapter } from '../utils';
import { CreateOutput, TemplateOptions, TemplateType } from '../utils/types';

/**
 * Template Service
 */
export class TemplateService {
  private static instance: TemplateService;
  private adapter: ForceGeneratorAdapter;
  private env: yeoman;
  constructor(cwd: string = process.cwd()) {
    this.adapter = new ForceGeneratorAdapter();
    // @ts-ignore the adaptor doesn't fully implement yeoman's adaptor yet
    this.env = yeoman.createEnv(undefined, { cwd }, this.adapter);
  }

  /**
   * Get an instance of TemplateService
   * @param cwd cwd of current yeoman environment. CLI: don't need to set explicitly. VS Code: it's typically the root workspace path
   */
  public static getInstance(cwd?: string) {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService(cwd);
    } else if (cwd) {
      TemplateService.instance.cwd = cwd;
    }
    return TemplateService.instance;
  }

  /**
   * Getting cwd of current yeoman environment
   */
  public get cwd() {
    return this.env.cwd;
  }

  /**
   * Setting cwd of current yeoman environment
   * In VS Code, it's typically the root workspace path
   */
  public set cwd(cwd: string) {
    this.env.cwd = cwd;
  }

  /**
   * Look up package version of @salesforce/templates package to supply a default API version
   */
  public static getDefaultApiVersion(): string {
    const packageJsonPath = path.join('..', '..', 'package.json');
    const versionTrimmed = require(packageJsonPath).version.trim();
    return `${versionTrimmed.split('.')[0]}.0`;
  }

  /**
   * Create using templates
   * @param templateType template type
   * @param templateOptions template options
   * @param customTemplatesRootPathOrGitRepo custom templates root path or git repo. If not specified, use built-in templates
   */
  public async create<TOptions extends TemplateOptions>(
    templateType: TemplateType,
    templateOptions: TOptions,
    customTemplatesRootPathOrGitRepo?: string
  ): Promise<CreateOutput> {
    if (customTemplatesRootPathOrGitRepo) {
      await this.setCustomTemplatesRootPathOrGitRepo(
        customTemplatesRootPathOrGitRepo
      );
      // In VS Code, if creating using a custom template, we need to reset the yeoman environment
      this.resetEnv();
    }

    const generatorClass =
      TemplateType[templateType]
        .toString()
        .charAt(0)
        .toLowerCase() +
      TemplateType[templateType].toString().slice(1) +
      'Generator';
    const generatorNamespace = `@salesforce/${generatorClass}`;
    let generator = this.env.get(generatorNamespace);
    if (!generator) {
      generator = (await import(`../generators/${generatorClass}`)).default;
      const generatorPackagePath = path.join(__dirname, '..', '..');
      this.env.registerStub(
        generator!,
        generatorNamespace,
        generatorPackagePath
      );
    }

    this.adapter.log.clear();

    return new Promise((resolve, reject) => {
      this.env.run(generatorNamespace, templateOptions, err => {
        if (err) {
          reject(err);
        }
        const outputDir = path.resolve(this.cwd, templateOptions.outputdir!);
        const created = this.adapter.log.getCleanOutput();
        const rawOutput = nls.localize('RawOutput', [
          outputDir,
          this.adapter.log.getOutput()
        ]);
        const result = {
          outputDir,
          created,
          rawOutput
        };
        resolve(result);
      });
    });
  }

  // TODO: extract this to a different file
  /**
   * Local custom templates path set by user
   * or set to a local cache of a git repo.
   * Used by the generators.
   */
  public customTemplatesRootPath?: string;
  private resetEnv() {
    const cwd = this.env.cwd;
    // @ts-ignore
    this.env = yeoman.createEnv(undefined, { cwd }, this.adapter);
  }
  private loadedCustomTemplatesGitRepos = new Map<string, boolean>();

  /**
   * Set custom templates root path or git repo.
   * Throws an error if local path doesn't exist or cannot reach git repo.
   * @param customTemplatesRootPathOrGitRepo custom templates root path or git repo
   */
  public async setCustomTemplatesRootPathOrGitRepo(
    pathOrRepoUri: string,
    forceLoadingRemoteRepo: boolean = false
  ) {
    try {
      // if pathOrRepoUri is valid url, load the repo
      const url = new URL(pathOrRepoUri);
      if (url) {
        await this.loadCustomTemplatesGitRepo(url, forceLoadingRemoteRepo);
      }
    } catch (error) {
      const localTemplatesPath = pathOrRepoUri;
      if (fs.existsSync(localTemplatesPath)) {
        this.customTemplatesRootPath = localTemplatesPath;
      } else {
        // TODO: localize error
        throw new Error(
          `Local custom templates ${localTemplatesPath} does not exist`
        );
      }
    }
  }

  /**
   * Load custom templates Git repo. Currently only supports GitHub.
   * @param repoUri repo uri
   */
  public async loadCustomTemplatesGitRepo(
    repoUri: URL,
    forceLoadingRemoteRepo: boolean = false
  ) {
    // For current session, do not load the remote repo if already loaded.
    if (
      this.loadedCustomTemplatesGitRepos.get(repoUri.href) &&
      !forceLoadingRemoteRepo
    ) {
      return;
    }

    /**
     * The following implementation are adapted from create-next-app
     * See https://github.com/vercel/next.js/blob/canary/license.md for more information
     */
    if (repoUri.protocol !== 'https:') {
      throw new Error(
        `Only https protocol is supported for custom templates. Got ${repoUri.protocol}.`
      );
    }
    if (repoUri.hostname !== 'github.com') {
      throw new Error(
        `Unsupported custom templates repo ${repoUri.href}. Only GitHub is supported.`
      );
    }

    // TODO:
    // - handle invalid GitHub URL: username, name, branch, "tree", filePath must be valid
    // - handle repos with no branch information
    const [, username, name, , branch, ...file] = repoUri.pathname.split('/');
    const filePath = `${file.join('/')}`;

    const folderHash = crypto
      .createHash('md5')
      .update(repoUri.href)
      .digest('hex');

    const customTemplatesPath = path.join(
      Global.DIR,
      'custom-templates',
      folderHash
    );

    if (!fs.existsSync(customTemplatesPath)) {
      fs.mkdirSync(customTemplatesPath, { recursive: true });
    }

    // Download the repo and extract to the SFDX global state folder
    const pipeline = promisify(Stream.pipeline);
    await pipeline(
      got.stream(
        `https://codeload.github.com/${username}/${name}/tar.gz/${branch}`
      ),
      tar.extract(
        {
          cwd: customTemplatesPath,
          strip: filePath ? filePath.split('/').length + 1 : 1
        },
        [`${name}-${branch}${filePath ? `/${filePath}` : ''}`]
      )
    );

    this.loadedCustomTemplatesGitRepos.set(repoUri.href, true);
    this.customTemplatesRootPath = customTemplatesPath;
  }
}
