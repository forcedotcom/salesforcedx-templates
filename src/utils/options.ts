/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// StringKeyValueObject is just a simple constrained version of a normal JavaScript object
//   but at least providing some typing rather than just "any"

export interface StringKeyValueObject<V> {
  [opt: string]: V;
}
export type OptionsMap = StringKeyValueObject<string>;
export type Answers = StringKeyValueObject<string>;
