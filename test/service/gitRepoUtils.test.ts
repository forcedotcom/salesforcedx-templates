/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as path from 'node:path';
import * as os from 'node:os';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getGlobalStateDir } from '../../src/service/gitRepoUtils';

vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:os')>();
  return { ...actual, homedir: vi.fn(actual.homedir) };
});

describe('getGlobalStateDir', () => {
  afterEach(() => {
    vi.mocked(os.homedir).mockReset();
  });
  it('should return the global state dir', () => {
    const homedir = '/Users/johndoe';
    vi.mocked(os.homedir).mockReturnValue(homedir);
    const sfdxStateFolder = '.sfdx';
    const dir = getGlobalStateDir();
    expect(dir).toEqual(path.join(homedir, sfdxStateFolder));
  });
});
