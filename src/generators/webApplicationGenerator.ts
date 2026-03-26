/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { camelCaseToTitleCase } from '@salesforce/kit';
import * as path from 'path';
import { CreateUtil } from '../utils';
import { WEBUI_DIR } from '../utils/constants';
import { WebApplicationOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class WebApplicationGenerator extends BaseGenerator<WebApplicationOptions> {
  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.webappname);
    CreateUtil.checkInputs(this.options.template);

    // Ensure output directory includes 'webui' folder
    if (!this.options.internal) {
      const fileparts = path
        .resolve(this.outputdir)
        .split(path.sep)
        .filter(Boolean);
      const endsWithWebui = fileparts[fileparts.length - 1] === WEBUI_DIR;
      if (!endsWithWebui) {
        this.outputdir = path.join(this.outputdir, WEBUI_DIR);
      }
    }
  }

  public async generate(): Promise<void> {
    const { webappname } = this.options;
    const template = this.options.template.toLowerCase();
    const masterLabel =
      this.options.masterlabel || camelCaseToTitleCase(webappname);
    const webappDir = path.join(this.outputdir, webappname);

    switch (template) {
      case 'reactbasic':
        await this.generateReactBasic(webappDir, webappname, masterLabel);
        break;
      default:
        await this.generateDefault(webappDir, webappname, masterLabel);
    }
  }

  private async generateDefault(
    webappDir: string,
    webappname: string,
    masterLabel: string
  ): Promise<void> {
    this.sourceRootWithPartialPath(path.join('webapplication', 'webappbasic'));

    await this.render(
      this.templatePath('_webapplication.webapplication-meta.xml'),
      this.destinationPath(
        path.join(webappDir, `${webappname}.webapplication-meta.xml`)
      ),
      { apiVersion: this.apiversion, masterLabel }
    );

    const templatePath = this.sourceRoot();
    await this.copyDirectoryRecursive(
      templatePath,
      webappDir,
      new Set(['_webapplication.webapplication-meta.xml'])
    );
  }

  private async generateReactBasic(
    webappDir: string,
    webappname: string,
    masterLabel: string
  ): Promise<void> {
    this.sourceRootWithPartialPath(path.join('webapplication', 'reactbasic'));

    await this.render(
      this.templatePath('_webapplication.webapplication-meta.xml'),
      this.destinationPath(
        path.join(webappDir, `${webappname}.webapplication-meta.xml`)
      ),
      { apiVersion: this.apiversion, masterLabel }
    );

    await this.render(
      this.templatePath('package.json'),
      this.destinationPath(path.join(webappDir, 'package.json')),
      { webappname }
    );

    const templatePath = this.sourceRoot();
    await this.copyDirectoryRecursive(
      templatePath,
      webappDir,
      new Set(['_webapplication.webapplication-meta.xml', 'package.json'])
    );
  }

  private async copyDirectoryRecursive(
    sourceDir: string,
    destDir: string,
    excludeFiles: ReadonlySet<string> = new Set()
  ): Promise<void> {
    if (!this._fs.existsSync(sourceDir)) {
      return;
    }

    await this._fs.promises.mkdir(destDir, { recursive: true });

    const entries = this._fs.readdirSync(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      // Skip template files that were rendered
      if (excludeFiles.has(entry.name)) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.copyDirectoryRecursive(sourcePath, destPath, excludeFiles);
      } else if (!this._fs.existsSync(destPath)) {
        // Copy file and track it
        const content = await this._fs.promises.readFile(sourcePath);
        await this._fs.promises.mkdir(path.dirname(destPath), {
          recursive: true,
        });
        await this._fs.promises.writeFile(destPath, content as Uint8Array);

        // Register the created file
        const relativePath = path.relative(this._cwd, destPath);
        this.changes.created.push(relativePath);
      }
    }
  }
}
