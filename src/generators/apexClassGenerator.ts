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
import { CreateUtil } from '../utils/createUtil';
import { ApexClassOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class ApexClassGenerator extends BaseGenerator<ApexClassOptions> {
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
      { apiName: classname },
    );

    await this.render(
      this.templatePath('_class.cls-meta.xml'),
      this.destinationPath(
        path.join(this.outputdir, `${classname}.cls-meta.xml`),
      ),
      { apiName: classname, apiVersion: this.apiversion },
    );
  }
}
