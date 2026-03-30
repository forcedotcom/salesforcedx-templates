/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as chai from 'chai';
import * as path from 'path';
import * as sinon from 'sinon';
import UIBundleGenerator from '../../src/generators/uiBundleGenerator';
import { UI_BUNDLES_DIR } from '../../src/utils/constants';

chai.config.truncateThreshold = 100000;
const { expect } = chai;

describe('UIBundleGenerator', () => {
  afterEach(() => {
    sinon.restore();
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
      }).to.throw();
    });

    it('should validate template is provided', () => {
      expect(() => {
        new UIBundleGenerator({
          bundlename: 'TestUIBundle',
          template: '',
          outputdir: path.join('testsoutput', UI_BUNDLES_DIR),
          internal: true,
        });
      }).to.throw();
    });

    it('should not append uiBundles to outputdir when it already ends with uiBundles', () => {
      const outputDirWithUiBundles = path.join('testsoutput', UI_BUNDLES_DIR);
      const generator = new UIBundleGenerator({
        bundlename: 'TestUIBundle',
        template: 'default',
        outputdir: outputDirWithUiBundles,
        internal: false,
      });
      // The outputdir should remain unchanged since it already ends with UI_BUNDLES_DIR
      expect((generator as any).outputdir).to.equal(outputDirWithUiBundles);
    });

    it('should append uiBundles to outputdir when not internal and outputdir does not end with uiBundles', () => {
      const outputDirWithoutUiBundles = path.join('testsoutput', 'mydir');
      const generator = new UIBundleGenerator({
        bundlename: 'TestUIBundle',
        template: 'default',
        outputdir: outputDirWithoutUiBundles,
        internal: false,
      });
      // The outputdir should have UI_BUNDLES_DIR appended
      expect((generator as any).outputdir).to.equal(
        path.join('testsoutput', 'mydir', UI_BUNDLES_DIR)
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
      // The outputdir should remain unchanged when internal is true
      expect((generator as any).outputdir).to.equal(outputDirWithoutUiBundles);
    });

    it('should handle paths with uiBundles in the middle but not at the end', () => {
      const outputDirWithUiBundlesInMiddle = path.join(
        'testsoutput',
        UI_BUNDLES_DIR,
        'somefolder'
      );
      const generator = new UIBundleGenerator({
        bundlename: 'TestUIBundle',
        template: 'default',
        outputdir: outputDirWithUiBundlesInMiddle,
        internal: false,
      });
      // The outputdir should have UI_BUNDLES_DIR appended since it doesn't end with it
      expect((generator as any).outputdir).to.equal(
        path.join('testsoutput', UI_BUNDLES_DIR, 'somefolder', UI_BUNDLES_DIR)
      );
    });
  });
});
