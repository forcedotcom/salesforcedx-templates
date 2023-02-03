/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { CreateUtil } from '../utils';
import { VisualforceComponentOptions } from '../utils/types';
import { SfdxGenerator } from './sfdxGenerator';

export default class VisualforceComponentGenerator extends SfdxGenerator<VisualforceComponentOptions> {
  constructor(args: string | string[], options: VisualforceComponentOptions) {
    super(args, options);
    this.sourceRootWithPartialPath('visualforcecomponent');
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.componentname);
    CreateUtil.checkInputs(this.options.template);
  }

  public writing(): void {
    const { template, label, apiversion, componentname } = this.options;
    this.fs.copyTpl(
      this.templatePath(`${template}.component`),
      this.destinationPath(
        path.join(this.outputdir, `${componentname}.component`)
      ),
      {}
    ),
      this.fs.copyTpl(
        this.templatePath('_component.component-meta.xml'),
        this.destinationPath(
          path.join(this.outputdir, `${componentname}.component-meta.xml`)
        ),
        { vfLabel: label, apiVersion: apiversion }
      );
  }
}
