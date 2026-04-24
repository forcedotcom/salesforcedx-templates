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
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { AnalyticsTemplateOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class AnalyticsTemplateGenerator extends BaseGenerator<AnalyticsTemplateOptions> {
  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.templatename);

    const fileparts = path.resolve(this.outputdir).split(path.sep);
    if (!fileparts.includes('waveTemplates')) {
      throw new Error(nls.localize('MissingWaveTemplatesDir'));
    }
  }

  public async generate(): Promise<void> {
    const { templatename } = this.options;
    this.sourceRootWithPartialPath(path.join('analytics', 'waveTemplates'));

    await this.render(
      this.templatePath(
        path.join(
          'DefaultAnalyticsTemplate',
          'dashboards',
          'basicDashboard.json',
        ),
      ),
      this.destinationPath(
        path.join(
          this.outputdir,
          templatename,
          'dashboards',
          templatename + 'Dashboard.json',
        ),
      ),
      { templateName: templatename },
    );
    await this.render(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'app-to-template-rules.json'),
      ),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'app-to-template-rules.json'),
      ),
      {},
    );
    await this.render(
      this.templatePath(path.join('DefaultAnalyticsTemplate', 'folder.json')),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'folder.json'),
      ),
      { templateName: templatename },
    );
    await this.render(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'releaseNotes.html'),
      ),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'releaseNotes.html'),
      ),
      {},
    );
    await this.render(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'template-info.json'),
      ),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'template-info.json'),
      ),
      {
        templateName: templatename,
        sourceApiVersion: this.apiversion,
      },
    );
    await this.render(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'template-to-app-rules.json'),
      ),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'template-to-app-rules.json'),
      ),
      {},
    );
    await this.render(
      this.templatePath(path.join('DefaultAnalyticsTemplate', 'ui.json')),
      this.destinationPath(path.join(this.outputdir, templatename, 'ui.json')),
      {},
    );
    await this.render(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'variables.json'),
      ),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'variables.json'),
      ),
      {},
    );
  }
}
