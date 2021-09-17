/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { CreateUtil } from '../utils';
import { VisualforcePageOptions } from '../utils/types';
import { SfdxGenerator } from './sfdxGenerator';

export default class VisualforcePageGenerator extends SfdxGenerator<
  VisualforcePageOptions
> {
  constructor(args: string | string[], options: VisualforcePageOptions) {
    super(args, options);
    this.sourceRootWithPartialPath('visualforcepage');
  }

  public validateOptions() {
    CreateUtil.checkInputs(this.options.pagename);
    CreateUtil.checkInputs(this.options.template);
  }

  public writing() {
    const { template, outputdir, label, apiversion, pagename } = this.options;
    this.fs.copyTpl(
      this.templatePath(`${template}.page`),
      this.destinationPath(path.join(outputdir, `${pagename}.page`)),
      {}
    );
    this.fs.copyTpl(
      this.templatePath('_page.page-meta.xml'),
      this.destinationPath(path.join(outputdir, `${pagename}.page-meta.xml`)),
      { vfLabel: label, apiVersion: apiversion }
    );
  }
}
