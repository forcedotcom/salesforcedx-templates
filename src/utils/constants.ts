/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';

export const DEFAULT_API_VERSION = '66.0';

export const dirnameTemplatesDefault =
  process.env.ESBUILD_PLATFORM !== 'web'
    ? path.join(__dirname, '..', 'templates')
    : undefined;
