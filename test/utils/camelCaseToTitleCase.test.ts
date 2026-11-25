/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { describe, expect, it } from 'vitest';
import { camelCaseToTitleCase } from '../../src/utils/camelCaseToTitleCase';

describe('camelCaseToTitleCase', () => {
  it.each([
    ['', ''],
    ['hello', 'Hello'],
    ['helloWorld', 'Hello World'],
    ['HelloWorld', 'Hello World'],
    ['LibraryCreateUIBundle', 'Library CreateUI Bundle'],
    ['XMLHttpRequest', 'XML Http Request'],
    ['myURL', 'MyURL'],
    ['myURLValue', 'MyURL Value'],
    ['ABC', 'ABC'],
    ['a', 'A'],
    ['version2Component', 'Version2 Component'],
    ['my_component', 'My_component'],
    ['  hello   world\tfooBar  ', 'Hello World Foo Bar'],
    ['<helloWorld>', '<hello World>']
  ])('converts %j to %j', (input, expected) => {
    expect(camelCaseToTitleCase(input)).to.equal(expected);
  });
});
