/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  type CreateOutput,
  type GeneratorClass,
  type GeneratorContext,
  generators,
  type TemplateOptions,
  TemplateType,
} from '../utils/types';
import { nls } from '../i18n';

export function importGenerator<TOptions extends TemplateOptions>(
  templateType: TemplateType,
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
  public cwd: string;
  private _context: GeneratorContext | undefined;

  public constructor(cwd?: string, context?: GeneratorContext) {
    this.cwd = cwd ?? process.cwd();
    this._context = context;
  }

  /**
   * Get an instance of TemplateService
   *
   * @param cwd cwd of current environment. CLI: don't need to set explicitly. VS Code: it's typically the root workspace path
   * @param context optional generator context with fs and templatesRootPath
   */
  public static getInstance(
    cwd?: string,
    context?: GeneratorContext,
  ): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService(cwd, context);
    } else {
      if (cwd) {
        TemplateService.instance.cwd = cwd;
      }
      if (context) {
        TemplateService.instance._context = context;
      }
    }
    return TemplateService.instance;
  }

  /**
   * Create using templates
   *
   * @param templateType template type
   * @param templateOptions template options
   * @param customTemplatesRootPathOrGitRepo custom templates root path or git repo. If not specified, use built-in templates
   */
  public create<TOptions extends TemplateOptions>(
    templateType: TemplateType,
    templateOptions: TOptions,
    customTemplatesRootPathOrGitRepo?: string,
  ): Promise<CreateOutput> {
    const runOptions = {
      cwd: this.cwd,
      customTemplatesRootPathOrGitRepo,
    };

    const generatorClass = importGenerator(templateType);
    const instance = new generatorClass(
      templateOptions,
      this._context,
      this.cwd,
    );
    return instance.run(runOptions);
  }
}
