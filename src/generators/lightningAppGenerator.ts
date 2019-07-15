import { Messages } from '@salesforce/core';
import * as path from 'path';
// tslint:disable-next-line:no-var-requires
const generator = require('yeoman-generator');
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'messages');

export interface StringKeyValueObject<V> {
  [opt: string]: V;
}
export type OptionsMap = StringKeyValueObject<string>;
export type Answers = StringKeyValueObject<string>;

export default class LightningAppGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'lightningapp'));
    // This disables yeoman feature for overwriting files prompt
    this.conflicter.force = true;
  }
  public writing() {
    const { template, outputdir, appname, apiversion } = this.options;
    this.fs.copyTpl(
      this.templatePath('_auradefinitionbundle.app-meta.xml'),
      this.destinationPath(
        path.join(outputdir, appname, `${appname}.app-meta.xml`)
      ),
      {
        apiVersion: apiversion,
        description: messages.getMessage('LightningAppBundle')
      }
    ),
      this.fs.copyTpl(
        this.templatePath(`${template}.app`),
        this.destinationPath(path.join(outputdir, appname, `${appname}.app`))
      ),
      this.fs.copyTpl(
        this.templatePath('DefaultLightningAuradoc.auradoc'),
        this.destinationPath(
          path.join(outputdir, appname, `${appname}.auradoc`)
        )
      ),
      this.fs.copyTpl(
        this.templatePath('DefaultLightningController.js'),
        this.destinationPath(
          path.join(outputdir, appname, `${appname}Controller.js`)
        )
      ),
      this.fs.copyTpl(
        this.templatePath('DefaultLightningCss.css'),
        this.destinationPath(path.join(outputdir, appname, `${appname}.css`))
      ),
      this.fs.copyTpl(
        this.templatePath('DefaultLightningHelper.js'),
        this.destinationPath(
          path.join(outputdir, appname, `${appname}Helper.js`)
        )
      ),
      this.fs.copyTpl(
        this.templatePath('DefaultLightningRenderer.js'),
        this.destinationPath(
          path.join(outputdir, appname, `${appname}Renderer.js`)
        )
      ),
      this.fs.copyTpl(
        this.templatePath('DefaultLightningSVG.svg'),
        this.destinationPath(path.join(outputdir, appname, `${appname}.svg`))
      );
  }
}
