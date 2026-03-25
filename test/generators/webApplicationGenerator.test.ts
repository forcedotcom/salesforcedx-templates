/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as chai from 'chai';
import * as path from 'path';
import * as sinon from 'sinon';
import WebApplicationGenerator from '../../src/generators/webApplicationGenerator';

chai.config.truncateThreshold = 100000;
const { expect } = chai;

describe('WebApplicationGenerator', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('validateOptions', () => {
    it('should validate webappname is provided', () => {
      expect(() => {
        new WebApplicationGenerator({
          webappname: '',
          template: 'default',
          outputdir: path.join('testsoutput', 'webui'),
          internal: true,
        });
      }).to.throw();
    });

    it('should validate template is provided', () => {
      expect(() => {
        new WebApplicationGenerator({
          webappname: 'TestWebApp',
          template: '',
          outputdir: path.join('testsoutput', 'webui'),
          internal: true,
        });
      }).to.throw();
    });

    it('should not append webui to outputdir when it already ends with webui', () => {
      const outputDirWithWebui = path.join('testsoutput', 'webui');
      const generator = new WebApplicationGenerator({
        webappname: 'TestWebApp',
        template: 'default',
        outputdir: outputDirWithWebui,
        internal: false,
      });
      // The outputdir should remain unchanged since it already ends with 'webui'
      expect((generator as any).outputdir).to.equal(outputDirWithWebui);
    });

    it('should append webui to outputdir when not internal and outputdir does not end with webui', () => {
      const outputDirWithoutWebui = path.join('testsoutput', 'mydir');
      const generator = new WebApplicationGenerator({
        webappname: 'TestWebApp',
        template: 'default',
        outputdir: outputDirWithoutWebui,
        internal: false,
      });
      // The outputdir should have 'webui' appended
      expect((generator as any).outputdir).to.equal(
        path.join('testsoutput', 'mydir', 'webui')
      );
    });

    it('should not append webui when internal is true', () => {
      const outputDirWithoutWebui = path.join('testsoutput', 'mydir');
      const generator = new WebApplicationGenerator({
        webappname: 'TestWebApp',
        template: 'default',
        outputdir: outputDirWithoutWebui,
        internal: true,
      });
      // The outputdir should remain unchanged when internal is true
      expect((generator as any).outputdir).to.equal(outputDirWithoutWebui);
    });

    it('should handle paths with webui in the middle but not at the end', () => {
      const outputDirWithWebuiInMiddle = path.join(
        'testsoutput',
        'webui',
        'somefolder'
      );
      const generator = new WebApplicationGenerator({
        webappname: 'TestWebApp',
        template: 'default',
        outputdir: outputDirWithWebuiInMiddle,
        internal: false,
      });
      // The outputdir should have 'webui' appended since it doesn't end with it
      expect((generator as any).outputdir).to.equal(
        path.join('testsoutput', 'webui', 'somefolder', 'webui')
      );
    });
  });
});
