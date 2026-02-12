/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SinonStub, stub } from 'sinon';
import { expect } from 'chai';
import { DIR } from '../../src/service/gitRepoUtils';
import * as os from 'os';
import * as path from 'path';

describe('DIR', () => {
  let homedirStub: SinonStub;
  beforeEach(() => {
    homedirStub = stub(os, 'homedir');
  });
  afterEach(() => {
    homedirStub.restore();
  });
  it('should return DIR', () => {
    const homedir = '/Users/johndoe';
    homedirStub.returns(homedir);
    const sfdxStateFolder = '.sfdx';
    const dir = DIR();
    expect(dir).to.eql(path.join(homedir, sfdxStateFolder));
  });
});
