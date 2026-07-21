/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * W3C-defined iframe sandbox tokens accepted by the UI embedding wrapper template.
 * Exposed so CLI plugins can derive their flag `options` list from a single source of truth.
 */
export const UI_EMBEDDING_SANDBOX_TOKENS = [
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
] as const;

export type UIEmbeddingSandboxToken =
  (typeof UI_EMBEDDING_SANDBOX_TOKENS)[number];

/**
 * Returns true if `src` is an absolute URL acceptable as the iframe source on the
 * UI embedding wrapper. https is accepted everywhere; plain http is permitted
 * only for localhost / 127.0.0.1 to support local development servers.
 */
export function isAllowedUIEmbeddingSrcUrl(src: string): boolean {
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
