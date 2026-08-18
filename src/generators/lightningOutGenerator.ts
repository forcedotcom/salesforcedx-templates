/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { nls } from '../i18n';
import {
  isAllowedLightningOutOrigin,
  isValidMetadataName,
  LIGHTNING_OUT_DISTRIBUTION_STATES,
  LIGHTNING_OUT_IFRAME_CONTEXT,
  LIGHTNING_OUT_RUNTIMES,
  sanitizeOrigin,
} from '../utils/lightningOut';
import { LightningOutOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

const VALID_RUNTIMES: ReadonlySet<string> = new Set(LIGHTNING_OUT_RUNTIMES);
const VALID_DIST_STATES: ReadonlySet<string> = new Set(
  LIGHTNING_OUT_DISTRIBUTION_STATES
);

export default class LightningOutGenerator extends BaseGenerator<LightningOutOptions> {
  public validateOptions(): void {
    const errors: string[] = [];

    if (!isValidMetadataName(this.options.name)) {
      errors.push(nls.localize('InvalidLightningOutName'));
    }
    if (!VALID_RUNTIMES.has(this.options.runtime)) {
      errors.push(
        nls.localize('InvalidLightningOutRuntime', [
          [...VALID_RUNTIMES].join(', '),
        ])
      );
    }
    if (
      !Array.isArray(this.options.components) ||
      this.options.components.length === 0
    ) {
      errors.push(nls.localize('MissingLightningOutComponents'));
    }
    if (
      !Array.isArray(this.options.hostDomains) ||
      this.options.hostDomains.length === 0
    ) {
      errors.push(nls.localize('MissingLightningOutHostDomains'));
    } else {
      const bad = this.options.hostDomains.filter(
        (d) => !isAllowedLightningOutOrigin(d)
      );
      if (bad.length) {
        errors.push(
          nls.localize('InvalidLightningOutHostDomain', [bad.join(', ')])
        );
      }
    }

    const eca = this.options.eca;
    if (
      !eca ||
      !eca.contactEmail ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(eca.contactEmail)
    ) {
      errors.push(nls.localize('InvalidLightningOutContactEmail'));
    }
    if (
      eca &&
      eca.distributionState &&
      !VALID_DIST_STATES.has(eca.distributionState)
    ) {
      errors.push(
        nls.localize('InvalidLightningOutDistributionState', [
          [...VALID_DIST_STATES].join(', '),
        ])
      );
    }

    if (errors.length) {
      throw new Error(
        nls.localize('InvalidLightningOutDefinition', [
          '\n  - ' + errors.join('\n  - '),
        ])
      );
    }
  }

  public async generate(): Promise<void> {
    const { name, runtime, components, hostDomains, eca } = this.options;

    this.sourceRootWithPartialPath(path.join('lightningout', 'default'));

    // Option A guardrail: refuse to silently overwrite pre-existing files.
    // Collect every destination we intend to write, and if any already exists
    // (and --force was not passed) throw before writing anything.
    this.assertNoSilentOverwrite();

    // LightningOutApp
    await this.render(
      this.templatePath('lightningOutApp.xml'),
      this.destinationPath(
        path.join(this.outputdir, 'lightningOutApps', `${name}.lightningOutApp-meta.xml`)
      ),
      { name, runtime, components, hostDomains }
    );

    // IframeWhiteListUrlSettings — REPLACE-type on deploy. Because deploying this
    // artifact REPLACES the org's entire "Trusted Domains for Inline Frames" list
    // across every IFrame Type (Visualforce, Surveys, Lightning Out, etc.), this
    // file lists only the app's host domains. The developer must review it against
    // their org before deploying to avoid wiping existing cross-context entries.
    const iframeEntries = hostDomains.map((url) => ({
      url,
      context: LIGHTNING_OUT_IFRAME_CONTEXT,
    }));
    await this.render(
      this.templatePath('iframeWhiteListUrlSettings.xml'),
      this.destinationPath(
        path.join(
          this.outputdir,
          'iframeWhiteListUrlSettings',
          'IframeWhiteListUrlSettings.iframeWhiteListUrlSettings-meta.xml'
        )
      ),
      { iframeEntries }
    );

    // MyDomainSettings — server-side field merge (safe minimal file).
    await this.render(
      this.templatePath('myDomainSettings.xml'),
      this.destinationPath(
        path.join(this.outputdir, 'settings', 'MyDomain.settings-meta.xml')
      ),
      {}
    );

    // SecuritySettings — server-side field merge (safe minimal file).
    await this.render(
      this.templatePath('securitySettings.xml'),
      this.destinationPath(
        path.join(this.outputdir, 'settings', 'Security.settings-meta.xml')
      ),
      {}
    );

    // CorsWhitelistOrigin — one independent, per-origin file (never clobbers others).
    for (const origin of hostDomains) {
      await this.render(
        this.templatePath('corsWhitelistOrigin.xml'),
        this.destinationPath(
          path.join(
            this.outputdir,
            'corsWhitelistOrigins',
            `${sanitizeOrigin(origin)}.corsWhitelistOrigin-meta.xml`
          )
        ),
        { origin }
      );
    }

    // ExternalClientApplication + OAuth settings trio.
    const distributionState = eca.distributionState ?? 'Local';
    const callbackUrl = eca.callbackUrl ?? `${hostDomains[0]}/frontdoor-url.html`;
    const oauthScopes = (eca.oauthScopes ?? ['Web']).join(', ');

    await this.render(
      this.templatePath('externalClientApplication.xml'),
      this.destinationPath(
        path.join(this.outputdir, 'externalClientApps', `${name}.eca-meta.xml`)
      ),
      { name, contactEmail: eca.contactEmail, distributionState }
    );

    await this.render(
      this.templatePath('extlClntAppGlobalOauthSettings.xml'),
      this.destinationPath(
        path.join(
          this.outputdir,
          'extlClntAppGlobalOauthSets',
          `${name}.ecaGlblOauth-meta.xml`
        )
      ),
      { name, callbackUrl }
    );

    await this.render(
      this.templatePath('extlClntAppOauthSettings.xml'),
      this.destinationPath(
        path.join(
          this.outputdir,
          'extlClntAppOauthSettings',
          `${name}.ecaOauth-meta.xml`
        )
      ),
      { name, oauthScopes }
    );
  }

  /**
   * Option A guardrail. Unless `force` is set, throw if any artifact we are
   * about to write already exists on disk, so a re-run never silently
   * overwrites a developer's edits (notably the REPLACE-type iframe file).
   */
  private assertNoSilentOverwrite(): void {
    if (this.options.force) {
      return;
    }
    const { name, hostDomains } = this.options;
    const destinations = [
      path.join(this.outputdir, 'lightningOutApps', `${name}.lightningOutApp-meta.xml`),
      path.join(
        this.outputdir,
        'iframeWhiteListUrlSettings',
        'IframeWhiteListUrlSettings.iframeWhiteListUrlSettings-meta.xml'
      ),
      path.join(this.outputdir, 'settings', 'MyDomain.settings-meta.xml'),
      path.join(this.outputdir, 'settings', 'Security.settings-meta.xml'),
      ...hostDomains.map((o) =>
        path.join(
          this.outputdir,
          'corsWhitelistOrigins',
          `${sanitizeOrigin(o)}.corsWhitelistOrigin-meta.xml`
        )
      ),
      path.join(this.outputdir, 'externalClientApps', `${name}.eca-meta.xml`),
      path.join(
        this.outputdir,
        'extlClntAppGlobalOauthSets',
        `${name}.ecaGlblOauth-meta.xml`
      ),
      path.join(
        this.outputdir,
        'extlClntAppOauthSettings',
        `${name}.ecaOauth-meta.xml`
      ),
    ];

    const existing = destinations.filter((d) =>
      this._fs.existsSync(this.destinationPath(d))
    );
    if (existing.length) {
      throw new Error(
        nls.localize('LightningOutFilesExist', [
          existing.map((f) => `  - ${f}`).join('\n'),
        ])
      );
    }
  }
}
