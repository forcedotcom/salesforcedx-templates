/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export interface StringKeyValueObject<V> {
  [opt: string]: V;
}
export type OptionsMap = StringKeyValueObject<string>;
export type Answers = StringKeyValueObject<string>;

export interface CreateOutput {
  outputDir: string;
  created: string[];
  rawOutput: string;
}

export interface TemplateOptions {
  /**
   * API Version to use with the metadata.
   */
  apiversion?: string;
  /**
   * Location to output generate files. Defaults to process.cwd.
   */
  outputdir?: string;
}

export type GeneratorResult = {
  outputDir: string;
  /**
   * Files created during generation
   */
  created: string[];
  /**
   * String representation of output results
   */
  rawOutput: string;
};
