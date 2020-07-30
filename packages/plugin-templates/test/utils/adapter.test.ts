/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
  Answers,
  ForceGeneratorAdapter
} from '@salesforce/templates/lib/utils';
import { expect } from 'chai';

describe('prompt', () => {
  it('should return a resolved Answers promise', async () => {
    const adapter = new ForceGeneratorAdapter();
    const result = await adapter.prompt(
      [{ message: 'Overwrite?', name: 'action', type: 'expand' }],
      () => {}
    );
    const answers: Answers = { '0': '' };
    expect(result).to.deep.equal(answers);
  });
});
