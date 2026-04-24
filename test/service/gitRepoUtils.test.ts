/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as path from 'path';
import * as os from 'node:os';
import { DIR } from '../../src/service/gitRepoUtils';

vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:os')>();
  return { ...actual, homedir: vi.fn(actual.homedir) };
});

describe('DIR', () => {
  afterEach(() => {
    vi.mocked(os.homedir).mockReset();
  });
  it('should return DIR', () => {
    const homedir = '/Users/johndoe';
    vi.mocked(os.homedir).mockReturnValue(homedir);
    const sfdxStateFolder = '.sfdx';
    const dir = DIR();
    expect(dir).toEqual(path.join(homedir, sfdxStateFolder));
  });
});
