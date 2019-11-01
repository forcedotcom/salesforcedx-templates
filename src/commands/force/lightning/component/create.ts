/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// tslint:disable:no-unused-expression

import { flags } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import LightningComponentGenerator from '../../../../generators/lightningComponentGenerator';
import { CreateUtil, TemplateCommand, MessageUtil } from '../../../../utils';

const lightningComponentFileSuffix = /.cmp$/;

export default class LightningComponent extends TemplateCommand {
  public static description = MessageUtil.get('LightningComponentDescription');
  public static examples = [
    '$ sfdx force:lightning:component:create -n mycomponent',
    '$ sfdx force:lightning:component:create -n mycomponent --type lwc',
    '$ sfdx force:lightning:component:create -n mycomponent -d aura',
    '$ sfdx force:lightning:component:create -n mycomponent --type lwc -d lwc'
  ];
  public static help = MessageUtil.buildHelpText(
    LightningComponent.examples,
    true,
    MessageUtil.get('LightningComponentHelpExtra')
  );
  public static longDescription = MessageUtil.get(
    'LightningComponentLongDescription'
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: MessageUtil.get('outputdir'),
      required: false,
      default: MessageUtil.get('CurrentWorkingDir')
    }),
    apiversion: flags.builtin(),
    componentname: flags.string({
      char: 'n',
      description: MessageUtil.get('componentname'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: MessageUtil.get('template'),
      default: 'DefaultLightningCmp',
      options: CreateUtil.getCommandTemplatesForFiletype(
        lightningComponentFileSuffix,
        'lightningcomponent'
      )
    }),
    type: flags.string({
      description: MessageUtil.get('ComponentType'),
      options: ['aura', 'lwc'],
      default: 'aura'
    }),
    internal: flags.boolean({
      char: 'i',
      description: MessageUtil.get('internal'),
      hidden: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.componentname);
    CreateUtil.checkInputs(this.flags.template);

    // lwc requires first letter lowercase
    if (this.flags.type === 'lwc') {
      this.flags.componentname = `${this.flags.componentname
        .substring(0, 1)
        .toLowerCase()}${this.flags.componentname.substring(1)}`;
    }

    const fileparts = path.resolve(this.flags.outputdir).split(path.sep);

    if (!this.flags.internal) {
      if (this.flags.type === 'lwc' && !fileparts.includes('lwc')) {
        throw new Error(MessageUtil.get('MissingLWCDir'));
      } else if (!fileparts.includes('aura') && this.flags.type === 'aura') {
        throw new Error(MessageUtil.get('MissingAuraDir'));
      }
    }

    return this.runGenerator(LightningComponentGenerator);
  }
}
