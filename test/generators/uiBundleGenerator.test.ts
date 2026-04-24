/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
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
