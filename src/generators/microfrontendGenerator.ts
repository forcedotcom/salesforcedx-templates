/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { camelCaseToTitleCase } from '@salesforce/kit';
import * as path from 'path';
import { nls } from '../i18n';
import { CreateUtil } from '../utils';
import { MicrofrontendOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

function isAllowedSrcUrl(src: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(src);
  } catch {
    return false;
  }
  if (parsed.protocol === 'https:') {
    return true;
  }
  if (parsed.protocol === 'http:') {
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  }
  return false;
}

const VALID_SANDBOX_TOKENS = new Set([
  'allow-forms',
  'allow-modals',
  'allow-orientation-lock',
  'allow-pointer-lock',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-presentation',
  'allow-same-origin',
  'allow-scripts',
  'allow-storage-access-by-user-activation',
  'allow-top-navigation',
  'allow-top-navigation-by-user-activation',
]);

export default class MicrofrontendGenerator extends BaseGenerator<MicrofrontendOptions> {
  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.componentname);

    const fileparts = path.resolve(this.outputdir).split(path.sep);
    if (!this.options.internal && !fileparts.includes('lwc')) {
      throw new Error(nls.localize('MissingLWCDir'));
    }

    if (!isAllowedSrcUrl(this.options.src)) {
      throw new Error(nls.localize('InvalidMicrofrontendSrcUrl'));
    }

    if (!this.options.shellTitle || !this.options.shellTitle.trim()) {
      throw new Error(nls.localize('MissingMicrofrontendShellTitle'));
    }

    const tokens = this.options.sandbox.split(/\s+/).filter(Boolean);
    const invalid = tokens.filter((t) => !VALID_SANDBOX_TOKENS.has(t));
    if (invalid.length) {
      throw new Error(
        nls.localize('InvalidMicrofrontendSandboxToken', [
          invalid.join(', '),
          [...VALID_SANDBOX_TOKENS].join(', '),
        ])
      );
    }
  }

  public async generate(): Promise<void> {
    const { componentname, src, sandbox, shellTitle, internal } = this.options;

    const pascalCaseComponentName = `${componentname
      .substring(0, 1)
      .toUpperCase()}${componentname.substring(1)}`;
    const camelCaseComponentName = `${componentname
      .substring(0, 1)
      .toLowerCase()}${componentname.substring(1)}`;

    this.sourceRootWithPartialPath(path.join('microfrontend', 'default'));

    await this.render(
      this.templatePath('default.html'),
      this.destinationPath(
        path.join(
          this.outputdir,
          camelCaseComponentName,
          `${camelCaseComponentName}.html`
        )
      ),
      { sandbox, shellTitle }
    );

    await this.render(
      this.templatePath('default.js'),
      this.destinationPath(
        path.join(
          this.outputdir,
          camelCaseComponentName,
          `${camelCaseComponentName}.js`
        )
      ),
      { pascalCaseComponentName, src }
    );

    await this.render(
      this.templatePath('default.css'),
      this.destinationPath(
        path.join(
          this.outputdir,
          camelCaseComponentName,
          `${camelCaseComponentName}.css`
        )
      ),
      {}
    );

    if (!internal) {
      const masterLabel = camelCaseToTitleCase(componentname)
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      await this.render(
        this.templatePath('default.js-meta.xml'),
        this.destinationPath(
          path.join(
            this.outputdir,
            camelCaseComponentName,
            `${camelCaseComponentName}.js-meta.xml`
          )
        ),
        { apiVersion: this.apiversion, masterLabel }
      );
    }
  }
}
