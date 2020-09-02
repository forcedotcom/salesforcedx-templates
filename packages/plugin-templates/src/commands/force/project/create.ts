/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import ProjectGenerator from '@salesforce/templates/lib/generators/projectGenerator';
import { AnyJson } from '@salesforce/ts-types';
import { MessageUtil, TemplateCommand } from '../../../utils';

export default class Project extends TemplateCommand {
  public static description = MessageUtil.buildDescription(
    'ProjectDescription',
    false
  );
  public static examples = [
    '$ sfdx force:project:create --projectname mywork',
    '$ sfdx force:project:create --projectname mywork --defaultpackagedir myapp',
    '$ sfdx force:project:create --projectname mywork --defaultpackagedir myapp --manifest',
    '$ sfdx force:project:create --projectname mywork --template empty'
  ];
  public static help = MessageUtil.buildHelpText(Project.examples, false);
  public static longDescription = MessageUtil.get('ProjectLongDescription');

  protected static flagsConfig = {
    projectname: flags.string({
      char: 'n',
      description: MessageUtil.get('ProjectNameFlagDescription'),
      longDescription: MessageUtil.get('ProjectNameFlagLongDescription'),
      required: true
    }),
    template: flags.string({
      char: 't',
      description: MessageUtil.get('ProjectTemplateFlagDescription'),
      longDescription: MessageUtil.get('ProjectTemplateFlagLongDescription'),
      default: 'standard',
      options: ['standard', 'empty', 'analytics']
    }),
    outputdir: flags.string({
      char: 'd',
      description: MessageUtil.get('OutputDirFlagDescription'),
      longDescription: MessageUtil.get('OutputDirFlagLongDescription'),
      default: '.'
    }),
    namespace: flags.string({
      char: 's',
      description: MessageUtil.get('ProjectNamespaceFlagDescription'),
      longDescription: MessageUtil.get('ProjectNamespaceFlagLongDescription'),
      default: ''
    }),
    defaultpackagedir: flags.string({
      char: 'p',
      description: MessageUtil.get('ProjectPackageFlagDescription'),
      longDescription: MessageUtil.get('ProjectPackageFlagLongDescription'),
      default: 'force-app'
    }),
    manifest: flags.boolean({
      char: 'x',
      description: MessageUtil.get('ProjectManifestFlagDescription'),
      longDescription: MessageUtil.get('ProjectManifestFlagLongDescription')
    }),
    loginurl: flags.string({
      char: 'l',
      description: MessageUtil.get('ProjectLoginUrlDescription'),
      longDescription: MessageUtil.get('ProjectLoginUrlLongDescription'),
      default: 'https://login.salesforce.com',
      hidden: true
    })
  };
  public async run(): Promise<AnyJson> {
    // namespace is a reserved keyword for the generator

    this.flags.ns = this.flags.namespace;

    return this.runGenerator(ProjectGenerator);
  }
}
