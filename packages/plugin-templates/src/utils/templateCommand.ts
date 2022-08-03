/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxCommand } from '@salesforce/command';
import { OrgConfigProperties, ConfigAggregator, SfdxPropertyKeys } from '@salesforce/core';
import { TemplateService } from '@salesforce/templates';
import { ForceGeneratorAdapter } from '@salesforce/templates/lib/utils';
import { CreateOutput } from '@salesforce/templates/lib/utils/types';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import * as yeoman from 'yeoman-environment';
import * as yeomanGenerator from 'yeoman-generator';

import { MessageUtil } from './messageUtil';
export abstract class TemplateCommand extends SfdxCommand {
  public static buildJson(adapter: ForceGeneratorAdapter, targetDir: string): CreateOutput {
    const cleanOutput = adapter.log.getCleanOutput();
    const rawOutput = `target dir = ${targetDir}\n${adapter.log.getOutput()}`;
    const output = {
      outputDir: targetDir,
      created: cleanOutput,
      rawOutput,
    };
    return output;
  }

  private static aggregator?: ConfigAggregator;
  private static async getConfigAggregator(): Promise<ConfigAggregator> {
    if (!TemplateCommand.aggregator) {
      TemplateCommand.aggregator = await ConfigAggregator.create();
    }
    return TemplateCommand.aggregator;
  }

  public static getDefaultApiVersion(): string {
    const packageJsonPath = path.join('..', '..', 'package.json');
    const versionTrimmed = require(packageJsonPath).version.trim();
    return `${versionTrimmed.split('.')[0]}.0`;
  }

  public static async getApiVersion(): Promise<string> {
    try {
      const aggregator = await TemplateCommand.getConfigAggregator();
      const apiVersionFromConfig = aggregator.getPropertyValue(SfdxPropertyKeys.API_VERSION) as string;
      return apiVersionFromConfig || TemplateCommand.getDefaultApiVersion();
    } catch (err) {
      return TemplateCommand.getDefaultApiVersion();
    }
  }

  public static async getCustomTemplates() {
    try {
      const aggregator = await TemplateCommand.getConfigAggregator();
      // we're still accessing the old `customOrgMetadataTemplates` key, but this is deprecated and we'll use the new key to access the value
      const customTemplatesFromConfig = aggregator.getPropertyValue(
        OrgConfigProperties.ORG_CUSTOM_METADATA_TEMPLATES
      ) as string;
      return customTemplatesFromConfig;
    } catch (err) {
      return undefined;
    }
  }

  public abstract run(): Promise<AnyJson>;

  public async runGenerator(generator: yeomanGenerator.GeneratorConstructor) {
    // Can't specify a default value the normal way for apiversion, so set it here
    if (!this.flags.apiversion) {
      this.flags.apiversion = await TemplateCommand.getApiVersion();
    }

    const customTemplates = await TemplateCommand.getCustomTemplates();
    if (customTemplates) {
      await TemplateService.getInstance().setCustomTemplatesRootPathOrGitRepo(customTemplates);
    }

    const adapter = new ForceGeneratorAdapter();
    // @ts-ignore
    const env = yeoman.createEnv(undefined, undefined, adapter);
    env.registerStub(generator, 'generator');

    // @ts-ignore env.run should have a callback param. This should all go away if switched to lib implementation
    const result = await env.run('generator', this.flags);
    const targetDir = path.resolve(this.flags.outputdir);
    if (this.flags.json) {
      return TemplateCommand.buildJson(adapter, targetDir);
    } else {
      this.log(MessageUtil.get('TargetDirOutput', [targetDir]));
      this.log(adapter.log.getOutput());
      return {};
    }
  }
}
