/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export function camelCaseToTitleCase(text: string): string {
  return text
    .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase())
    .replace(/([A-Z][a-z]+)/g, ' $1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
