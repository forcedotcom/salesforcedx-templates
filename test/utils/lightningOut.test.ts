/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import {
  normalizeHostDomains,
  originToFileToken,
  checkDeveloperName,
  isValidComponentRef,
} from '../../src/utils/lightningOut';

describe('normalizeHostDomains', () => {
  it('lowercases scheme+host and strips the default https port', () => {
    expect(normalizeHostDomains(['HTTPS://Example.COM:443']).origins).to.deep.equal(['https://example.com']);
  });
  it('keeps a non-default port', () => {
    expect(normalizeHostDomains(['https://lo2-local.com:8080']).origins).to.deep.equal(['https://lo2-local.com:8080']);
  });
  it('rejects wildcards', () => {
    expect(() => normalizeHostDomains(['https://*.example.com'])).to.throw(/wildcard/i);
  });
  it('rejects a path/query/fragment', () => {
    expect(() => normalizeHostDomains(['https://example.com/app'])).to.throw(/path/i);
  });
  it('rejects non-https except localhost http', () => {
    expect(() => normalizeHostDomains(['http://example.com'])).to.throw(/https/i);
    const r = normalizeHostDomains(['http://localhost:3000']);
    expect(r.origins).to.deep.equal(['http://localhost:3000']);
    expect(r.warnings.join(' ')).to.match(/localhost/i);
  });
  it('dedupes case-insensitively with a warning', () => {
    const r = normalizeHostDomains(['https://example.com', 'https://EXAMPLE.com:443']);
    expect(r.origins).to.deep.equal(['https://example.com']);
    expect(r.warnings.join(' ')).to.match(/duplicate/i);
  });
  it('throws when two distinct origins collide on the same file token', () => {
    // https vs http localhost same host+port -> same token
    expect(() => normalizeHostDomains(['https://localhost:3000', 'http://localhost:3000'])).to.throw(/file name/i);
  });
  it('produces a filesystem-safe, scheme-stripped token per origin', () => {
    const r = normalizeHostDomains(['https://a.com', 'https://b.com:8080']);
    expect(new Set(r.fileTokens).size).to.equal(2);
    r.fileTokens.forEach((t) => expect(t).to.match(/^[A-Za-z0-9_]+$/));
    expect(r.fileTokens[0].startsWith('https_')).to.equal(false);
  });
});

describe('originToFileToken', () => {
  it('strips the scheme and non-alphanumerics', () => {
    expect(originToFileToken('https://lo2-local.com:8080')).to.equal('lo2_local_com_8080');
  });
});

describe('checkDeveloperName', () => {
  it('accepts a valid name within the cap', () => {
    expect(checkDeveloperName('MyLoApp', 'appName', 64)).to.be.undefined;
  });
  it('rejects a leading digit', () => {
    expect(checkDeveloperName('1App', 'appName', 64)).to.be.a('string');
  });
  it('rejects consecutive underscores', () => {
    expect(checkDeveloperName('My__App', 'appName', 64)).to.be.a('string');
  });
  it('rejects a trailing underscore', () => {
    expect(checkDeveloperName('MyApp_', 'appName', 64)).to.be.a('string');
  });
  it('rejects non-ASCII', () => {
    expect(checkDeveloperName('Café', 'appName', 64)).to.be.a('string');
  });
  it('enforces appName cap of 64', () => {
    expect(checkDeveloperName('A'.repeat(65), 'appName', 64)).to.be.a('string');
    expect(checkDeveloperName('A'.repeat(64), 'appName', 64)).to.be.undefined;
  });
  it('allows eca.name up to 80', () => {
    expect(checkDeveloperName('A'.repeat(80), 'eca.name', 80)).to.be.undefined;
    expect(checkDeveloperName('A'.repeat(81), 'eca.name', 80)).to.be.a('string');
  });
});

describe('isValidComponentRef', () => {
  it('accepts LWC namespace/name', () => {
    expect(isValidComponentRef('c/helloWorldButton')).to.be.true;
  });
  it('accepts Aura namespace:Name', () => {
    expect(isValidComponentRef('c:helloWorld')).to.be.true;
  });
  it('rejects empty or namespace-less refs', () => {
    expect(isValidComponentRef('')).to.be.false;
    expect(isValidComponentRef('noNamespace')).to.be.false;
  });
});
