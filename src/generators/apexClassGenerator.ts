/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { CreateUtil } from '../utils';
import { ApexClassOptions } from '../utils/types';
import { SfGenerator } from './sfGenerator';

export default class ApexClassGenerator extends SfGenerator<ApexClassOptions> {
  constructor(options: ApexClassOptions) {
    super(options);
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.template);
    CreateUtil.checkInputs(this.options.classname);
  }

  public async generate(): Promise<void> {
    const { template, classname } = this.options;
    this.sourceRootWithPartialPath('apexclass');

    await this.render(
      this.templatePath(`${template}.cls`),
      this.destinationPath(path.join(this.outputdir, `${classname}.cls`)),
      { apiName: classname }
    );

    await this.render(
      this.templatePath('_class.cls-meta.xml'),
      this.destinationPath(
        path.join(this.outputdir, `${classname}.cls-meta.xml`)
      ),
      { apiName: classname, apiVersion: this.apiversion }
    );
  }
}
