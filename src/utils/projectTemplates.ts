/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Built-in project templates accepted by the project generator.
 * Exposed so consumers (CLI plugins, IDEs) can derive their template choices from a single source of truth.
 */
export const PROJECT_TEMPLATES = [
  'standard',
  'empty',
  'analytics',
  'reactinternalapp',
  'reactexternalapp',
  'angularinternalapp',
  'angularexternalapp',
  'vueinternalapp',
  'agent',
  'nativemobile',
] as const;

export type ProjectTemplate = (typeof PROJECT_TEMPLATES)[number];
