/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import VisualforceComponentGenerator from '../../../../generators/visualforceComponentGenerator';
import { CreateUtil, TemplateCommand, MessageUtil } from '../../../../utils';

const visualforceComponentFileSuffix = /.component$/;
const VF_TYPE = MessageUtil.get('component');

export default class VisualforceComponent extends TemplateCommand {
  public static description = MessageUtil.buildDescription(
    'VisualforceDescription',
    false,
    [VF_TYPE]
  );
  public static examples = [
    '$ sfdx force:visualforce:component:create -n mycomponent -l mylabel',
    '$ sfdx force:visualforce:component:create -n mycomponent -l mylabel -d components'
  ];
  public static help = MessageUtil.buildHelpText(
    VisualforceComponent.examples,
    false
  );
  public static longDescription = MessageUtil.get(
    'VisualforceLongDescription',
    [VF_TYPE, VF_TYPE]
  );

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: MessageUtil.get('outputdir'),
      default: MessageUtil.get('CurrentWorkingDir')
    }),
    apiversion: flags.builtin(),
    componentname: flags.string({
      char: 'n',
      description: MessageUtil.get('visualforcecomponentname'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: MessageUtil.get('template'),
      default: 'DefaultVFComponent',
      options: CreateUtil.getCommandTemplatesForFiletype(
        visualforceComponentFileSuffix,
        'visualforcecomponent'
      )
    }),
    label: flags.string({
      char: 'l',
      description: MessageUtil.get('componentlabel'),
      required: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.componentname);
    CreateUtil.checkInputs(this.flags.template);

    return this.runGenerator(VisualforceComponentGenerator);
  }
}
