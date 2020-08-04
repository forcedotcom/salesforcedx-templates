import * as path from 'path';
import * as yeoman from 'yeoman-environment';

import { ForceGeneratorAdapter } from '../utils';

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

export interface TemplateOptions {
  apiversion?: string;
  outputdir?: string;
  [opt: string]: string | undefined;
}

export class TemplateService {
  private static instance: TemplateService;
  private adapter: yeoman.Adapter;
  private env: yeoman;
  constructor() {
    // @ts-ignore the adaptor doesn't fully implement yeoman's adaptor yet
    this.adapter = new ForceGeneratorAdapter();
    this.env = yeoman.createEnv(undefined, undefined, this.adapter);
  }

  public static getInstance() {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  public async create(
    templateType: TemplateType,
    templateOptions: TemplateOptions
  ) {
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
        resolve();
      });
    });
  }

  private getDefaultApiVersion(): string {
    const packageJsonPath = path.join('..', '..', 'package.json');
    const versionTrimmed = require(packageJsonPath).version.trim();
    return `${versionTrimmed.split('.')[0]}.0`;
  }
}
