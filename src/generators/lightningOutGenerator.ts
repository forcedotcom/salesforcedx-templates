/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { URL } from 'node:url';
import * as path from 'path';
import { nls } from '../i18n';
import {
  checkDeveloperName,
  isValidComponentRef,
  LIGHTNING_OUT_ACCESS_MODES,
  LIGHTNING_OUT_RUNTIMES,
  normalizeHostDomains,
  type NormalizedHostDomains
} from '../utils/lightningOut';
import { type LightningOutOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

const VALID_RUNTIMES: ReadonlySet<string> = new Set(LIGHTNING_OUT_RUNTIMES);
const VALID_ACCESS: ReadonlySet<string> = new Set(LIGHTNING_OUT_ACCESS_MODES);
const APP_NAME_MAX = 64;
const ECA_NAME_MAX = 80;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default class LightningOutGenerator extends BaseGenerator<LightningOutOptions> {
  private normalizedHostDomains!: NormalizedHostDomains;

  /** CLWR guest: only the LightningOutApp file is emitted, so eca/hostDomains are not required. */
  private get isGuest(): boolean {
    return this.options.runtime === 'CLWR' && this.options.access === 'guest';
  }

  public validateOptions(): void {
    const o = this.options;
    const errors: string[] = [];
    const guest = this.isGuest;

    const missing: string[] = [];
    if (!o.appName?.trim()) {
      missing.push('appName');
    }
    if (!guest && !o.eca?.name?.trim()) {
      missing.push('eca.name');
    }
    if (!o.runtime?.toString().trim()) {
      missing.push('runtime');
    }
    if (!guest && (!Array.isArray(o.hostDomains) || o.hostDomains.length === 0)) {
      missing.push('hostDomains');
    }
    if (!guest && !o.eca?.contactEmail?.trim()) {
      missing.push('eca.contactEmail');
    }
    if (!guest && !o.eca?.callbackUrl?.trim()) {
      missing.push('eca.callbackUrl');
    }
    if (missing.length) {
      errors.push(nls.localize('MissingLightningOutInputs', [missing.join(', ')]));
    }

    if (o.appName) {
      const e = checkDeveloperName(o.appName, 'appName', APP_NAME_MAX);
      if (e) {
        errors.push(e);
      }
    }
    if (!guest && o.eca?.name) {
      const e = checkDeveloperName(o.eca.name, 'eca.name', ECA_NAME_MAX);
      if (e) {
        errors.push(e);
      }
    }
    if (o.runtime && !VALID_RUNTIMES.has(o.runtime)) {
      errors.push(nls.localize('InvalidLightningOutRuntime', [[...VALID_RUNTIMES].join(', ')]));
    }
    if (o.runtime && o.runtime !== 'CLWR') {
      // Both are CLWR-only concepts; LWR_CORE is always authenticated with no site.
      if (o.site !== undefined) {
        errors.push(nls.localize('InvalidLightningOutClwrOnly', ['site', o.runtime]));
      }
      if (o.access !== undefined) {
        errors.push(nls.localize('InvalidLightningOutClwrOnly', ['access', o.runtime]));
      }
    } else {
      if (o.access !== undefined && !VALID_ACCESS.has(o.access)) {
        errors.push(nls.localize('InvalidLightningOutAccess', [[...VALID_ACCESS].join(', ')]));
      }
      if (o.site !== undefined && (typeof o.site !== 'string' || !o.site.trim())) {
        errors.push(nls.localize('InvalidLightningOutSiteName'));
      }
    }
    if (!guest && o.eca?.contactEmail && !EMAIL_RE.test(o.eca.contactEmail)) {
      errors.push(nls.localize('InvalidLightningOutContactEmail', [o.eca.contactEmail]));
    }
    if (!guest && o.eca?.callbackUrl) {
      let ok = false;
      try {
        ok = new URL(o.eca.callbackUrl).protocol === 'https:';
      } catch {
        ok = false;
      }
      if (!ok) {
        errors.push(nls.localize('InvalidLightningOutCallbackUrl', [o.eca.callbackUrl]));
      }
    }
    for (const c of o.components ?? []) {
      if (!isValidComponentRef(c)) {
        errors.push(nls.localize('InvalidLightningOutComponent', [c]));
      }
    }

    let normalized: NormalizedHostDomains | undefined;
    if (Array.isArray(o.hostDomains) && o.hostDomains.length) {
      try {
        normalized = normalizeHostDomains(o.hostDomains);
      } catch (e) {
        if (!(e instanceof Error)) {
          throw e;
        }
        errors.push(e.message);
      }
    }

    if (errors.length) {
      throw new Error(nls.localize('InvalidLightningOutDefinition', [`\n  - ${errors.join('\n  - ')}`]));
    }

    this.normalizedHostDomains = normalized ?? { origins: [], fileTokens: [] };
  }

  public async generate(): Promise<void> {
    const { appName, runtime, components, eca, site } = this.options;
    const { origins, fileTokens } = this.normalizedHostDomains;

    this.sourceRootWithPartialPath(path.join('lightningout', 'default'));

    // LightningOutApp
    await this.render(
      this.templatePath('lightningOutApp.xml'),
      this.destinationPath(path.join(this.outputdir, 'lightningOutApps', `${appName}.lightningOutApp-meta.xml`)),
      // Trim each ref so the emitted value matches what isValidComponentRef validated
      // (it validates the trimmed form); otherwise surrounding whitespace would be baked
      // into the XML and fail Core's parseComponentName at deploy.
      {
        name: appName,
        runtime,
        components: (components ?? []).map((c) => c.trim()),
        hostDomains: origins,
        // Authenticated always has ≥ 1 origin; guest omits the element when none were given.
        emitAllowedDomains: origins.length > 0,
        // Core resolves <siteName> trimmed; emit the trimmed form. Omitted when no site.
        site: site?.trim() ?? ''
      }
    );

    if (this.isGuest) {
      // Guest users reach the app through the Experience site's guest profile: no ECA,
      // no OAuth CORS, no cookie settings, and no per-origin CORS entries are needed.
      return;
    }
    // validateOptions guarantees eca is present for every non-guest definition.
    const ecaOpts = eca!;

    // MyDomainSettings / SecuritySettings — server-side field merge (safe minimal files).
    await this.render(
      this.templatePath('myDomainSettings.xml'),
      this.destinationPath(path.join(this.outputdir, 'settings', 'MyDomain.settings-meta.xml')),
      {}
    );
    await this.render(
      this.templatePath('securitySettings.xml'),
      this.destinationPath(path.join(this.outputdir, 'settings', 'Security.settings-meta.xml')),
      {}
    );

    // CorsWhitelistOrigin — one independent, per-origin file (never clobbers others).
    for (let i = 0; i < origins.length; i++) {
      await this.render(
        this.templatePath('corsWhitelistOrigin.xml'),
        this.destinationPath(
          path.join(this.outputdir, 'corsWhitelistOrigins', `${fileTokens[i]}.corsWhitelistOrigin-meta.xml`)
        ),
        { origin: origins[i] }
      );
    }

    // ExternalClientApplication + OAuth settings trio. Invariants hardcoded:
    // distributionState=Local, single OAuth scope "Web".
    await this.render(
      this.templatePath('externalClientApplication.xml'),
      this.destinationPath(path.join(this.outputdir, 'externalClientApps', `${ecaOpts.name}.eca-meta.xml`)),
      {
        name: ecaOpts.name,
        contactEmail: ecaOpts.contactEmail,
        distributionState: 'Local'
      }
    );
    await this.render(
      this.templatePath('extlClntAppGlobalOauthSettings.xml'),
      this.destinationPath(
        path.join(this.outputdir, 'extlClntAppGlobalOauthSets', `${ecaOpts.name}.ecaGlblOauth-meta.xml`)
      ),
      { name: ecaOpts.name, callbackUrl: ecaOpts.callbackUrl }
    );
    await this.render(
      this.templatePath('extlClntAppOauthSettings.xml'),
      this.destinationPath(path.join(this.outputdir, 'extlClntAppOauthSettings', `${ecaOpts.name}.ecaOauth-meta.xml`)),
      { name: ecaOpts.name, oauthScopes: 'Web' }
    );
  }
}
