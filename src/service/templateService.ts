/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  type CreateOutput,
  GeneratorClass,
  generators,
  TemplateOptions,
  TemplateType,
} from '../utils/types';
import { nls } from '../i18n';

export function importGenerator<TOptions extends TemplateOptions>(
  templateType: TemplateType
): GeneratorClass<TOptions> {
  const generator = generators.get(templateType);
  if (!generator) {
    throw new Error(nls.localize('templateTypeNotFound'));
  }
  return generator;
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
   * @param cwd cwd of current environment. CLI: don't need to set explicitly. VS Code: it's typically the root workspace path
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
   * Getting cwd of current environment
   */
  public get cwd(): string {
    return this._cwd;
  }

  /**
   * Setting cwd of current environment
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
  public create<TOptions extends TemplateOptions>(
    templateType: TemplateType,
    templateOptions: TOptions,
    customTemplatesRootPathOrGitRepo?: string
  ): Promise<CreateOutput> {
    const runOptions = {
      cwd: this.cwd,
      customTemplatesRootPathOrGitRepo,
    };

    const Generator = importGenerator(templateType);
    const instance = new Generator(templateOptions);
    return instance.run(runOptions);
  }
}
