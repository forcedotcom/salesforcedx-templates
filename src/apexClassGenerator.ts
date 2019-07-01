import * as path from 'path';
// tslint:disable-next-line:no-var-requires
const GENERATOR = require('yeoman-generator');

export interface StringKeyValueObject<V> {
  [opt: string]: V;
}
export type OptionsMap = StringKeyValueObject<string>;
export type Answers = StringKeyValueObject<string>;

export default class ApexClassGenerator extends GENERATOR {
    constructor(args: string | string[], options: OptionsMap) {
        super(args, options);
        this.sourceRoot (__dirname);

        // This disables yeoman feature for overwriting files prompt
        this.conflicter.force = true;
    }

    public writing() {
        const {template, outputdir, classname, apiversion} = this.options;
        this.fs.copyTpl(
        this.templatePath(path.join('commands', 'force', 'apex', 'class', 'templates', template + '.cls')),
        this.destinationPath(path.join(outputdir , classname + '.cls')),
        { apiName: classname }
            ),
        this.fs.copyTpl(
        this.templatePath(path.join('commands', 'force', 'apex', 'class', 'templates', '_class.cls-meta.xml')),
        this.destinationPath(path.join(outputdir , classname + '.cls-meta.xml')),
        { apiName: classname, apiVersion: apiversion }
            );

    }
}
