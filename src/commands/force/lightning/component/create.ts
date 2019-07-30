/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import { CreateUtil } from '../../../../createUtil';
import LightningComponentGenerator from '../../../../generators/lightningComponentGenerator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'messages');
const lightningComponentFileSuffix = /.cmp$/;

export default class LightningComponent extends SfdxCommand {
  public static examples = [
    '$ sfdx force:lightning:component:create -n mycomponent',
    '$ sfdx force:lightning:component:create -n mycomponent --type lwc',
    '$ sfdx force:lightning:component:create -n mycomponent -d aura',
    '$ sfdx force:lightning:component:create -n mycomponent --type lwc -d lwc'
  ];

  public static description = messages.getMessage(
    'LightningComponentCommandDescription'
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputdir'),
      required: false,
      default: process.cwd()
    }),
    apiversion: flags.builtin(),
    componentname: flags.string({
      char: 'n',
      description: messages.getMessage('componentname'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: messages.getMessage('template'),
      default: 'DefaultLightningCmp',
      options: CreateUtil.getCommandTemplatesForFiletype(
        lightningComponentFileSuffix,
        'lightningcomponent'
      )
    }),
    type: flags.string({
      description: messages.getMessage('ComponentType'),
      options: ['aura', 'lwc'],
      default: 'aura'
    }),
    internal: flags.boolean({
      char: 'i',
      description: messages.getMessage('internal'),
      hidden: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.componentname);
    CreateUtil.checkInputs(this.flags.template);

    const filepath = path.resolve(this.flags.outputdir);

    const fileparts = filepath.split(path.sep);

    // tslint:disable-next-line:no-unused-expression
    if (!this.flags.internal) {
      if (this.flags.type === 'lwc') {
        if (!fileparts.includes('lwc')) {
          throw new Error(messages.getMessage('MissingLWCDir'));
        }
      } else {
        if (!fileparts.includes('aura')) {
          throw new Error(messages.getMessage('MissingAuraDir'));
        }
      }
    }

    this.log(`target dir = ${filepath}`);
    return CreateUtil.runGenerator(LightningComponentGenerator, this.flags);
  }
}
