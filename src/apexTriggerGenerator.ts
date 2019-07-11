import * as path from 'path';
// tslint:disable-next-line:no-var-requires
const generator = require('yeoman-generator');
export interface StringKeyValueObject<V> {
  [opt: string]: V;
}
export type OptionsMap = StringKeyValueObject<string>;
export type Answers = StringKeyValueObject<string>;
export default class ApexTriggerGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(__dirname);

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
      this.templatePath(
        path.join(
          'commands',
          'force',
          'apex',
          'trigger',
          'templates',
          `${template}.trigger`
        )
      ),
      this.destinationPath(path.join(outputdir, `${triggername}.trigger`)),
      { triggername, sobject, triggerEvents: triggerevents }
    ),
      this.fs.copyTpl(
        this.templatePath(
          path.join(
            'commands',
            'force',
            'apex',
            'trigger',
            'templates',
            '_trigger.trigger-meta.xml'
          )
        ),
        this.destinationPath(
          path.join(outputdir, `${triggername}.trigger-meta.xml`)
        ),
        { apiVersion: apiversion }
      );
  }
}
