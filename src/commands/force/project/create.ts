/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import ProjectGenerator from '../../../generators/projectGenerator';
import { CreateUtil, TemplateCommand } from '../../../utils';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('salesforcedx-templates', 'messages');

export default class Project extends TemplateCommand {
  public static examples = [
    '$ sfdx force:project:create --projectname mywork',
    '$ sfdx force:project:create --projectname mywork --defaultpackagedir myapp',
    '$ sfdx force:project:create --projectname mywork --defaultpackagedir myapp --manifest',
    '$ sfdx force:project:create --projectname mywork --template empty'
  ];
  public static description = messages.getMessage('ProjectCommandDescription');

  protected static flagsConfig = {
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputdir'),
      default: process.cwd()
    }),
    projectname: flags.string({
      char: 'n',
      description: messages.getMessage('projectname'),
      required: true
    }),
    defaultpackagedir: flags.string({
      char: 'p',
      description: messages.getMessage('defaultpackagedir'),
      default: 'force-app'
    }),
    namespace: flags.string({
      char: 's',
      description: messages.getMessage('namespace'),
      default: ''
    }),
    template: flags.string({
      char: 't',
      description: messages.getMessage('template'),
      default: 'standard',
      options: ['standard', 'empty', 'analytics']
    }),
    manifest: flags.boolean({
      char: 'x',
      description: messages.getMessage('manifest')
    }),
    loginurl: flags.string({
      char: 'l',
      description: messages.getMessage('loginurl'),
      default: 'https://login.salesforce.com',
      hidden: true
    })
  };
  public async run(): Promise<AnyJson> {
    CreateUtil.checkInputs(this.flags.projectname);
    CreateUtil.checkInputs(this.flags.template);

    // namespace is a reserved keyword for the generator
    this.flags.ns = this.flags.namespace;

    // TODO: update the latest apiversion
    this.flags.sourceApiVersion = '47.0';

    this.flags.loginURL = this.flags.loginurl;

    return this.runGenerator(ProjectGenerator);
  }
}
