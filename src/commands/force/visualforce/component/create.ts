import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as path from 'path';
import { CreateUtil } from '../../../../createUtil';
import VisualforceComponentGenerator from '../../../../generators/visualforceComponentGenerator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'messages');
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
      description: messages.getMessage('label'),
      required: true
    })
  };

  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.componentname);
    CreateUtil.checkInputs(this.flags.template);

    const filepath = path.resolve(this.flags.outputdir);

    this.log(`target dir = ${filepath}`);
    return CreateUtil.runGenerator(VisualforceComponentGenerator, this.flags);
  }
}
