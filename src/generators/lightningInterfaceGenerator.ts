import * as path from 'path';
import { OptionsMap } from './types';
// tslint:disable-next-line: no-var-requires
const generator = require('yeoman-generator');

export default class LightningInterfaceGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(
      path.join(__dirname, '..', 'templates', 'lightninginterface')
    );
    // This disables yeoman feature for overwriting files prompt
    this.conflicter.force = true;
  }
  public writing() {
    const { template, outputdir, interfacename, apiversion } = this.options;
    this.fs.copyTpl(
      this.templatePath('_auradefinitionbundle.intf-meta.xml'),
      this.destinationPath(
        path.join(outputdir, interfacename, `${interfacename}.intf-meta.xml`)
      ),
      { apiVersion: apiversion }
    );
    this.fs.copyTpl(
      this.templatePath(`${template}.intf`),
      this.destinationPath(
        path.join(outputdir, interfacename, `${interfacename}.intf`)
      )
    );
  }
}
