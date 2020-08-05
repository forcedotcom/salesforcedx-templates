import * as path from 'path';
import * as Generator from 'yeoman-generator';
import { TemplateOptions } from '../utils/types';

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
      this.options.apiversion ?? this.getDefaultApiVersion();
    this.options.outputdir = this.options.outputdir ?? process.cwd();
    this.validateOptions();
  }
  public abstract validateOptions(): void;

  /**
   * Look up package version of @salesforce/templates package to supply a default API version
   */
  private getDefaultApiVersion(): string {
    const packageJsonPath = path.join('..', '..', 'package.json');
    const versionTrimmed = require(packageJsonPath).version.trim();
    return `${versionTrimmed.split('.')[0]}.0`;
  }
}
