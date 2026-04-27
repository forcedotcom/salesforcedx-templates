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
import * as nodeFs from 'node:fs';
import * as path from 'node:path';
import { nls } from '../i18n';
import { dirnameTemplatesDefault } from './constants';

export class CreateUtil {
  public static checkInputs(flagValue: string): string {
    const alphaRegExp = /^\w+$/;

    if (!alphaRegExp.test(flagValue)) {
      throw new Error(nls.localize('AlphaNumericNameError'));
    }
    const letterStartRegExp = /^[A-Za-z]/;

    if (!letterStartRegExp.test(flagValue)) {
      throw new Error(nls.localize('NameMustStartWithLetterError'));
    }
    if (flagValue.endsWith('_')) {
      throw new Error(nls.localize('EndWithUnderscoreError'));
    }
    if (flagValue.includes('__')) {
      throw new Error(nls.localize('DoubleUnderscoreError'));
    }
    return '';
  }

  // TODO: switch filetype to a string instead of regex
  public static getCommandTemplatesForFiletype(
    filetype: RegExp,
    command: string,
    fs: typeof nodeFs = nodeFs,
    templatesRootPath?: string,
  ): string[] {
    const basePath = templatesRootPath ?? dirnameTemplatesDefault ?? '';
    const files = fs
      .readdirSync(path.resolve(basePath, command))
      .filter((file) => filetype.test(file))
      .map((file) => file.split('.', 1).toString());
    return files;
  }

  /** Get the names of directories that contain matching template files.
   * This will look in directories under the command/subdir folder.
   *
   * @param command the command name
   * @param filetype optional file name pattern to match on in the subdirectories
   * @param subdir optional subdirectory under `templates/${command}`
   * @return the set of template names
   */
  public static getCommandTemplatesInSubdirs(
    command: string,
    { filetype, subdir }: { filetype?: RegExp; subdir?: string } = {},
    fs: typeof nodeFs = nodeFs,
    templatesRootPath?: string,
  ): string[] {
    const basePath = templatesRootPath ?? dirnameTemplatesDefault ?? '';
    let basedir = path.resolve(basePath, command);
    if (subdir) {
      basedir = path.join(basedir, subdir);
    }
    const subdirs = fs
      .readdirSync(basedir, { withFileTypes: true })
      .filter((ent) => ent.isDirectory())
      .map((ent) => ent.name);
    if (filetype) {
      return subdirs.filter((dir) =>
        fs
          .readdirSync(path.join(basedir, dir), { withFileTypes: true })
          .some((ent) => ent.isFile() && filetype.test(ent.name)),
      );
    }
    return subdirs;
  }
}
