import * as path from 'path';
// tslint:disable-next-line:no-var-requires
const GENERATOR = require('yeoman-generator');

export interface StringKeyValueObject<V> {
  [opt: string]: V;
}
export type OptionsMap = StringKeyValueObject<string>;
export type Answers = StringKeyValueObject<string>;

export default class ApexClassCreateGenerator extends GENERATOR {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(__dirname);
  }

    // Use arguments from create class to copy and edit templates.
    public writing() {
        this.fs.copyTpl(
        this.templatePath(path.join('templates', this.options['template'] + '.cls')),
        this.destinationPath(path.join(this.options['outputdir'] , this.options['classname'] + '.cls')),
        { apiName: this.options['classname'] }
            ),
        this.fs.copyTpl(
        this.templatePath(path.join('templates', '_class.cls-meta.xml')),
        this.destinationPath(path.join(this.options['outputdir'] , this.options['classname'] + '.cls-meta.xml')),
        { apiName: this.options['classname'], apiVersion: this.options['apiversion'] }
            );

    }
}
