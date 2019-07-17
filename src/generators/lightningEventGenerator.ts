import * as path from 'path';
import { OptionsMap } from './types';
// tslint:disable-next-line:no-var-requires
const generator = require('yeoman-generator');

export default class LightningEventGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'lightningevent'));
    // This disables yeoman feature for overwriting files prompt
    this.conflicter.force = true;
  }
  public writing() {
    const { template, outputdir, eventname, apiversion } = this.options;
    this.fs.copyTpl(
      this.templatePath('_auradefinitionbundle.evt-meta.xml'),
      this.destinationPath(
        path.join(outputdir, eventname, `${eventname}.evt-meta.xml`)
      ),
      { eventname, apiVersion: apiversion }
    );
    this.fs.copyTpl(
      this.templatePath(`${template}.evt`),
      this.destinationPath(path.join(outputdir, eventname, `${eventname}.evt`))
    );
  }
}
