import * as path from 'path';
import * as Generator from 'yeoman-generator';
import { OptionsMap } from '../utils/types';

export default class VisualforcePageGenerator extends Generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, '..', 'templates', 'visualforcepage'));
    // @ts-ignore
    this.conflicter.force = false;
  }

  public writing() {
    const { template, outputdir, label, apiversion, pagename } = this.options;
    this.fs.copyTpl(
      this.templatePath(`${template}.page`),
      this.destinationPath(path.join(outputdir, `${pagename}.page`)),
      {}
    );
    this.fs.copyTpl(
      this.templatePath('_page.page-meta.xml'),
      this.destinationPath(path.join(outputdir, `${pagename}.page-meta.xml`)),
      { vfLabel: label, apiVersion: apiversion }
    );
  }
}
