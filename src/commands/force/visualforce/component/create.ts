/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import VisualforceComponentGenerator from '../../../../generators/visualforceComponentGenerator';
import { CreateUtil, MessageUtil, TemplateCommand } from '../../../../utils';

const visualforceComponentFileSuffix = /.component$/;
const VF_TYPE = MessageUtil.get('Component');

export default class VisualforceComponent extends TemplateCommand {
  public static description = MessageUtil.buildDescription(
    'VFDescription',
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
  public static longDescription = MessageUtil.get('VFLongDescription', [
    VF_TYPE,
    VF_TYPE
  ]);

  protected static flagsConfig = {
    template: flags.string({
      char: 't',
      description: MessageUtil.get('TemplateFlagDescription'),
      longDescription: MessageUtil.get('TemplateFlagLongDescription'),
      default: 'DefaultVFComponent',
      options: CreateUtil.getCommandTemplatesForFiletype(
        visualforceComponentFileSuffix,
        'visualforcecomponent'
      )
    }),
    outputdir: flags.string({
      char: 'd',
      description: MessageUtil.get('OutputDirFlagDescription'),
      longDescription: MessageUtil.get('OutputDirFlagLongDescription'),
      default: process.cwd()
    }),
    componentname: flags.string({
      char: 'n',
      description: MessageUtil.get('VFNameFlagDescription', [VF_TYPE]),
      longDescription: MessageUtil.get('VFNameFlagLongDescription', [VF_TYPE]),
      required: true
    }),
    apiversion: flags.builtin(),
    label: flags.string({
      char: 'l',
      description: MessageUtil.get('VFLabelFlagDescription', [VF_TYPE]),
      longDescription: MessageUtil.get('VFLabelFlagLongDescription', [VF_TYPE]),
      required: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.componentname);
    CreateUtil.checkInputs(this.flags.template);

    return this.runGenerator(VisualforceComponentGenerator);
  }
}
