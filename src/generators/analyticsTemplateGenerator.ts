/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { AnalyticsTemplateOptions } from '../utils/types';
import { SfGenerator } from './sfGenerator';

export default class AnalyticsTemplateGenerator extends SfGenerator<AnalyticsTemplateOptions> {
  constructor(options: AnalyticsTemplateOptions) {
    super(options);
  }

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
          'basicDashboard.json'
        )
      ),
      this.destinationPath(
        path.join(
          this.outputdir,
          templatename,
          'dashboards',
          templatename + 'Dashboard.json'
        )
      ),
      { templateName: templatename }
    );
    await this.render(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'app-to-template-rules.json')
      ),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'app-to-template-rules.json')
      ),
      {}
    );
    await this.render(
      this.templatePath(path.join('DefaultAnalyticsTemplate', 'folder.json')),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'folder.json')
      ),
      { templateName: templatename }
    );
    await this.render(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'releaseNotes.html')
      ),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'releaseNotes.html')
      ),
      {}
    );
    await this.render(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'template-info.json')
      ),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'template-info.json')
      ),
      {
        templateName: templatename,
        sourceApiVersion: this.apiversion,
      }
    );
    await this.render(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'template-to-app-rules.json')
      ),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'template-to-app-rules.json')
      ),
      {}
    );
    await this.render(
      this.templatePath(path.join('DefaultAnalyticsTemplate', 'ui.json')),
      this.destinationPath(path.join(this.outputdir, templatename, 'ui.json')),
      {}
    );
    await this.render(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'variables.json')
      ),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'variables.json')
      ),
      {}
    );
  }
}
