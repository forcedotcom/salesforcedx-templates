/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Messages } from '@salesforce/core';
import * as path from 'path';
import { OptionsMap } from '../utils/types';
// tslint:disable-next-line:no-var-requires
const generator = require('yeoman-generator');
Messages.importMessagesDirectory(__dirname);

export default class AnalyticsTemplateGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(
      path.join(__dirname, '..', 'templates', 'analytics', 'waveTemplates')
    );
  }
  public writing() {
    const { outputdir, templatename, apiversion } = this.options;
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
          outputdir,
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
        path.join(outputdir, templatename, 'app-to-template-rules.json')
      )
    );
    this.fs.copyTpl(
      this.templatePath(path.join('DefaultAnalyticsTemplate', 'folder.json')),
      this.destinationPath(path.join(outputdir, templatename, 'folder.json')),
      { templateName: templatename }
    );
    this.fs.copyTpl(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'releaseNotes.html')
      ),
      this.destinationPath(
        path.join(outputdir, templatename, 'releaseNotes.html')
      )
    );
    this.fs.copyTpl(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'template-info.json')
      ),
      this.destinationPath(
        path.join(outputdir, templatename, 'template-info.json')
      ),
      { templateName: templatename, sourceApiVersion: apiversion }
    );
    this.fs.copyTpl(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'template-to-app-rules.json')
      ),
      this.destinationPath(
        path.join(outputdir, templatename, 'template-to-app-rules.json')
      )
    );
    this.fs.copyTpl(
      this.templatePath(path.join('DefaultAnalyticsTemplate', 'ui.json')),
      this.destinationPath(path.join(outputdir, templatename, 'ui.json'))
    );
    this.fs.copyTpl(
      this.templatePath(
        path.join('DefaultAnalyticsTemplate', 'variables.json')
      ),
      this.destinationPath(path.join(outputdir, templatename, 'variables.json'))
    );
  }
}
