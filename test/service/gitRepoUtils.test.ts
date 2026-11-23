/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { describe, expect, it, vi } from 'vitest';
import { DIR } from '../../src/service/gitRepoUtils';
import * as os from 'node:os';
import path from 'path';

vi.mock('node:os', { spy: true });

describe('DIR', () => {
  it('should return DIR', () => {
    const homedir = '/Users/johndoe';
    vi.mocked(os.homedir).mockReturnValue(homedir);
    const sfdxStateFolder = '.sfdx';
    const dir = DIR();
    expect(dir).to.eql(path.join(homedir, sfdxStateFolder));
  });
});
