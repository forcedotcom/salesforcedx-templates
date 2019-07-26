import * as path from 'path';
import { OptionsMap } from './types';
// tslint:disable-next-line:no-var-requires
const generator = require('yeoman-generator');

export default class VisualforcePageGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'visualforcepage'));
    // This disables yeoman feature for overwriting files prompt
    this.conflicter.force = true;
  }

  public writing() {
    const { template, outputdir, label, apiversion, pagename } = this.options;
    this.fs.copyTpl(
      this.templatePath(`${template}.page`),
      this.destinationPath(path.join(outputdir, `${pagename}.page`))
    );
    this.fs.copyTpl(
      this.templatePath('_page.page-meta.xml'),
      this.destinationPath(path.join(outputdir, `${pagename}.page-meta.xml`)),
      { vfLabel: label, apiVersion: apiversion }
    );
  }
}
