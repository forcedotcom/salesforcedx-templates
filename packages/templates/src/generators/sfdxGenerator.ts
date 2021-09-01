/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as path from 'path';
import * as Generator from 'yeoman-generator';
import { TemplateService } from '../service/templateService';
import { TemplateOptions } from '../utils/types';

/**
 * Base class for generators
 */
export abstract class SfdxGenerator<
  TOptions extends TemplateOptions
> extends Generator<Generator.GeneratorOptions> {
  options!: TOptions & {
    apiversion: string;
    outputdir: string;
  };

  /**
   * Set by sourceRootWithPartialPath called in generator
   */
  public builtInTemplatesRootPath?: string;

  constructor(args: string | string[], options: TOptions) {
    super(args, options);
    this.options.apiversion =
      this.options.apiversion ?? TemplateService.getDefaultApiVersion();
    this.options.outputdir = this.options.outputdir ?? process.cwd();
    this.validateOptions();
  }
  /**
   * Validate provided options
   */
  public abstract validateOptions(): void;

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
    const { customTemplatesRootPath } = TemplateService.getInstance();
    if (!customTemplatesRootPath) {
      this.sourceRoot(path.join(this.builtInTemplatesRootPath));
    } else {
      if (fs.existsSync(path.join(customTemplatesRootPath, partialPath))) {
        this.sourceRoot(path.join(customTemplatesRootPath, partialPath));
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
}
