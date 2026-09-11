/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { URL } from 'node:url';
import { nls } from '../i18n';

/**
 * Runtimes supported by a Lightning Out 2.0 app.
 * Exposed so CLI plugins can derive their flag `options` list from a single source of truth.
 */
export const LIGHTNING_OUT_RUNTIMES = ['LWR_CORE', 'CLWR'] as const;
export type LightningOutRuntime = (typeof LIGHTNING_OUT_RUNTIMES)[number];

/** Result of normalizing a raw host-domain list. Arrays are index-aligned. */
export interface NormalizedHostDomains {
  /** Canonical origins (scheme://host[:port]) for allowedDomains + CorsWhitelistOrigin urlPattern. */
  origins: string[];
  /** Filesystem-safe token per origin (index-aligned with `origins`). */
  fileTokens: string[];
}

/**
 * Filesystem-/Metadata-API-safe token for an origin. Strips the scheme first
 * (so we never emit a leading "https_" the Metadata API misreads as a namespace
 * prefix), then collapses runs of non-alphanumerics to '_' and trims underscores.
 */
export function originToFileToken(origin: string): string {
  return origin
    .replace(/^https?:\/\//, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeOne(raw: string): { origin: string } {
  const trimmed = (raw ?? '').trim();
  if (trimmed.includes('*')) {
    throw new Error(nls.localize('InvalidLightningOutHostDomain', [raw, 'wildcards are not allowed']));
  }
  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    throw new Error(nls.localize('InvalidLightningOutHostDomain', [raw, 'not a valid absolute URL']));
  }
  const scheme = u.protocol.replace(':', '').toLowerCase();
  const host = u.hostname.toLowerCase();
  // Mirror Core's LightningOutApp.isValidHostDomain: a host domain is an origin-style
  // allowlist entry, so any http or https origin is accepted (http is not restricted to
  // localhost). Other schemes (ftp/ws/...) are rejected. Since this generator is offline it
  // can't know whether a domain is dev or prod, so it defers any https-in-production policy
  // (e.g. Secure-cookie requirements) to deploy/runtime rather than rejecting http here.
  if (scheme !== 'https' && scheme !== 'http') {
    throw new Error(nls.localize('InvalidLightningOutHostDomain', [raw, 'must use an http or https scheme']));
  }
  if (u.username || u.password) {
    throw new Error(nls.localize('InvalidLightningOutHostDomain', [raw, 'must not contain user info']));
  }
  if ((u.pathname && u.pathname !== '/') || u.search || u.hash) {
    throw new Error(
      nls.localize('InvalidLightningOutHostDomain', [raw, 'must not contain a path, query, or fragment'])
    );
  }
  const defaultPort = scheme === 'https' ? '443' : '80';
  const port = u.port && u.port !== defaultPort ? `:${u.port}` : '';
  const origin = `${scheme}://${host}${port}`;
  return { origin };
}

/**
 * Normalize a raw host-domain list into canonical origins + filename tokens.
 * Lowercases scheme/host, strips default ports, rejects wildcards/paths and any
 * scheme other than http/https, dedupes case-insensitively, and throws
 * if two distinct origins collide on the same filename token.
 */
export function normalizeHostDomains(raw: string[]): NormalizedHostDomains {
  const origins: string[] = [];
  const fileTokens: string[] = [];
  const seen = new Set<string>();
  const tokenToOrigin = new Map<string, string>();
  for (const entry of raw) {
    const { origin } = normalizeOne(entry);
    if (seen.has(origin)) {
      continue;
    }
    const token = originToFileToken(origin);
    const priorOrigin = tokenToOrigin.get(token);
    if (priorOrigin && priorOrigin !== origin) {
      throw new Error(nls.localize('InvalidLightningOutHostDomainCollision', [origin, priorOrigin, token]));
    }
    seen.add(origin);
    tokenToOrigin.set(token, origin);
    origins.push(origin);
    fileTokens.push(token);
  }
  return { origins, fileTokens };
}

/**
 * Validate a Salesforce DeveloperName within a max length. Returns an error
 * string (for the caller's error list) or undefined when valid. ASCII only:
 * starts with a letter, then letters/digits/single underscores, no consecutive
 * or trailing underscore.
 */
export function checkDeveloperName(value: string, field: string, maxLength: number): string | undefined {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(value) || /__/.test(value) || value.endsWith('_')) {
    return nls.localize('InvalidLightningOutName', [field, value]);
  }
  if (value.length > maxLength) {
    return nls.localize('InvalidLightningOutNameLength', [field, String(maxLength), String(value.length)]);
  }
  return undefined;
}

/**
 * True if `ref` is a component reference in kebab ("ns-my-component"), module/slash
 * ("ns/myComponent"), or Aura colon ("ns:MyComponent") form. This is a structural
 * well-formedness check only: it mirrors Core's Aura-enabled component-name validator
 * (setup_lightningout loApplicationEditHelper.validateComponentName). Because this
 * generator is offline it can't read the org's Aura-in-Lightning-Out preference, so it
 * always allows the colon (Aura) form and defers the org-policy decision to deploy time.
 */
export function isValidComponentRef(ref: string): boolean {
  return /^[a-z][a-zA-Z0-9_]*[-:/][A-Za-z][A-Za-z0-9_-]*[A-Za-z0-9]$/.test((ref ?? '').trim());
}
