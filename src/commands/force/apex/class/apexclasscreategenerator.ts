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
        this.sourceRoot (__dirname);
    }

    // Use arguments from create class to copy and edit templates.
    public writing() {
        this.fs.copyTpl(
        this.templatePath('commands/force/apex/class/templates/' + this.options['template'] + '.cls'),
        this.destinationPath(this.options['outputdir'] + '/' + this.options['apiName'] + '.cls'),
        { apiName: this.options['apiName'] }
            ),
        this.fs.copyTpl(
        this.templatePath('commands/force/apex/class/templates/_class.cls-meta.xml'),
        this.destinationPath(this.options['outputdir'] + '/' + this.options['apiName'] + '.cls-meta.xml'),
        { apiName: this.options['apiName'], apiVersion: this.options['apiVersion'] }
            );

    }
}
