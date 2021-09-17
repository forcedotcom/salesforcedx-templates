/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { LightningEventOptions } from '../utils/types';
import { SfdxGenerator } from './sfdxGenerator';

export default class LightningEventGenerator extends SfdxGenerator<
  LightningEventOptions
> {
  constructor(args: string | string[], options: LightningEventOptions) {
    super(args, options);
    this.sourceRootWithPartialPath('lightningevent');
  }

  public validateOptions() {
    CreateUtil.checkInputs(this.options.eventname);
    CreateUtil.checkInputs(this.options.template);

    const fileparts = path.resolve(this.options.outputdir).split(path.sep);
    if (!this.options.internal && !fileparts.includes('aura')) {
      throw new Error(nls.localize('MissingAuraDir'));
    }
  }

  public writing() {
    const {
      template,
      outputdir,
      eventname,
      apiversion,
      internal
    } = this.options;
    // tslint:disable-next-line:no-unused-expression
    if (!internal) {
      this.fs.copyTpl(
        this.templatePath('_auradefinitionbundle.evt-meta.xml'),
        this.destinationPath(
          path.join(outputdir, eventname, `${eventname}.evt-meta.xml`)
        ),
        {
          eventname,
          apiVersion: apiversion,
          description: nls.localize('LightningEventBundle')
        }
      );
    }
    this.fs.copyTpl(
      this.templatePath(`${template}.evt`),
      this.destinationPath(path.join(outputdir, eventname, `${eventname}.evt`)),
      {}
    );
  }
}
