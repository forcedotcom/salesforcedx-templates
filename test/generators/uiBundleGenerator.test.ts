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
import { afterEach, describe, expect, it, vi } from 'vitest';
import UIBundleGenerator from '../../src/generators/uiBundleGenerator';
import { UI_BUNDLES_DIR } from '../../src/utils/constants';

describe('UIBundleGenerator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateOptions', () => {
    it('should validate bundlename is provided', () => {
      expect(() => {
        new UIBundleGenerator({
          bundlename: '',
          template: 'default',
          outputdir: path.join('testsoutput', UI_BUNDLES_DIR),
          internal: true,
        });
      }).toThrow();
    });

    it('should validate template is provided', () => {
      expect(() => {
        new UIBundleGenerator({
          bundlename: 'TestUIBundle',
          template: '',
          outputdir: path.join('testsoutput', UI_BUNDLES_DIR),
          internal: true,
        });
      }).toThrow();
    });

    it('should not append uiBundles to outputdir when it already ends with uiBundles', () => {
      const outputDirWithUiBundles = path.join('testsoutput', UI_BUNDLES_DIR);
      const generator = new UIBundleGenerator({
        bundlename: 'TestUIBundle',
        template: 'default',
        outputdir: outputDirWithUiBundles,
        internal: false,
      });
      expect((generator as any).outputdir).toBe(outputDirWithUiBundles);
    });

    it('should append uiBundles to outputdir when not internal and outputdir does not end with uiBundles', () => {
      const outputDirWithoutUiBundles = path.join('testsoutput', 'mydir');
      const generator = new UIBundleGenerator({
        bundlename: 'TestUIBundle',
        template: 'default',
        outputdir: outputDirWithoutUiBundles,
        internal: false,
      });
      expect((generator as any).outputdir).toBe(
        path.join('testsoutput', 'mydir', UI_BUNDLES_DIR),
      );
    });

    it('should not append uiBundles when internal is true', () => {
      const outputDirWithoutUiBundles = path.join('testsoutput', 'mydir');
      const generator = new UIBundleGenerator({
        bundlename: 'TestUIBundle',
        template: 'default',
        outputdir: outputDirWithoutUiBundles,
        internal: true,
      });
      expect((generator as any).outputdir).toBe(outputDirWithoutUiBundles);
    });

    it('should handle paths with uiBundles in the middle but not at the end', () => {
      const outputDirWithUiBundlesInMiddle = path.join(
        'testsoutput',
        UI_BUNDLES_DIR,
        'somefolder',
      );
      const generator = new UIBundleGenerator({
        bundlename: 'TestUIBundle',
        template: 'default',
        outputdir: outputDirWithUiBundlesInMiddle,
        internal: false,
      });
      expect((generator as any).outputdir).toBe(
        path.join('testsoutput', UI_BUNDLES_DIR, 'somefolder', UI_BUNDLES_DIR),
      );
    });
  });
});
