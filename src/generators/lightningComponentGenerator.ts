/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { camelCaseToTitleCase } from '@salesforce/kit';
import * as path from 'path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { LightningComponentOptions } from '../utils/types';
import { SfdxGenerator } from './sfdxGenerator';

export default class LightningComponentGenerator extends SfdxGenerator<LightningComponentOptions> {
  constructor(args: string | string[], options: LightningComponentOptions) {
    super(args, options);
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.componentname);
    CreateUtil.checkInputs(this.options.template);

    const fileparts = path.resolve(this.outputdir).split(path.sep);

    if (!this.options.internal) {
      if (this.options.type === 'lwc' && !fileparts.includes('lwc')) {
        throw new Error(nls.localize('MissingLWCDir'));
      } else if (!fileparts.includes('aura') && this.options.type === 'aura') {
        throw new Error(nls.localize('MissingAuraDir'));
      }
    }

    if (
      CreateUtil.getCommandTemplatesInSubdirs('lightningcomponent', {
        subdir: this.options.type,
      }).indexOf(this.options.template) < 0
    ) {
      throw new Error(
        nls.localize('MissingLightningComponentTemplate', [
          this.options.template,
          this.options.type,
        ])
      );
    }
  }

  public writing(): void {
    const { template, componentname, type, internal } = this.options;

    if (type === 'aura') {
      this.sourceRootWithPartialPath(
        path.join('lightningcomponent', 'aura', template)
      );
      if (!internal) {
        this.fs.copyTpl(
          this.templatePath(`${template}.cmp-meta.xml`),
          this.destinationPath(
            path.join(
              this.outputdir,
              componentname,
              `${componentname}.cmp-meta.xml`
            )
          ),
          {
            componentname,
            description: nls.localize('LightningComponentBundle'),
            apiVersion: this.apiversion,
          }
        );
      }
      this.fs.copyTpl(
        this.templatePath(`${template}.auradoc`),
        this.destinationPath(
          path.join(this.outputdir, componentname, `${componentname}.auradoc`)
        ),
        {}
      );
      this.fs.copyTpl(
        this.templatePath(`${template}.cmp`),
        this.destinationPath(
          path.join(this.outputdir, componentname, `${componentname}.cmp`)
        ),
        {}
      );
      this.fs.copyTpl(
        this.templatePath(`${template}.css`),
        this.destinationPath(
          path.join(this.outputdir, componentname, `${componentname}.css`)
        ),
        {}
      );
      this.fs.copyTpl(
        this.templatePath(`${template}.design`),
        this.destinationPath(
          path.join(this.outputdir, componentname, `${componentname}.design`)
        ),
        {}
      );
      this.fs.copyTpl(
        this.templatePath(`${template}.svg`),
        this.destinationPath(
          path.join(this.outputdir, componentname, `${componentname}.svg`)
        ),
        {}
      );
      this.fs.copyTpl(
        this.templatePath(`${template}Controller.js`),
        this.destinationPath(
          path.join(
            this.outputdir,
            componentname,
            `${componentname}Controller.js`
          )
        ),
        {}
      );
      this.fs.copyTpl(
        this.templatePath(`${template}Helper.js`),
        this.destinationPath(
          path.join(this.outputdir, componentname, `${componentname}Helper.js`)
        ),
        {}
      );
      this.fs.copyTpl(
        this.templatePath(`${template}Renderer.js`),
        this.destinationPath(
          path.join(
            this.outputdir,
            componentname,
            `${componentname}Renderer.js`
          )
        ),
        {}
      );
    }

    if (type === 'lwc') {
      const pascalCaseComponentName = `${componentname
        .substring(0, 1)
        .toUpperCase()}${componentname.substring(1)}`;
      const camelCaseComponentName = `${componentname
        .substring(0, 1)
        .toLowerCase()}${componentname.substring(1)}`;
      const kebabCaseComponentName = componentname
        .match(
          /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
        )!
        .join('-')
        .toLowerCase();

      this.sourceRootWithPartialPath(
        path.join('lightningcomponent', 'lwc', template)
      );
      this.fs.copyTpl(
        this.templatePath(`${template}.js`),
        this.destinationPath(
          path.join(
            this.outputdir,
            camelCaseComponentName,
            `${camelCaseComponentName}.js`
          )
        ),
        { pascalCaseComponentName }
      );

      this.fs.copyTpl(
        this.templatePath(`${template}.html`),
        this.destinationPath(
          path.join(
            this.outputdir,
            camelCaseComponentName,
            `${camelCaseComponentName}.html`
          )
        ),
        {}
      );

      this.fs.copyTpl(
        this.templatePath(path.join(`__tests__`, `${template}.test.js`)),
        this.destinationPath(
          path.join(
            this.outputdir,
            camelCaseComponentName,
            `__tests__`,
            `${camelCaseComponentName}.test.js`
          )
        ),
        {
          pascalCaseComponentName,
          camelCaseComponentName,
          kebabCaseComponentName,
        }
      );

      if (!internal) {
        const masterLabel = camelCaseToTitleCase(componentname)
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        this.fs.copyTpl(
          this.templatePath(`${template}.js-meta.xml`),
          this.destinationPath(
            path.join(
              this.outputdir,
              camelCaseComponentName,
              `${camelCaseComponentName}.js-meta.xml`
            )
          ),
          { apiVersion: this.apiversion, masterLabel }
        );
      }
    }
  }
}
