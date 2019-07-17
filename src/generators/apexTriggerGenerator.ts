import * as path from 'path';
import { OptionsMap } from './types';
// tslint:disable-next-line:no-var-requires
const generator = require('yeoman-generator');
export default class ApexTriggerGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'apextrigger'));

    // This disables yeoman feature for overwriting files prompt
    this.conflicter.force = true;
  }
  public writing() {
    const {
      template,
      outputdir,
      triggername,
      apiversion,
      triggerevents,
      sobject
    } = this.options;
    this.fs.copyTpl(
      this.templatePath(`${template}.trigger`),
      this.destinationPath(path.join(outputdir, `${triggername}.trigger`)),
      { triggername, sobject, triggerEvents: triggerevents }
    ),
      this.fs.copyTpl(
        this.templatePath('_trigger.trigger-meta.xml'),
        this.destinationPath(
          path.join(outputdir, `${triggername}.trigger-meta.xml`)
        ),
        { apiVersion: apiversion }
      );
  }
}
