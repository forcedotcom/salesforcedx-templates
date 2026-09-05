/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { URL } from 'node:url';
import { nls } from '../i18n';
import {
  checkDeveloperName,
  isValidComponentRef,
  LIGHTNING_OUT_RUNTIMES,
  normalizeHostDomains,
  NormalizedHostDomains,
} from '../utils/lightningOut';
import { LightningOutOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';

const VALID_RUNTIMES: ReadonlySet<string> = new Set(LIGHTNING_OUT_RUNTIMES);
const APP_NAME_MAX = 64;
const ECA_NAME_MAX = 80;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default class LightningOutGenerator extends BaseGenerator<LightningOutOptions> {
  private normalizedHostDomains!: NormalizedHostDomains;

  public validateOptions(): void {
    const o = this.options;
    const errors: string[] = [];

    const missing: string[] = [];
    if (!o.appName?.trim()) {
      missing.push('appName');
    }
    if (!o.eca?.name?.trim()) {
      missing.push('eca.name');
    }
    if (!o.runtime?.toString().trim()) {
      missing.push('runtime');
    }
    if (!Array.isArray(o.hostDomains) || o.hostDomains.length === 0) {
      missing.push('hostDomains');
    }
    if (!o.eca?.contactEmail?.trim()) {
      missing.push('eca.contactEmail');
    }
    if (!o.eca?.callbackUrl?.trim()) {
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
    if (o.eca?.name) {
      const e = checkDeveloperName(o.eca.name, 'eca.name', ECA_NAME_MAX);
      if (e) {
        errors.push(e);
      }
    }
    if (o.runtime && !VALID_RUNTIMES.has(o.runtime)) {
      errors.push(nls.localize('InvalidLightningOutRuntime', [[...VALID_RUNTIMES].join(', ')]));
    }
    if (o.eca?.contactEmail && !EMAIL_RE.test(o.eca.contactEmail)) {
      errors.push(nls.localize('InvalidLightningOutContactEmail', [o.eca.contactEmail]));
    }
    if (o.eca?.callbackUrl) {
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
        this.warnings.push(...normalized.warnings);
      } catch (e) {
        errors.push((e as Error).message);
      }
    }

    if (errors.length) {
      throw new Error(nls.localize('InvalidLightningOutDefinition', ['\n  - ' + errors.join('\n  - ')]));
    }

    // Non-fatal advisories (only reached when validation passed).
    if (!(o.components && o.components.length)) {
      this.warnings.push(nls.localize('WarnLightningOutNoComponents'));
    }
    if (o.runtime === 'CLWR') {
      this.warnings.push(nls.localize('WarnLightningOutClwrExperimental'));
    }
    if (normalized && o.eca?.callbackUrl) {
      try {
        const cb = new URL(o.eca.callbackUrl);
        const scheme = cb.protocol.replace(':', '').toLowerCase();
        const port = cb.port && cb.port !== '443' ? `:${cb.port}` : '';
        const cbOrigin = `${scheme}://${cb.hostname.toLowerCase()}${port}`;
        if (!normalized.origins.includes(cbOrigin)) {
          this.warnings.push(nls.localize('WarnLightningOutCallbackNotInHostDomains', [cbOrigin]));
        }
      } catch {
        /* invalid callbackUrl already produced an error above */
      }
    }

    this.normalizedHostDomains = normalized ?? { origins: [], fileTokens: [], warnings: [] };
  }

  public async generate(): Promise<void> {
    const { appName, runtime, components, eca } = this.options;
    const { origins, fileTokens } = this.normalizedHostDomains;

    this.sourceRootWithPartialPath(path.join('lightningout', 'default'));

    // LightningOutApp
    await this.render(
      this.templatePath('lightningOutApp.xml'),
      this.destinationPath(
        path.join(this.outputdir, 'lightningOutApps', `${appName}.lightningOutApp-meta.xml`)
      ),
      { name: appName, runtime, components: components ?? [], hostDomains: origins }
    );

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
          path.join(
            this.outputdir,
            'corsWhitelistOrigins',
            `${fileTokens[i]}.corsWhitelistOrigin-meta.xml`
          )
        ),
        { origin: origins[i] }
      );
    }

    // ExternalClientApplication + OAuth settings trio. Invariants hardcoded:
    // distributionState=Local, single OAuth scope "Web".
    await this.render(
      this.templatePath('externalClientApplication.xml'),
      this.destinationPath(
        path.join(this.outputdir, 'externalClientApps', `${eca.name}.eca-meta.xml`)
      ),
      { name: eca.name, contactEmail: eca.contactEmail, distributionState: 'Local' }
    );
    await this.render(
      this.templatePath('extlClntAppGlobalOauthSettings.xml'),
      this.destinationPath(
        path.join(this.outputdir, 'extlClntAppGlobalOauthSets', `${eca.name}.ecaGlblOauth-meta.xml`)
      ),
      { name: eca.name, callbackUrl: eca.callbackUrl }
    );
    await this.render(
      this.templatePath('extlClntAppOauthSettings.xml'),
      this.destinationPath(
        path.join(this.outputdir, 'extlClntAppOauthSettings', `${eca.name}.ecaOauth-meta.xml`)
      ),
      { name: eca.name, oauthScopes: 'Web' }
    );
  }
}
