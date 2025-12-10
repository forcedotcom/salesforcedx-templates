/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { camelCaseToTitleCase } from '@salesforce/kit';
import * as path from 'path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { WebApplicationOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class WebApplicationGenerator extends BaseGenerator<WebApplicationOptions> {
  constructor(options: WebApplicationOptions) {
    super(options);
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.webappname);
    CreateUtil.checkInputs(this.options.template);

    const fileparts = path.resolve(this.outputdir).split(path.sep);
    if (!this.options.internal && !fileparts.includes('webApplications')) {
      throw new Error(nls.localize('MissingWebApplicationsDir'));
    }
  }

  public async generate(): Promise<void> {
    const { template, webappname } = this.options;
    const masterLabel =
      this.options.masterlabel || camelCaseToTitleCase(webappname);

    this.sourceRootWithPartialPath('webapp-basic');

    const webappDir = path.join(this.outputdir, webappname);

    await this.render(
      this.templatePath(`${template}.html`),
      this.destinationPath(path.join(webappDir, 'index.html')),
      { masterLabel }
    );

    await this.render(
      this.templatePath('webapp.json'),
      this.destinationPath(path.join(webappDir, 'webapp.json')),
      {}
    );

    await this.render(
      this.templatePath('_webapplication.webApplication-meta.xml'),
      this.destinationPath(
        path.join(webappDir, `${webappname}.webApplication-meta.xml`)
      ),
      { apiVersion: this.apiversion, masterLabel }
    );
  }
}
