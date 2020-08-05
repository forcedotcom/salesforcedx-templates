/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import * as yeoman from 'yeoman-environment';

import { nls } from '../i18n';
import { ForceGeneratorAdapter } from '../utils';
import { CreateOutput, TemplateOptions, TemplateType } from '../utils/types';

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
    }
    return TemplateService.instance;
  }

  /**
   * Setting cwd of current yeoman environment
   * In VS Code, it's typically the root workspace path
   */
  public set cwd(cwd: string) {
    this.env.cwd = cwd;
  }

  /**
   * Create using templates
   * @param templateType template type
   * @param templateOptions template options
   */
  public async create<TOptions extends TemplateOptions>(
    templateType: TemplateType,
    templateOptions: TOptions
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
}
