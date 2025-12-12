/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { camelCaseToTitleCase } from '@salesforce/kit';
import * as path from 'path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { WebApplicationOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class WebApplicationGenerator extends BaseGenerator<WebApplicationOptions> {
  constructor(options: WebApplicationOptions) {
    super(options);
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.webappname);
    CreateUtil.checkInputs(this.options.template);

    const fileparts = path.resolve(this.outputdir).split(path.sep);
    if (!this.options.internal && !fileparts.includes('webApplications')) {
      throw new Error(nls.localize('MissingWebApplicationsDir'));
    }
  }

  public async generate(): Promise<void> {
    const { webappname } = this.options;
    const template = this.options.template.toLowerCase();
    const masterLabel =
      this.options.masterlabel || camelCaseToTitleCase(webappname);
    const webappDir = path.join(this.outputdir, webappname);

    this.sourceRootWithPartialPath(
      path.join(
        'webapplication',
        template === 'reactbasic' ? 'reactbasic' : 'webappbasic'
      )
    );

    await this.render(
      this.templatePath('_webapplication.webApplication-meta.xml'),
      this.destinationPath(
        path.join(webappDir, `${webappname}.webApplication-meta.xml`)
      ),
      { apiVersion: this.apiversion, masterLabel }
    );

    await this.render(
      this.templatePath('index.html'),
      this.destinationPath(path.join(webappDir, 'index.html')),
      { masterLabel }
    );

    await this.render(
      this.templatePath('webapp.json'),
      this.destinationPath(path.join(webappDir, 'webapp.json')),
      {}
    );

    if (template === 'reactbasic') {
      await this.render(
        this.templatePath('package.json'),
        this.destinationPath(path.join(webappDir, 'package.json')),
        { webappname }
      );
      await this.render(
        this.templatePath('vite.config.ts'),
        this.destinationPath(path.join(webappDir, 'vite.config.ts')),
        {}
      );
      await this.render(
        this.templatePath('tsconfig.json'),
        this.destinationPath(path.join(webappDir, 'tsconfig.json')),
        {}
      );
      await this.render(
        this.templatePath('tsconfig.node.json'),
        this.destinationPath(path.join(webappDir, 'tsconfig.node.json')),
        {}
      );
      await this.render(
        this.templatePath('tailwind.config.js'),
        this.destinationPath(path.join(webappDir, 'tailwind.config.js')),
        {}
      );
      await this.render(
        this.templatePath('postcss.config.js'),
        this.destinationPath(path.join(webappDir, 'postcss.config.js')),
        {}
      );

      await this.render(
        this.templatePath(path.join('src', 'main.tsx')),
        this.destinationPath(path.join(webappDir, 'src', 'main.tsx')),
        {}
      );
      await this.render(
        this.templatePath(path.join('src', 'App.tsx')),
        this.destinationPath(path.join(webappDir, 'src', 'App.tsx')),
        {}
      );
      await this.render(
        this.templatePath(path.join('src', 'routes.ts')),
        this.destinationPath(path.join(webappDir, 'src', 'routes.ts')),
        {}
      );
      await this.render(
        this.templatePath(path.join('src', 'vite-env.d.ts')),
        this.destinationPath(path.join(webappDir, 'src', 'vite-env.d.ts')),
        {}
      );

      await this.render(
        this.templatePath(path.join('src', 'components', 'Navigation.tsx')),
        this.destinationPath(
          path.join(webappDir, 'src', 'components', 'Navigation.tsx')
        ),
        {}
      );

      await this.render(
        this.templatePath(path.join('src', 'pages', 'Home.tsx')),
        this.destinationPath(path.join(webappDir, 'src', 'pages', 'Home.tsx')),
        {}
      );
      await this.render(
        this.templatePath(path.join('src', 'pages', 'About.tsx')),
        this.destinationPath(path.join(webappDir, 'src', 'pages', 'About.tsx')),
        {}
      );
      await this.render(
        this.templatePath(path.join('src', 'pages', 'NotFound.tsx')),
        this.destinationPath(
          path.join(webappDir, 'src', 'pages', 'NotFound.tsx')
        ),
        {}
      );

      await this.render(
        this.templatePath(path.join('src', 'styles', 'global.css')),
        this.destinationPath(
          path.join(webappDir, 'src', 'styles', 'global.css')
        ),
        {}
      );

      await this.render(
        this.templatePath(path.join('src', 'test-setup', 'setup.ts')),
        this.destinationPath(
          path.join(webappDir, 'src', 'test-setup', 'setup.ts')
        ),
        {}
      );
    }
  }
}
