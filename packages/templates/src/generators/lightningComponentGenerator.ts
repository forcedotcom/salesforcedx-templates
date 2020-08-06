/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { LightningComponentOptions } from '../utils/types';
import { SfdxGenerator } from './sfdxGenerator';

export default class LightningComponentGenerator extends SfdxGenerator<
  LightningComponentOptions
> {
  constructor(args: string | string[], options: LightningComponentOptions) {
    super(args, options);
  }

  public validateOptions() {
    CreateUtil.checkInputs(this.options.componentname);
    CreateUtil.checkInputs(this.options.template);

    const fileparts = path.resolve(this.options.outputdir).split(path.sep);

    if (!this.options.internal) {
      if (this.options.type === 'lwc' && !fileparts.includes('lwc')) {
        throw new Error(nls.localize('MissingLWCDir'));
      } else if (!fileparts.includes('aura') && this.options.type === 'aura') {
        throw new Error(nls.localize('MissingAuraDir'));
      }
    }
  }

  public writing() {
    const {
      template,
      outputdir,
      componentname,
      apiversion,
      type,
      internal
    } = this.options;
    // tslint:disable-next-line:no-unused-expression
    if (type === 'aura') {
      this.sourceRoot(
        path.join(__dirname, '..', 'templates', 'lightningcomponent', 'aura')
      );
      if (!internal) {
        this.fs.copyTpl(
          this.templatePath('_auradefinitionbundle.cmp-meta.xml'),
          this.destinationPath(
            path.join(outputdir, componentname, `${componentname}.cmp-meta.xml`)
          ),
          {
            componentname,
            description: nls.localize('LightningComponentBundle'),
            apiVersion: apiversion
          }
        );
      }
      this.fs.copyTpl(
        this.templatePath('DefaultLightningAuradoc.auradoc'),
        this.destinationPath(
          path.join(outputdir, componentname, `${componentname}.auradoc`)
        ),
        {}
      ),
        this.fs.copyTpl(
          this.templatePath(`${template}.cmp`),
          this.destinationPath(
            path.join(outputdir, componentname, `${componentname}.cmp`)
          ),
          {}
        ),
        this.fs.copyTpl(
          this.templatePath('DefaultLightningCss.css'),
          this.destinationPath(
            path.join(outputdir, componentname, `${componentname}.css`)
          ),
          {}
        ),
        this.fs.copyTpl(
          this.templatePath('DefaultLightningDesign.design'),
          this.destinationPath(
            path.join(outputdir, componentname, `${componentname}.design`)
          ),
          {}
        ),
        this.fs.copyTpl(
          this.templatePath('DefaultLightningSVG.svg'),
          this.destinationPath(
            path.join(outputdir, componentname, `${componentname}.svg`)
          ),
          {}
        ),
        this.fs.copyTpl(
          this.templatePath('DefaultLightningController.js'),
          this.destinationPath(
            path.join(outputdir, componentname, `${componentname}Controller.js`)
          ),
          {}
        ),
        this.fs.copyTpl(
          this.templatePath('DefaultLightningHelper.js'),
          this.destinationPath(
            path.join(outputdir, componentname, `${componentname}Helper.js`)
          ),
          {}
        ),
        this.fs.copyTpl(
          this.templatePath('DefaultLightningRenderer.js'),
          this.destinationPath(
            path.join(outputdir, componentname, `${componentname}Renderer.js`)
          ),
          {}
        );
    }
    // tslint:disable-next-line:no-unused-expression
    if (type === 'lwc') {
      // lwc requires first letter of filename to be lowercase
      const fileName = `${componentname
        .substring(0, 1)
        .toLowerCase()}${componentname.substring(1)}`;

      // lwc's convention is for the class name to be Pascal Case
      const className = `${componentname
        .substring(0, 1)
        .toUpperCase()}${componentname.substring(1)}`;

      this.sourceRoot(
        path.join(__dirname, '..', 'templates', 'lightningcomponent', 'lwc')
      );
      this.fs.copyTpl(
        this.templatePath('DefaultLightningLWC.js'),
        this.destinationPath(path.join(outputdir, fileName, `${fileName}.js`)),
        { className }
      ),
        this.fs.copyTpl(
          this.templatePath('_.html'),
          this.destinationPath(
            path.join(outputdir, fileName, `${fileName}.html`)
          ),
          {}
        );
      if (!internal) {
        this.fs.copyTpl(
          this.templatePath('_js-meta.xml'),
          this.destinationPath(
            path.join(outputdir, fileName, `${fileName}.js-meta.xml`)
          ),
          { apiVersion: apiversion }
        );
      }
    }
  }
}
