/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Runtimes supported by a Lightning Out 2.0 app.
 * Exposed so CLI plugins can derive their flag `options` list from a single source of truth.
 */
export const LIGHTNING_OUT_RUNTIMES = ['LWR_CORE', 'CLWR'] as const;
export type LightningOutRuntime = (typeof LIGHTNING_OUT_RUNTIMES)[number];

/**
 * ExternalClientApplication distribution states.
 */
export const LIGHTNING_OUT_DISTRIBUTION_STATES = ['Local', 'Packaged'] as const;
export type LightningOutDistributionState =
  (typeof LIGHTNING_OUT_DISTRIBUTION_STATES)[number];

/**
 * Returns true if `origin` is an explicit https origin with no wildcard.
 * Lightning Out host domains and CORS origins must be concrete https origins.
 */
export function isAllowedLightningOutOrigin(origin: string): boolean {
  return typeof origin === 'string' && /^https:\/\/[^\s*]+$/.test(origin);
}

/**
 * Returns true if `name` is a valid Metadata API name (letter, then
 * alphanumerics/underscore).
 */
export function isValidMetadataName(name: string): boolean {
  return typeof name === 'string' && /^[A-Za-z][A-Za-z0-9_]*$/.test(name);
}

/**
 * Sanitize an https origin into a Metadata-API-safe file/member name.
 * Strips the scheme first (so we never emit a leading "https_" that the
 * Metadata API misreads as a namespace prefix), then collapses any run of
 * non-alphanumerics to a single '_' and trims leading/trailing underscores.
 */
export function sanitizeOrigin(origin: string): string {
  return origin
    .replace(/^https?:\/\//, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * IFrame Type (context) an IframeWhiteListUrl entry applies to. The org's
 * "Trusted Domains for Inline Frames" list spans all of these; a deploy of
 * IframeWhiteListUrlSettings REPLACES the entire list across every context.
 */
export const LIGHTNING_OUT_IFRAME_CONTEXT = 'LightningOut';
