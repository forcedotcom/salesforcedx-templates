/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { camelCaseToTitleCase } from '@salesforce/kit';
import * as fs from 'fs';
import * as path from 'path';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { WebApplicationOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class WebApplicationGenerator extends BaseGenerator<WebApplicationOptions> {
  constructor(options: WebApplicationOptions) {
    super(options);
  }

  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.webappname);
    CreateUtil.checkInputs(this.options.template);

    const fileparts = path.resolve(this.outputdir).split(path.sep);
    if (!this.options.internal && !fileparts.includes('webApplications')) {
      throw new Error(nls.localize('MissingWebApplicationsDir'));
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
    let templatePath: string;

    // 1. resolve the template from npm package
    try {
      const packageJsonPath = require.resolve(
        '@sfdc-webapps/base-web-app/package.json'
      );
      templatePath = path.join(path.dirname(packageJsonPath), 'dist');
      if (!fs.existsSync(templatePath)) {
        throw new Error('Template path not found');
      }
    } catch {
      throw new Error(
        "Web application templates not found. Install '@sfdc-webapps/base-web-app'."
      );
    }

    this.sourceRoot(templatePath);

    // 2. render paramterized templates
    await this.render(
      this.templatePath('_webapplication.webApplication-meta.xml'),
      this.destinationPath(
        path.join(webappDir, `${webappname}.webApplication-meta.xml`)
      ),
      { apiVersion: this.apiversion, masterLabel }
    );

    await this.render(
      this.templatePath('index.html'),
      this.destinationPath(path.join(webappDir, 'index.html')),
      { masterLabel }
    );

    // 3. copy the rest of the files over
    await this.copyDirectoryRecursive(
      templatePath,
      webappDir,
      new Set(['_webapplication.webApplication-meta.xml'])
    );
  }

  private async generateReactBasic(
    webappDir: string,
    webappname: string,
    masterLabel: string
  ): Promise<void> {
    let templatePath: string;

    // 1. resolve the template from npm package
    try {
      const packageJsonPath = require.resolve(
        '@sfdc-webapps/base-reference-app/package.json'
      );
      templatePath = path.join(
        path.dirname(packageJsonPath),
        'dist',
        'digitalExperiences',
        'webApplications',
        'base-reference-app'
      );
      if (!fs.existsSync(templatePath)) {
        throw new Error('Template path not found');
      }
    } catch {
      throw new Error(
        "Web application templates not found. Install '@sfdc-webapps/base-reference-app'."
      );
    }

    this.sourceRoot(templatePath);

    // 2. render paramterized templates
    await this.render(
      this.templatePath('_webapplication.webApplication-meta.xml'),
      this.destinationPath(
        path.join(webappDir, `${webappname}.webApplication-meta.xml`)
      ),
      { apiVersion: this.apiversion, masterLabel }
    );

    await this.render(
      this.templatePath('index.html'),
      this.destinationPath(path.join(webappDir, 'index.html')),
      { masterLabel }
    );

    await this.render(
      this.templatePath('package.json'),
      this.destinationPath(path.join(webappDir, 'package.json')),
      { webappname }
    );

    // 3. copy the rest of the files over
    await this.copyDirectoryRecursive(
      templatePath,
      webappDir,
      new Set(['_webapplication.webApplication-meta.xml'])
    );
  }

  private async copyDirectoryRecursive(
    sourceDir: string,
    destDir: string,
    excludeFiles: Set<string> = new Set()
  ): Promise<void> {
    if (!fs.existsSync(sourceDir)) {
      return;
    }

    await mkdir(destDir, { recursive: true });

    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      // Skip template files that were rendered
      if (excludeFiles.has(entry.name)) {
        continue;
      }

      // Skip files that already exist
      if (fs.existsSync(destPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.copyDirectoryRecursive(sourcePath, destPath, excludeFiles);
      } else {
        // Copy file and track it
        const content = await readFile(sourcePath);
        await mkdir(path.dirname(destPath), { recursive: true });
        await writeFile(destPath, content as Uint8Array);

        // Register the created file
        const relativePath = path.relative(process.cwd(), destPath);
        this.changes.created.push(relativePath);
      }
    }
  }
}
