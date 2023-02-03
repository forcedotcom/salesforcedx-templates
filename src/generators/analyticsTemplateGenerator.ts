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
import { SfdxGenerator } from './sfdxGenerator';

export default class AnalyticsTemplateGenerator extends SfdxGenerator<AnalyticsTemplateOptions> {
  constructor(args: string | string[], options: AnalyticsTemplateOptions) {
    super(args, options);
    this.sourceRootWithPartialPath(path.join('analytics', 'waveTemplates'));
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.templatename);

    const fileparts = path.resolve(this.outputdir).split(path.sep);
    if (!fileparts.includes('waveTemplates')) {
      throw new Error(nls.localize('MissingWaveTemplatesDir'));
    }
  }

  public writing(): void {
    const { templatename } = this.options;
    // tslint:disable-next-line:no-unused-expression
    this.fs.copyTpl(
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
    this.fs.copyTpl(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'app-to-template-rules.json')
      ),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'app-to-template-rules.json')
      ),
      {}
    );
    this.fs.copyTpl(
      this.templatePath(path.join('DefaultAnalyticsTemplate', 'folder.json')),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'folder.json')
      ),
      { templateName: templatename }
    );
    this.fs.copyTpl(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'releaseNotes.html')
      ),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'releaseNotes.html')
      ),
      {}
    );
    this.fs.copyTpl(
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
    this.fs.copyTpl(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'template-to-app-rules.json')
      ),
      this.destinationPath(
        path.join(this.outputdir, templatename, 'template-to-app-rules.json')
      ),
      {}
    );
    this.fs.copyTpl(
      this.templatePath(path.join('DefaultAnalyticsTemplate', 'ui.json')),
      this.destinationPath(path.join(this.outputdir, templatename, 'ui.json')),
      {}
    );
    this.fs.copyTpl(
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
