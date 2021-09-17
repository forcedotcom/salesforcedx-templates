/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { extension } from 'mime-types';
import * as path from 'path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { StaticResourceOptions } from '../utils/types';
import { SfdxGenerator } from './sfdxGenerator';

const EXTENSION_TEMPLATES = ['js', 'css', 'json', 'txt'];

export default class StaticResourceGenerator extends SfdxGenerator<
  StaticResourceOptions
> {
  constructor(args: string | string[], options: StaticResourceOptions) {
    super(args, options);
    this.sourceRootWithPartialPath('staticresource');
  }

  public validateOptions() {
    CreateUtil.checkInputs(this.options.resourcename);

    if (!extension(this.options.contenttype.toLowerCase())) {
      throw new Error(nls.localize('InvalidMimeType'));
    }
  }

  public writing() {
    const { outputdir, resourcename, contenttype } = this.options;

    const ext = extension(contenttype);

    if (ext && EXTENSION_TEMPLATES.includes(ext)) {
      // For types that we have default file, write that (js, css, txt, json)
      this.fs.copyTpl(
        this.templatePath(`empty.${ext}`),
        this.destinationPath(path.join(outputdir, `${resourcename}.${ext}`)),
        {}
      );
    } else if (ext === 'zip') {
      // For zip files, write an empty js file in a folder
      this.fs.copyTpl(
        this.templatePath('_gitkeep'),
        this.destinationPath(path.join(outputdir, resourcename, '.gitkeep')),
        {}
      );
    } else {
      // For all other mime types write a generic .resource file
      this.fs.copyTpl(
        this.templatePath('empty.resource'),
        this.destinationPath(path.join(outputdir, `${resourcename}.resource`)),
        {}
      );
    }

    this.fs.copyTpl(
      this.templatePath('_staticresource.resource-meta.xml'),
      this.destinationPath(
        path.join(outputdir, `${resourcename}.resource-meta.xml`)
      ),
      {
        contentType: contenttype
      }
    );
  }
}
