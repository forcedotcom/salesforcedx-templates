/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { LightningAppOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class LightningAppGenerator extends BaseGenerator<LightningAppOptions> {
  constructor(options: LightningAppOptions) {
    super(options);
  }

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
          path.join(this.outputdir, appname, `${appname}.app-meta.xml`)
        ),
        {
          apiVersion: this.apiversion,
          description: nls.localize('LightningAppBundle'),
        }
      );
    }
    await this.render(
      this.templatePath(`${template}.app`),
      this.destinationPath(
        path.join(this.outputdir, appname, `${appname}.app`)
      ),
      {}
    ),
      await this.render(
        this.templatePath('DefaultLightningAuradoc.auradoc'),
        this.destinationPath(
          path.join(this.outputdir, appname, `${appname}.auradoc`)
        ),
        {}
      ),
      await this.render(
        this.templatePath('DefaultLightningController.js'),
        this.destinationPath(
          path.join(this.outputdir, appname, `${appname}Controller.js`)
        ),
        {}
      ),
      await this.render(
        this.templatePath('DefaultLightningCss.css'),
        this.destinationPath(
          path.join(this.outputdir, appname, `${appname}.css`)
        ),
        {}
      ),
      await this.render(
        this.templatePath('DefaultLightningHelper.js'),
        this.destinationPath(
          path.join(this.outputdir, appname, `${appname}Helper.js`)
        ),
        {}
      ),
      await this.render(
        this.templatePath('DefaultLightningRenderer.js'),
        this.destinationPath(
          path.join(this.outputdir, appname, `${appname}Renderer.js`)
        ),
        {}
      ),
      await this.render(
        this.templatePath('DefaultLightningSVG.svg'),
        this.destinationPath(
          path.join(this.outputdir, appname, `${appname}.svg`)
        ),
        {}
      );
  }
}
