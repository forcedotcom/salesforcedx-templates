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

import * as assert from 'node:assert';
import * as path from 'node:path';
import { describe, it } from 'vitest';
import {
  ensureLowercaseUrlName,
  toAlphanumericForPath,
  WINDOWS_MAX_ALLOWABLE_PATH_LENGTH,
} from '../../src/utils/uiBundleTemplateUtils';

describe('uiBundleTemplateUtils', () => {
  describe('toAlphanumericForPath', () => {
    it('strips non-alphanumeric characters', () => {
      assert.strictEqual(toAlphanumericForPath('My App'), 'MyApp');
      assert.strictEqual(toAlphanumericForPath('my-app_1'), 'myapp1');
      assert.strictEqual(toAlphanumericForPath('a1b2'), 'a1b2');
    });

    it('returns empty string when only non-alphanumeric', () => {
      assert.strictEqual(toAlphanumericForPath('---'), '');
    });
  });

  describe('placeholder constants', () => {
    it('WINDOWS_MAX_ALLOWABLE_PATH_LENGTH is positive', () => {
      assert.ok(
        Number.isInteger(WINDOWS_MAX_ALLOWABLE_PATH_LENGTH),
        'should be integer',
      );
      assert.ok(WINDOWS_MAX_ALLOWABLE_PATH_LENGTH > 0, 'should be positive');
    });
  });

  describe('ensureLowercaseUrlName', () => {
    const siteContentPath = path.join(
      'proj',
      'force-app',
      'main',
      'default',
      'digitalExperiences',
      'site',
      'MyApp1',
      'sfdc_cms__site',
      'MyApp1',
      'content.json',
    );

    it('lowercases urlName in sfdc_cms__site content.json', () => {
      const input = JSON.stringify(
        {
          type: 'sfdc_cms__site',
          title: 'MyApp',
          contentBody: { appContainer: true },
          urlName: 'MyApp',
        },
        undefined,
        2,
      );
      const result = ensureLowercaseUrlName(input, siteContentPath);
      const parsed = JSON.parse(result);
      assert.strictEqual(parsed.urlName, 'myapp');
      assert.strictEqual(parsed.title, 'MyApp', 'title should not change');
    });

    it('returns content unchanged when urlName is already lowercase', () => {
      const input = JSON.stringify(
        { type: 'sfdc_cms__site', urlName: 'myapp' },
        undefined,
        2,
      );
      const result = ensureLowercaseUrlName(input, siteContentPath);
      assert.strictEqual(result, input);
    });

    it('returns content unchanged for non-content.json files', () => {
      const input = JSON.stringify({ urlName: 'MyApp' });
      const otherPath = path.join('sfdc_cms__site', 'MyApp1', '_meta.json');
      assert.strictEqual(ensureLowercaseUrlName(input, otherPath), input);
    });

    it('returns content unchanged for content.json outside sfdc_cms__site', () => {
      const input = JSON.stringify({ urlName: 'MyApp' });
      const otherPath = path.join('sfdc_cms__view', 'home', 'content.json');
      assert.strictEqual(ensureLowercaseUrlName(input, otherPath), input);
    });

    it('returns content unchanged for invalid JSON', () => {
      const input = '{ invalid json';
      assert.strictEqual(ensureLowercaseUrlName(input, siteContentPath), input);
    });

    it('returns content unchanged when urlName is not a string', () => {
      const input = JSON.stringify(
        { type: 'sfdc_cms__site', urlName: 123 },
        undefined,
        2,
      );
      assert.strictEqual(ensureLowercaseUrlName(input, siteContentPath), input);
    });
  });
});
