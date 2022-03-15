/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { nls } from '../i18n';

/* tslint:disable:no-unused-expression */

export class CreateUtil {
  public static checkInputs(flagValue: string) {
    const alphaRegExp = /^\w+$/;

    if (!alphaRegExp.test(flagValue)) {
      throw new Error(nls.localize('AlphaNumericNameError'));
    }
    const letterStartRegExp = /^[A-Za-z]/;

    if (!letterStartRegExp.test(flagValue)) {
      throw new Error(nls.localize('NameMustStartWithLetterError'));
    }
    const endUnderscore = /_$/;
    if (endUnderscore.test(flagValue)) {
      throw new Error(nls.localize('EndWithUnderscoreError'));
    }
    const dblUnderscore = /__/;
    if (dblUnderscore.test(flagValue)) {
      throw new Error(nls.localize('DoubleUnderscoreError'));
    }
    return '';
  }

  // TODO: switch filetype to a string instead of regex
  public static getCommandTemplatesForFiletype(
    filetype: RegExp,
    command: string
  ): string[] {
    const files = fs
      .readdirSync(path.resolve(__dirname, '..', 'templates', command))
      .filter(file => filetype.test(file))
      .map(file => {
        return file.split('.', 1).toString();
      });
    return files;
  }

  /** Get the names of directories that contain matching template files.
   * This will look in directories under the command/subdir folder.
   * @param command the command name
   * @param filetype optional file name pattern to match on in the subdirectories
   * @param subdir optional subdirectory under `templates/${command}`
   * @return the set of template names
   */
  public static getCommandTemplatesInSubdirs(
    command: string,
    { filetype, subdir }: { filetype?: RegExp; subdir?: string } = {}
  ): string[] {
    let basedir = path.resolve(__dirname, '..', 'templates', command);
    if (subdir) {
      basedir = path.join(basedir, subdir);
    }
    const subdirs = fs
      .readdirSync(basedir, { withFileTypes: true })
      .filter(ent => ent.isDirectory())
      .map(ent => ent.name);
    if (filetype) {
      return subdirs.filter(dir =>
        fs
          .readdirSync(path.join(basedir, dir), { withFileTypes: true })
          .some(ent => ent.isFile() && filetype.test(ent.name))
      );
    }
    return subdirs;
  }
}
