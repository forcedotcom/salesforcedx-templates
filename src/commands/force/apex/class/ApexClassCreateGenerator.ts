import { Command } from '@oclif/config';
import { flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { resolveNaptr } from 'dns';
import { create } from 'domain';
import * as yoEnvironment from 'yeoman-environment';
// tslint:disable-next-line:no-var-requires
const generator = require('yeoman-generator');

export default class ApexClassCreateGenerator extends generator {
        // public async prompting() {
        //     this.answers = await this.prompt([
        //         {
        //         type: 'input',
        //         name: 'apiName',
        //         message: 'Enter your API name'
        //         }
        //     ]);
        // }
        public  writing(args: string) {
            this.fs.copyTpl(
            this.templatePath('DefaultApexClass.cls'),
            this.destinationPath(args + '.cls'),
            { apiName: args }
                );
            }
       // public async create() {
            // tslint:disable-next-line:no-any
           // });
    }
