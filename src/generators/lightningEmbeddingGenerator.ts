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
import {
  isAllowedLightningEmbeddingSrcUrl,
  LIGHTNING_EMBEDDING_SANDBOX_TOKENS,
} from '../utils/lightningEmbedding';
import { LightningEmbeddingOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

const VALID_SANDBOX_TOKENS: ReadonlySet<string> = new Set(
  LIGHTNING_EMBEDDING_SANDBOX_TOKENS
);

export default class LightningEmbeddingGenerator extends BaseGenerator<LightningEmbeddingOptions> {
  public validateOptions(): void {
    CreateUtil.checkInputs(this.options.componentname);

    const fileparts = path.resolve(this.outputdir).split(path.sep);
    if (!this.options.internal && !fileparts.includes('lwc')) {
      throw new Error(nls.localize('MissingLWCDir'));
    }

    if (!isAllowedLightningEmbeddingSrcUrl(this.options.src)) {
      throw new Error(nls.localize('InvalidLightningEmbeddingSrcUrl'));
    }

    if (this.options.src.includes("'")) {
      throw new Error(nls.localize('InvalidLightningEmbeddingSrcChar'));
    }

    if (!this.options.shellTitle || !this.options.shellTitle.trim()) {
      throw new Error(nls.localize('MissingLightningEmbeddingShellTitle'));
    }

    if (this.options.shellTitle.includes('"')) {
      throw new Error(nls.localize('InvalidLightningEmbeddingShellTitleChar'));
    }

    const tokens = this.options.sandbox.split(/\s+/).filter(Boolean);
    const invalid = tokens.filter((t) => !VALID_SANDBOX_TOKENS.has(t));
    if (invalid.length) {
      throw new Error(
        nls.localize('InvalidLightningEmbeddingSandboxToken', [
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

    this.sourceRootWithPartialPath(path.join('lightningembedding', 'default'));

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
