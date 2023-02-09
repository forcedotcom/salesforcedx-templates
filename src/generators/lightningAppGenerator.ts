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
import { SfdxGenerator } from './sfdxGenerator';

export default class LightningAppGenerator extends SfdxGenerator<LightningAppOptions> {
  constructor(args: string | string[], options: LightningAppOptions) {
    super(args, options);
    this.sourceRootWithPartialPath('lightningapp');
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.appname);
    CreateUtil.checkInputs(this.options.template);

    const fileparts = path.resolve(this.outputdir).split(path.sep);
    if (!fileparts.includes('aura') && !this.options.internal) {
      throw new Error(nls.localize('MissingAuraDir'));
    }
  }

  public writing(): void {
    const { template, appname, internal } = this.options;
    // tslint:disable-next-line:no-unused-expression
    if (!internal) {
      this.fs.copyTpl(
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
    this.fs.copyTpl(
      this.templatePath(`${template}.app`),
      this.destinationPath(
        path.join(this.outputdir, appname, `${appname}.app`)
      ),
      {}
    ),
      this.fs.copyTpl(
        this.templatePath('DefaultLightningAuradoc.auradoc'),
        this.destinationPath(
          path.join(this.outputdir, appname, `${appname}.auradoc`)
        ),
        {}
      ),
      this.fs.copyTpl(
        this.templatePath('DefaultLightningController.js'),
        this.destinationPath(
          path.join(this.outputdir, appname, `${appname}Controller.js`)
        ),
        {}
      ),
      this.fs.copyTpl(
        this.templatePath('DefaultLightningCss.css'),
        this.destinationPath(
          path.join(this.outputdir, appname, `${appname}.css`)
        ),
        {}
      ),
      this.fs.copyTpl(
        this.templatePath('DefaultLightningHelper.js'),
        this.destinationPath(
          path.join(this.outputdir, appname, `${appname}Helper.js`)
        ),
        {}
      ),
      this.fs.copyTpl(
        this.templatePath('DefaultLightningRenderer.js'),
        this.destinationPath(
          path.join(this.outputdir, appname, `${appname}Renderer.js`)
        ),
        {}
      ),
      this.fs.copyTpl(
        this.templatePath('DefaultLightningSVG.svg'),
        this.destinationPath(
          path.join(this.outputdir, appname, `${appname}.svg`)
        ),
        {}
      );
  }
}
