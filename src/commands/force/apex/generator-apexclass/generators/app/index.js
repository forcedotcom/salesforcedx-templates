/* eslint-disable no-unused-vars */
"use strict";
var Generator = require('yeoman-generator');
module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: "input",
        name: "apiName",
        message: "Enter your API name"
      }
    ]);
  }
  writing () {
    this.fs.copyTpl(
      this.templatePath("DefaultApexClass.cls"),
      this.destinationPath(this.answers.apiName + ".cls"),
      { apiName: this.answers.apiName }
    );
  }
}


