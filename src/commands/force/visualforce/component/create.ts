/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { CreateUtil } from '../../../../utils/createUtil';
import VisualforceComponentGenerator from '../../../../generators/visualforceComponentGenerator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');
const visualforceComponentFileSuffix = /.component$/;

export default class VisualforceComponent extends SfdxCommand {
  public static examples = [
    '$ sfdx force:visualforce:component:create -n mycomponent -l mylabel',
    '$ sfdx force:visualforce:component:create -n mycomponent -l mylabel -d components'
  ];

  public static description = messages.getMessage(
    'VisualforceComponentCommandDescription'
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputdir'),
      default: process.cwd()
    }),
    apiversion: flags.builtin(),
    componentname: flags.string({
      char: 'n',
      description: messages.getMessage('visualforcecomponentname'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: messages.getMessage('template'),
      default: 'DefaultVFComponent',
      options: CreateUtil.getCommandTemplatesForFiletype(
        visualforceComponentFileSuffix,
        'visualforcecomponent'
      )
    }),
    label: flags.string({
      char: 'l',
      description: messages.getMessage('componentlabel'),
      required: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.componentname);
    CreateUtil.checkInputs(this.flags.template);

    return CreateUtil.runGenerator(VisualforceComponentGenerator, this);
  }
}
