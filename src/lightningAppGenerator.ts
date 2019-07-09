import * as path from 'path';
// tslint:disable-next-line:no-var-requires
const generator = require('yeoman-generator');

export interface StringKeyValueObject<V> {
  [opt: string]: V;
}
export type OptionsMap = StringKeyValueObject<string>;
export type Answers = StringKeyValueObject<string>;

export default class LightningAppGenerator extends generator {
  constructor(args: string | string[], options: OptionsMap) {
    super(args, options);
    this.sourceRoot(__dirname);
    // This disables yeoman feature for overwriting files prompt
    this.conflicter.force = true;
  }
  public writing() {
    const { template, outputdir, appname, apiversion } = this.options;
    this.fs.copyTpl(
      this.templatePath(
        path.join(
          'commands',
          'force',
          'lightning',
          'app',
          'templates',
          '_auradefinitionbundle.app-meta.xml'
        )
      ),
      this.destinationPath(
        path.join(outputdir, appname, appname + '.app-meta.xml')
      ),
      {
        apiName: appname,
        apiVersion: apiversion,
        description: 'A Lightning Application Bundle'
      }
    ),
      this.fs.copyTpl(
        this.templatePath(
          path.join(
            'commands',
            'force',
            'lightning',
            'app',
            'templates',
            template + '.app'
          )
        ),
        this.destinationPath(path.join(outputdir, appname, appname + '.app'))
      ),
      this.fs.copyTpl(
        this.templatePath(
          path.join(
            'commands',
            'force',
            'lightning',
            'app',
            'templates',
            'DefaultLightningAuradoc.auradoc'
          )
        ),
        this.destinationPath(
          path.join(outputdir, appname, appname + '.auradoc')
        )
      ),
      this.fs.copyTpl(
        this.templatePath(
          path.join(
            'commands',
            'force',
            'lightning',
            'app',
            'templates',
            'DefaultLightningController.js'
          )
        ),
        this.destinationPath(
          path.join(outputdir, appname, appname + 'Controller.js')
        )
      ),
      this.fs.copyTpl(
        this.templatePath(
          path.join(
            'commands',
            'force',
            'lightning',
            'app',
            'templates',
            'DefaultLightningCss.css'
          )
        ),
        this.destinationPath(path.join(outputdir, appname, appname + '.css'))
      ),
      this.fs.copyTpl(
        this.templatePath(
          path.join(
            'commands',
            'force',
            'lightning',
            'app',
            'templates',
            'DefaultLightningHelper.js'
          )
        ),
        this.destinationPath(
          path.join(outputdir, appname, appname + 'Helper.css')
        )
      ),
      this.fs.copyTpl(
        this.templatePath(
          path.join(
            'commands',
            'force',
            'lightning',
            'app',
            'templates',
            'DefaultLightningRenderer.js'
          )
        ),
        this.destinationPath(
          path.join(outputdir, appname, appname + 'Renderer.js')
        )
      ),
      this.fs.copyTpl(
        this.templatePath(
          path.join(
            'commands',
            'force',
            'lightning',
            'app',
            'templates',
            'DefaultLightningSVG.svg'
          )
        ),
        this.destinationPath(path.join(outputdir, appname, appname + 'SVG.svg'))
      );
  }
}
