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
import * as path from 'node:path';
import { extension } from 'mime-types';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { StaticResourceOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

const EXTENSION_TEMPLATES = ['js', 'css', 'json', 'txt'];

export default class StaticResourceGenerator extends BaseGenerator<StaticResourceOptions> {
  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.resourcename);

    if (!extension(this.options.contenttype.toLowerCase())) {
      throw new Error(nls.localize('InvalidMimeType'));
    }
  }

  public async generate(): Promise<void> {
    const { resourcename, contenttype } = this.options;
    this.sourceRootWithPartialPath('staticresource');

    const ext = extension(contenttype);

    if (ext && EXTENSION_TEMPLATES.includes(ext)) {
      // For types that we have default file, write that (js, css, txt, json)
      await this.render(
        this.templatePath(`empty.${ext}`),
        this.destinationPath(
          path.join(this.outputdir, `${resourcename}.${ext}`),
        ),
        {},
      );
    } else if (ext === 'zip') {
      // For zip files, write an empty js file in a folder
      await this.render(
        this.templatePath('_gitkeep'),
        this.destinationPath(
          path.join(this.outputdir, resourcename, '.gitkeep'),
        ),
        {},
      );
    } else {
      // For all other mime types write a generic .resource file
      await this.render(
        this.templatePath('empty.resource'),
        this.destinationPath(
          path.join(this.outputdir, `${resourcename}.resource`),
        ),
        {},
      );
    }

    await this.render(
      this.templatePath('_staticresource.resource-meta.xml'),
      this.destinationPath(
        path.join(this.outputdir, `${resourcename}.resource-meta.xml`),
      ),
      {
        contentType: contenttype,
      },
    );
  }
}
