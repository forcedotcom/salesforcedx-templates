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
import { nls } from '../i18n';
import { CreateUtil } from '../utils/createUtil';
import { LightningAppOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class LightningAppGenerator extends BaseGenerator<LightningAppOptions> {
  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.appname);
    CreateUtil.checkInputs(this.options.template);

    const fileparts = path.resolve(this.outputdir).split(path.sep);
    if (!fileparts.includes('aura') && !this.options.internal) {
      throw new Error(nls.localize('MissingAuraDir'));
    }
  }

  public async generate(): Promise<void> {
    const { template, appname, internal } = this.options;
    this.sourceRootWithPartialPath('lightningapp');

    if (!internal) {
      await this.render(
        this.templatePath('_auradefinitionbundle.app-meta.xml'),
        this.destinationPath(
          path.join(this.outputdir, appname, `${appname}.app-meta.xml`),
        ),
        {
          apiVersion: this.apiversion,
          description: nls.localize('LightningAppBundle'),
        },
      );
    }
    await this.render(
      this.templatePath(`${template}.app`),
      this.destinationPath(
        path.join(this.outputdir, appname, `${appname}.app`),
      ),
      {},
    );
    await this.render(
      this.templatePath('DefaultLightningAuradoc.auradoc'),
      this.destinationPath(
        path.join(this.outputdir, appname, `${appname}.auradoc`),
      ),
      {},
    );
    await this.render(
      this.templatePath('DefaultLightningController.js'),
      this.destinationPath(
        path.join(this.outputdir, appname, `${appname}Controller.js`),
      ),
      {},
    );
    await this.render(
      this.templatePath('DefaultLightningCss.css'),
      this.destinationPath(
        path.join(this.outputdir, appname, `${appname}.css`),
      ),
      {},
    );
    await this.render(
      this.templatePath('DefaultLightningHelper.js'),
      this.destinationPath(
        path.join(this.outputdir, appname, `${appname}Helper.js`),
      ),
      {},
    );
    await this.render(
      this.templatePath('DefaultLightningRenderer.js'),
      this.destinationPath(
        path.join(this.outputdir, appname, `${appname}Renderer.js`),
      ),
      {},
    );
    await this.render(
      this.templatePath('DefaultLightningSVG.svg'),
      this.destinationPath(
        path.join(this.outputdir, appname, `${appname}.svg`),
      ),
      {},
    );
  }
}
