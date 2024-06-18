/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  type CreateOutput,
  type TemplateOptions,
  TemplateType,
} from '../utils/types';

async function importGenerator(templateType: TemplateType) {
  const generatorClass =
    TemplateType[templateType].toString().charAt(0).toLowerCase() +
    TemplateType[templateType].toString().slice(1) +
    'Generator';
  return (await import(`../generators/${generatorClass}`)).default;
}

/**
 * Template Service
 */
export class TemplateService {
  private static instance: TemplateService;
  private _cwd: string;

  constructor(cwd: string = process.cwd()) {
    this._cwd = cwd;
  }

  /**
   * Get an instance of TemplateService
   * @param cwd cwd of current yeoman environment. CLI: don't need to set explicitly. VS Code: it's typically the root workspace path
   */
  public static getInstance(cwd?: string): TemplateService {
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
  public get cwd(): string {
    return this._cwd;
  }

  /**
   * Setting cwd of current yeoman environment
   * In VS Code, it's typically the root workspace path
   */
  public set cwd(cwd: string) {
    this._cwd = cwd;
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
    const runOptions = {
      cwd: this.cwd,
      customTemplatesRootPathOrGitRepo,
    };

    const Generator = await importGenerator(templateType);
    const instance = new Generator(templateOptions);
    return instance.run(runOptions);
  }
}
