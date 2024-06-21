/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { CreateUtil } from '../utils';
import { VisualforceComponentOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class VisualforceComponentGenerator extends BaseGenerator<VisualforceComponentOptions> {
  constructor(options: VisualforceComponentOptions) {
    super(options);
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.componentname);
    CreateUtil.checkInputs(this.options.template);
  }

  public async generate(): Promise<void> {
    const { template, label, componentname } = this.options;
    this.sourceRootWithPartialPath('visualforcecomponent');

    await this.render(
      this.templatePath(`${template}.component`),
      this.destinationPath(
        path.join(this.outputdir, `${componentname}.component`)
      ),
      {}
    ),
      await this.render(
        this.templatePath('_component.component-meta.xml'),
        this.destinationPath(
          path.join(this.outputdir, `${componentname}.component-meta.xml`)
        ),
        { vfLabel: label, apiVersion: this.apiversion }
      );
  }
}
