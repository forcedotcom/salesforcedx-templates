/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
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
}
