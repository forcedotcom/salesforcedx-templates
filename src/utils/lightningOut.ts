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
  /** Non-fatal advisories (duplicate ignored, localhost http exception). */
  warnings: string[];
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

function normalizeOne(raw: string): { origin: string; warning?: string } {
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
  const isLocalhost = host === 'localhost' || host === '127.0.0.1';
  if (scheme !== 'https' && !(scheme === 'http' && isLocalhost)) {
    throw new Error(
      nls.localize('InvalidLightningOutHostDomain', [raw, 'must be https (http allowed only for localhost)'])
    );
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
  return { origin, warning: scheme === 'http' ? nls.localize('WarnLightningOutLocalhostHttp', [origin]) : undefined };
}

/**
 * Normalize a raw host-domain list into canonical origins + filename tokens.
 * Lowercases scheme/host, strips default ports, rejects wildcards/paths/non-https
 * (except localhost http), dedupes case-insensitively (with a warning), and throws
 * if two distinct origins collide on the same filename token.
 */
export function normalizeHostDomains(raw: string[]): NormalizedHostDomains {
  const origins: string[] = [];
  const fileTokens: string[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();
  const tokenToOrigin = new Map<string, string>();
  for (const entry of raw) {
    const { origin, warning } = normalizeOne(entry);
    if (warning) {
      warnings.push(warning);
    }
    if (seen.has(origin)) {
      warnings.push(nls.localize('WarnLightningOutDuplicateHostDomain', [origin]));
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
  return { origins, fileTokens, warnings };
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

/** True if `ref` is an LWC ("namespace/name") or Aura ("namespace:Name") component reference. */
export function isValidComponentRef(ref: string): boolean {
  return /^[A-Za-z][A-Za-z0-9]*[/:][A-Za-z][A-Za-z0-9_]*$/.test((ref ?? '').trim());
}
