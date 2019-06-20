
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
        this.argument('apiName', {
            desc: 'The name of the Apex class',
            required: false,
            type: String,
            defaults: ''
        },
        'template', {
            desc: 'The name of the template',
            type: String,
            required: false,
            defaults: 'DefaultApexClass'
        });
        // this.argument('apiVersion', {
        //     desc: 'The name of the apiVersion',
        //     required: false,
        //     type: 'Number',
        //     defaults: '44.0'
        // });
        // this.argument('outputdir', {
        //     desc: 'The name of the output directory',
        //     required: false,
        //     type: 'String',
        //     defaults: ''
        // });
    }
    public writing() {
        this.fs.copyTpl(
        this.templatePath('templates/' + this.options['template'] + '.cls'),
        this.destinationPath(this.options['apiName'] + '.cls'),
        { apiName: this.options['apiName'] }
            ),
        this.fs.copyTpl(
        this.templatePath('templates/_class.cls-meta.xml'),
        this.destinationPath( this.options['apiName'] + '.cls-meta.xml'),
        { apiName: this.options['apiName'],
        apiVersion: this.options['apiVersion'] }
            );

    }
}
