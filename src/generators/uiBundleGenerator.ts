/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as path from 'node:path';
import { camelCaseToTitleCase } from '@salesforce/kit';
import { CreateUtil } from '../utils/createUtil';
import { UI_BUNDLES_DIR } from '../utils/constants';
import { UIBundleOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

export default class UIBundleGenerator extends BaseGenerator<UIBundleOptions> {
  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.bundlename);
    CreateUtil.checkInputs(this.options.template);

    // Ensure output directory includes 'uiBundles' folder
    if (!this.options.internal) {
      const fileparts = path
        .resolve(this.outputdir)
        .split(path.sep)
        .filter(Boolean);
      const endsWithUiBundles =
        fileparts[fileparts.length - 1] === UI_BUNDLES_DIR;
      if (!endsWithUiBundles) {
        this.outputdir = path.join(this.outputdir, UI_BUNDLES_DIR);
      }
    }
  }

  public async generate(): Promise<void> {
    const { bundlename } = this.options;
    const template = this.options.template.toLowerCase();
    const masterLabel =
      this.options.masterlabel ?? camelCaseToTitleCase(bundlename);
    const bundleDir = path.join(this.outputdir, bundlename);

    switch (template) {
      case 'reactbasic':
        await this.generateReactBasic(bundleDir, bundlename, masterLabel);
        break;
      default:
        await this.generateDefault(bundleDir, bundlename, masterLabel);
    }
  }

  private async generateDefault(
    bundleDir: string,
    bundlename: string,
    masterLabel: string,
  ): Promise<void> {
    this.sourceRootWithPartialPath(path.join('uiBundles', 'webappbasic'));

    await this.render(
      this.templatePath('_uibundle.uibundle-meta.xml'),
      this.destinationPath(
        path.join(bundleDir, `${bundlename}.uibundle-meta.xml`),
      ),
      { apiVersion: this.apiversion, masterLabel },
    );

    const templatePath = this.sourceRoot();
    await this.copyDirectoryRecursive(
      templatePath,
      bundleDir,
      new Set(['_uibundle.uibundle-meta.xml']),
    );
  }

  private async generateReactBasic(
    bundleDir: string,
    bundlename: string,
    masterLabel: string,
  ): Promise<void> {
    this.sourceRootWithPartialPath(path.join('uiBundles', 'reactbasic'));

    await this.render(
      this.templatePath('_uibundle.uibundle-meta.xml'),
      this.destinationPath(
        path.join(bundleDir, `${bundlename}.uibundle-meta.xml`),
      ),
      { apiVersion: this.apiversion, masterLabel },
    );

    await this.render(
      this.templatePath('package.json'),
      this.destinationPath(path.join(bundleDir, 'package.json')),
      { bundlename },
    );

    const templatePath = this.sourceRoot();
    await this.copyDirectoryRecursive(
      templatePath,
      bundleDir,
      new Set(['_uibundle.uibundle-meta.xml', 'package.json']),
    );
  }

  private async copyDirectoryRecursive(
    sourceDir: string,
    destDir: string,
    excludeFiles: ReadonlySet<string> = new Set(),
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
