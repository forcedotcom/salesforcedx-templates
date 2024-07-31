/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { type CreateOutput, TemplateType } from '../utils/types';
import analyticsTemplateGenerator from '../generators/analyticsTemplateGenerator';
import apexClassGenerator from '../generators/apexClassGenerator';
import apexTriggerGenerator from '../generators/apexTriggerGenerator';
import lightningAppGenerator from '../generators/lightningAppGenerator';
import lightningComponentGenerator from '../generators/lightningComponentGenerator';
import lightningEventGenerator from '../generators/lightningEventGenerator';
import lightningInterfaceGenerator from '../generators/lightningInterfaceGenerator';
import lightningTestGenerator from '../generators/lightningTestGenerator';
import projectGenerator from '../generators/projectGenerator';
import staticResourceGenerator from '../generators/staticResourceGenerator';
import visualforceComponentGenerator from '../generators/visualforceComponentGenerator';
import visualforcePageGenerator from '../generators/visualforcePageGenerator';

type Generators =
  | typeof analyticsTemplateGenerator
  | typeof apexClassGenerator
  | typeof apexTriggerGenerator
  | typeof lightningAppGenerator
  | typeof lightningComponentGenerator
  | typeof lightningEventGenerator
  | typeof lightningTestGenerator
  | typeof lightningInterfaceGenerator
  | typeof projectGenerator
  | typeof staticResourceGenerator
  | typeof visualforceComponentGenerator
  | typeof visualforcePageGenerator;

const generators = new Map<string, Generators>([
  ['analyticsTemplateGenerator', analyticsTemplateGenerator],
  ['apexClassGenerator', apexClassGenerator],
  ['apexTriggerGenerator', apexTriggerGenerator],
  ['lightningAppGenerator', lightningAppGenerator],
  ['lightningComponentGenerator', lightningComponentGenerator],
  ['lightningEventGenerator', lightningEventGenerator],
  ['lightningInterfaceGenerator', lightningInterfaceGenerator],
  ['lightningTestGenerator', lightningTestGenerator],
  ['projectGenerator', projectGenerator],
  ['staticResourceGenerator', staticResourceGenerator],
  ['visualforceComponentGenerator', visualforceComponentGenerator],
  ['visualforcePageGenerator', visualforcePageGenerator],
]);

export async function importGenerator(templateType: TemplateType) {
  const generatorClass =
    TemplateType[templateType].toString().charAt(0).toLowerCase() +
    TemplateType[templateType].toString().slice(1) +
    'Generator';
  return generators.get(generatorClass) as Generators;
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
  public async create(
    templateType: TemplateType,
    templateOptions: any,
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
