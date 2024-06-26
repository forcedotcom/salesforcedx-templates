/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { CreateUtil } from '../utils';
import { VisualforcePageOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class VisualforcePageGenerator extends BaseGenerator<VisualforcePageOptions> {
  constructor(options: VisualforcePageOptions) {
    super(options);
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.pagename);
    CreateUtil.checkInputs(this.options.template);
  }

  public async generate(): Promise<void> {
    const { template, label, pagename } = this.options;
    this.sourceRootWithPartialPath('visualforcepage');

    await this.render(
      this.templatePath(`${template}.page`),
      this.destinationPath(path.join(this.outputdir, `${pagename}.page`)),
      {}
    );
    await this.render(
      this.templatePath('_page.page-meta.xml'),
      this.destinationPath(
        path.join(this.outputdir, `${pagename}.page-meta.xml`)
      ),
      { vfLabel: label, apiVersion: this.apiversion }
    );
  }
}
