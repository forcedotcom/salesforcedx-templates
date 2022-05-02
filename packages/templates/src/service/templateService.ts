/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yeoman from 'yeoman-environment';

import { nls } from '../i18n';
import { ForceGeneratorAdapter } from '../utils';
import { CreateOutput, TemplateOptions, TemplateType } from '../utils/types';
import { loadCustomTemplatesGitRepo } from './gitRepoUtils';

interface FsError extends Error {
  code: string;
}

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
    await this.setCustomTemplatesRootPathOrGitRepo(
      customTemplatesRootPathOrGitRepo
    );
    if (customTemplatesRootPathOrGitRepo) {
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
      this.env
        .run(generatorNamespace, templateOptions)
        .then(() => {
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
        })
        .catch(err => {
          reject(err);
        });
    });
  }

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

  /**
   * Set custom templates root path or git repo.
   * Throws an error if local path doesn't exist or cannot reach git repo.
   * @param customTemplatesRootPathOrGitRepo custom templates root path or git repo
   * @param forceLoadingRemoteRepo by default do not reload remote repo if the repo is already downloaded
   */
  public async setCustomTemplatesRootPathOrGitRepo(
    pathOrRepoUri?: string,
    forceLoadingRemoteRepo = false
  ) {
    if (pathOrRepoUri === undefined) {
      this.customTemplatesRootPath = undefined;
      return;
    }

    try {
      // if pathOrRepoUri is valid url, load the repo
      const url = new URL(pathOrRepoUri);
      if (url) {
        this.customTemplatesRootPath = await loadCustomTemplatesGitRepo(
          url,
          forceLoadingRemoteRepo
        );
      }
    } catch (error) {
      const err = error as FsError;
      if (err.code !== 'ERR_INVALID_URL') {
        throw error;
      }

      const localTemplatesPath = pathOrRepoUri;
      if (fs.existsSync(localTemplatesPath)) {
        this.customTemplatesRootPath = localTemplatesPath;
      } else {
        throw new Error(
          nls.localize('localCustomTemplateDoNotExist', localTemplatesPath)
        );
      }
    }
  }
}
