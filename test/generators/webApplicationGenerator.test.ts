/*
 * Copyright (c) 2025, salesforce.com, inc.
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
          outputdir: path.join('testsoutput', 'webapplications'),
          internal: true,
        });
      }).to.throw();
    });

    it('should validate template is provided', () => {
      expect(() => {
        new WebApplicationGenerator({
          webappname: 'TestWebApp',
          template: '',
          outputdir: path.join('testsoutput', 'webapplications'),
          internal: true,
        });
      }).to.throw();
    });

    it('should not append webapplications to outputdir when it already ends with webapplications', () => {
      const outputDirWithWebApplications = path.join('testsoutput', 'webapplications');
      const generator = new WebApplicationGenerator({
        webappname: 'TestWebApp',
        template: 'default',
        outputdir: outputDirWithWebApplications,
        internal: false,
      });
      // The outputdir should remain unchanged since it already ends with 'webapplications'
      expect((generator as any).outputdir).to.equal(outputDirWithWebApplications);
    });

    it('should append webapplications to outputdir when not internal and outputdir does not end with webapplications', () => {
      const outputDirWithoutWebApplications = path.join('testsoutput', 'mydir');
      const generator = new WebApplicationGenerator({
        webappname: 'TestWebApp',
        template: 'default',
        outputdir: outputDirWithoutWebApplications,
        internal: false,
      });
      // The outputdir should have 'webapplications' appended
      expect((generator as any).outputdir).to.equal(
        path.join('testsoutput', 'mydir', 'webapplications')
      );
    });

    it('should not append webapplications when internal is true', () => {
      const outputDirWithoutWebApplications = path.join('testsoutput', 'mydir');
      const generator = new WebApplicationGenerator({
        webappname: 'TestWebApp',
        template: 'default',
        outputdir: outputDirWithoutWebApplications,
        internal: true,
      });
      // The outputdir should remain unchanged when internal is true
      expect((generator as any).outputdir).to.equal(outputDirWithoutWebApplications);
    });

    it('should handle paths with webapplications in the middle but not at the end', () => {
      const outputDirWithWebApplicationsInMiddle = path.join(
        'testsoutput',
        'webapplications',
        'somefolder'
      );
      const generator = new WebApplicationGenerator({
        webappname: 'TestWebApp',
        template: 'default',
        outputdir: outputDirWithWebApplicationsInMiddle,
        internal: false,
      });
      // The outputdir should have 'webapplications' appended since it doesn't end with it
      expect((generator as any).outputdir).to.equal(
        path.join('testsoutput', 'webapplications', 'somefolder', 'webapplications')
      );
    });
  });
});
