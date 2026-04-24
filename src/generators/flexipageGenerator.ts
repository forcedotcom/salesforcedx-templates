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
import * as fs from 'node:fs';
import { readdir } from 'node:fs/promises';
import * as path from 'node:path';
import { CreateUtil } from '../utils';
import { FlexipageOptions } from '../utils/types';
import { nls } from '../i18n';
import {
  BaseGenerator,
  setCustomTemplatesRootPathOrGitRepo,
} from './baseGenerator';

const VALID_TEMPLATES = ['RecordPage', 'AppPage', 'HomePage'] as const;
const MAX_SECONDARY_FIELDS = 11;

export default class FlexipageGenerator extends BaseGenerator<FlexipageOptions> {
  public constructor(options: FlexipageOptions) {
    super(options);
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.flexipagename);
    CreateUtil.checkInputs(this.options.template);

    if (!VALID_TEMPLATES.includes(this.options.template)) {
      throw new Error(
        nls.localize(
          'InvalidFlexipageTemplate',
          this.options.template,
          VALID_TEMPLATES.join(', '),
        ),
      );
    }

    if (this.options.template === 'RecordPage' && !this.options.entityName) {
      throw new Error(nls.localize('RecordPageRequiresEntityName'));
    }

    // Validate secondary fields limit (dynamicHighlights supports max 11 secondary fields)
    const secondaryFieldsCount = this.options.secondaryFields?.length ?? 0;
    if (secondaryFieldsCount > MAX_SECONDARY_FIELDS) {
      throw new Error(
        nls.localize(
          'TooManySecondaryFields',
          secondaryFieldsCount,
          MAX_SECONDARY_FIELDS,
        ),
      );
    }

    // Ensure output directory includes 'flexipages' folder
    if (!this.options.internal && !this.outputdir.includes('flexipages')) {
      this.outputdir = path.join(this.outputdir, 'flexipages');
    }
  }

  public async generate(): Promise<void> {
    const {
      template,
      flexipagename,
      masterlabel,
      description,
      entityName,
      primaryField,
      secondaryFields = [],
      detailFields = [],
      flexipageTemplatesGitRepo,
      forceLoadingRemoteRepo,
    } = this.options;

    // Set up custom templates if provided
    let customTemplatesRootPath: string | undefined;
    if (flexipageTemplatesGitRepo) {
      customTemplatesRootPath = await setCustomTemplatesRootPathOrGitRepo(
        flexipageTemplatesGitRepo,
        forceLoadingRemoteRepo,
      );
    }

    // Determine template root path
    let templateRootPath: string;
    if (customTemplatesRootPath) {
      templateRootPath = path.join(
        customTemplatesRootPath,
        'flexipage',
        template,
      );
      if (!fs.existsSync(templateRootPath)) {
        throw new Error(
          nls.localize(
            'MissingFlexipageTemplate',
            template,
            customTemplatesRootPath,
          ),
        );
      }
    } else {
      // Use built-in templates
      this.sourceRootWithPartialPath('flexipage');
      templateRootPath = this.templatePath(template);
    }

    // Prepare EJS template variables
    const templateVars = {
      flexipagename,
      masterlabel: masterlabel ?? flexipagename,
      description: description ?? '',
      apiVersion: this.apiversion,
      entityName: entityName ?? '',
      primaryField: primaryField ?? '',
      secondaryFields: Array.isArray(secondaryFields) ? secondaryFields : [],
      detailFields: Array.isArray(detailFields) ? detailFields : [],
    };

    // Recursively process template directory
    await this.generateFlexipageFromTemplate(
      templateRootPath,
      this.outputdir,
      templateVars,
    );
  }

  /**
   * Recursively process template directory and generate files
   */
  private async generateFlexipageFromTemplate(
    sourceDir: string,
    destDir: string,
    templateVars: Record<string, unknown>,
  ): Promise<void> {
    const entries = await readdir(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name);
      let destName = entry.name;

      // Replace _flexipage placeholder with actual flexipage name
      if (destName.includes('_flexipage')) {
        destName = destName.replace(
          /_flexipage/g,
          templateVars.flexipagename as string,
        );
      }

      const destPath = path.join(destDir, destName);

      if (entry.isDirectory()) {
        // Recursively process subdirectories
        await this.generateFlexipageFromTemplate(
          sourcePath,
          destPath,
          templateVars,
        );
      } else if (entry.isFile() && isTemplateFile(entry.name)) {
        // Render template files only (skip non-template files)
        await this.render(sourcePath, destPath, templateVars);
      }
    }
  }
}

const isTemplateFile = (filename: string): boolean =>
  filename.endsWith('.flexipage-meta.xml');
