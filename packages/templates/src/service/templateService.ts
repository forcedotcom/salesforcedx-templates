import * as path from 'path';
import * as yeoman from 'yeoman-environment';

import { nls } from '../i18n';
import { ForceGeneratorAdapter } from '../utils';
import { CreateOutput } from '../utils/types';

/**
 * Available Template types
 */
export enum TemplateType {
  AnayticsTemplate,
  ApexClass,
  ApexTrigger,
  LightningApp,
  LightningComponent,
  LightningEvent,
  LightningInterface,
  LightningTest,
  Project,
  VisualForceComponent,
  VisualForcePage
}

/**
 * Template Options
 * If not supplied, the apiversion and outputdir use default values.
 */
export interface TemplateOptions {
  apiversion?: string;
  outputdir?: string;
  [opt: string]: string | undefined;
}

/**
 * Template Service
 */
export class TemplateService {
  private static instance: TemplateService;
  private adapter: ForceGeneratorAdapter;
  private env: yeoman;
  constructor() {
    this.adapter = new ForceGeneratorAdapter();
    // @ts-ignore the adaptor doesn't fully implement yeoman's adaptor yet
    this.env = yeoman.createEnv(undefined, undefined, this.adapter);
  }

  public static getInstance() {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  /**
   * Create using templates
   * @param templateType template type
   * @param templateOptions template options
   */
  public async create(
    templateType: TemplateType,
    templateOptions: TemplateOptions
  ): Promise<CreateOutput> {
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
    templateOptions.apiversion =
      templateOptions.apiversion ?? this.getDefaultApiVersion();
    templateOptions.outputdir = templateOptions.outputdir ?? process.cwd();
    return new Promise((resolve, reject) => {
      this.env.run(generatorNamespace, templateOptions, err => {
        if (err) {
          reject(err);
        }
        const outputDir = path.resolve(templateOptions.outputdir!);
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

  /**
   * Look up package version of @salesforce/templates package to supply a default API version
   */
  private getDefaultApiVersion(): string {
    const packageJsonPath = path.join('..', '..', 'package.json');
    const versionTrimmed = require(packageJsonPath).version.trim();
    return `${versionTrimmed.split('.')[0]}.0`;
  }
}
