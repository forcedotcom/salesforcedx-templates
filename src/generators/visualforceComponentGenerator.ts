import * as path from 'path';
import { OptionsMap } from './types';
// tslint:disable-next-line:no-var-requires
const generator = require('yeoman-generator');

export default class VisualforceComponentGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(
      path.join(__dirname, '..', 'templates', 'visualforcecomponent')
    );
    // This disables yeoman feature for overwriting files prompt
    this.conflicter.force = true;
  }

  public writing() {
    const {
      template,
      outputdir,
      label,
      apiversion,
      componentname
    } = this.options;
    this.fs.copyTpl(
      this.templatePath(`${template}.component`),
      this.destinationPath(path.join(outputdir, `${componentname}.component`))
    );
    this.fs.copyTpl(
      this.templatePath('_component.component-meta.xml'),
      this.destinationPath(
        path.join(outputdir, `${componentname}.component-meta.xml`)
      ),
      { vfLabel: label, apiVersion: apiversion, vfName: componentname }
    );
  }
}
