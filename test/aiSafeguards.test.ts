/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';

const {
  DYNAMIC_GIT_REASON,
  NO_VERIFY_REASON,
  noVerifyDenial,
}: {
  DYNAMIC_GIT_REASON: string;
  NO_VERIFY_REASON: string;
  noVerifyDenial: (command: string) => string | undefined;
} = require('../scripts/ai-safeguards.js');

describe('AI Git safeguards', () => {
  it('blocks commit and push with --no-verify', () => {
    expect(noVerifyDenial('git commit --no-verify')).to.equal(NO_VERIFY_REASON);
    expect(noVerifyDenial('git push origin feature --no-verify')).to.equal(
      NO_VERIFY_REASON
    );
    expect(noVerifyDenial('git -C /tmp/repo commit --no-verify')).to.equal(
      NO_VERIFY_REASON
    );
  });

  it('blocks escaped and quote-concatenated forms', () => {
    expect(noVerifyDenial('git commit --no\\\n-verify')).to.equal(
      NO_VERIFY_REASON
    );
    expect(noVerifyDenial('git commit --no-veri\\fy')).to.equal(
      NO_VERIFY_REASON
    );
    expect(noVerifyDenial('git commit --no-veri""fy')).to.equal(
      NO_VERIFY_REASON
    );
  });

  it('blocks known wrappers and nested shells', () => {
    expect(noVerifyDenial('command git push --no-verify')).to.equal(
      NO_VERIFY_REASON
    );
    expect(noVerifyDenial('env FOO=bar git commit --no-verify')).to.equal(
      NO_VERIFY_REASON
    );
    expect(noVerifyDenial("bash -lc 'git push --no-verify'")).to.equal(
      NO_VERIFY_REASON
    );
    expect(noVerifyDenial("eval 'git commit --no-verify'")).to.equal(
      NO_VERIFY_REASON
    );
  });

  it('blocks dynamically assembled Git commands', () => {
    expect(noVerifyDenial('x=; git comm${x}it --no-verify')).to.equal(
      DYNAMIC_GIT_REASON
    );
    expect(noVerifyDenial('g=git; $g push --no-verify')).to.equal(
      DYNAMIC_GIT_REASON
    );
  });

  it('allows safe and unrelated commands', () => {
    expect(noVerifyDenial('git commit -m "verified"')).to.equal(undefined);
    expect(noVerifyDenial('git status --no-verify')).to.equal(undefined);
    expect(noVerifyDenial('echo git push --no-verify')).to.equal(undefined);
    expect(noVerifyDenial("git commit -m 'cost $5 `literal`'")).to.equal(
      undefined
    );
  });
});
