/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { expect } from 'chai';
import * as path from 'path';
import { CreateUtil, DxpSiteOptions } from '../../src';
import DxpSiteGenerator from '../../src/generators/dxpSiteGenerator';

describe('DxpSiteGenerator', () => {
  const defaultMockInputs: DxpSiteOptions = {
    template: 'BuildYourOwnLWR',
    sitename: 'TestSite',
    urlpathprefix: 'testprefix',
    adminemail: 'test@salesforce.com',
  };

  afterEach(() => {
    sinon.restore();
  });

  describe('validateOptions', () => {
    [
      ['alphanumeric', 'testprefix'],
      ['starting with number', '123test'],
      ['empty string', ''],
    ].forEach(([description, urlpathprefix]) => {
      it(`should accept urlpathprefix ${description}`, () => {
        const options: DxpSiteOptions = { ...defaultMockInputs, urlpathprefix };
        expect(() => new DxpSiteGenerator(options)).to.not.throw();
      });
    });

    [
      ['hyphen', 'test-prefix'],
      ['underscore', 'test_prefix'],
      ['special characters', 'test@prefix!'],
    ].forEach(([description, urlpathprefix]) => {
      it(`should reject urlpathprefix with ${description}`, () => {
        const options: DxpSiteOptions = { ...defaultMockInputs, urlpathprefix };
        expect(() => new DxpSiteGenerator(options)).to.throw(
          'url-path-prefix must contain only alphanumeric characters.'
        );
      });
    });

    it('should call CreateUtil.checkInputs for template validation', () => {
      const checkInputsStub = sinon.stub(CreateUtil, 'checkInputs').returns('');
      new DxpSiteGenerator(defaultMockInputs);
      expect(checkInputsStub.calledOnceWith('BuildYourOwnLWR')).to.be.true;
    });
  });

  describe('generate', () => {
    let renderStub: sinon.SinonStub;

    beforeEach(() => {
      renderStub = sinon
        .stub(DxpSiteGenerator.prototype as any, 'render')
        .resolves();
    });

    it('should generate network file with correct path and variables', async () => {
      const generator = new DxpSiteGenerator(defaultMockInputs);
      await generator.generate();

      const networkCall = renderStub
        .getCalls()
        .find((call) => call.args[1].includes('network-meta.xml'));
      expect(networkCall).to.exist;
      expect(networkCall!.args[1]).to.include(
        path.join('networks', 'TestSite.network-meta.xml')
      );
      expect(networkCall!.args[2]).to.deep.equal({
        siteName: 'TestSite',
        siteDevName: 'TestSite',
        picassoSiteDevName: 'TestSite1',
        urlPathPrefix: 'testprefix',
        adminEmail: 'test@salesforce.com',
      });
    });

    it('should generate custom site file with correct path and variables', async () => {
      const generator = new DxpSiteGenerator(defaultMockInputs);
      await generator.generate();

      const siteCall = renderStub
        .getCalls()
        .find((call) => call.args[1].includes('site-meta.xml'));
      expect(siteCall).to.exist;
      expect(siteCall!.args[1]).to.include(
        path.join('sites', 'TestSite.site-meta.xml')
      );
      expect(siteCall!.args[2]).to.deep.equal({
        siteName: 'TestSite',
        siteDevName: 'TestSite',
        urlPathPrefix: 'testprefix',
      });
    });

    it('should generate digital experience config file', async () => {
      const generator = new DxpSiteGenerator(defaultMockInputs);
      await generator.generate();

      const configCall = renderStub
        .getCalls()
        .find((call) =>
          call.args[1].includes('digitalExperienceConfig-meta.xml')
        );
      expect(configCall).to.exist;
      expect(configCall!.args[1]).to.include(
        path.join(
          'digitalExperienceConfigs',
          'TestSite1.digitalExperienceConfig-meta.xml'
        )
      );
    });

    it('should generate digital experience bundle meta', async () => {
      const generator = new DxpSiteGenerator(defaultMockInputs);
      await generator.generate();

      const metaCall = renderStub
        .getCalls()
        .find((call) => call.args[1].includes('digitalExperience-meta.xml'));
      expect(metaCall).to.exist;
      expect(metaCall!.args[1]).to.include(
        path.join(
          'digitalExperiences',
          'site',
          'TestSite1',
          'TestSite1.digitalExperience-meta.xml'
        )
      );
    });

    [
      'Check_Password',
      'Error',
      'Forgot_Password',
      'Home',
      'Login',
      'News_Detail__c',
      'Register',
      'Service_Not_Available',
      'Too_Many_Requests',
    ].forEach((route) => {
      it(`should generate route: ${route}`, async () => {
        const generator = new DxpSiteGenerator(defaultMockInputs);
        await generator.generate();

        const routeContentCall = renderStub
          .getCalls()
          .find((call) =>
            call.args[1].includes(
              path.join('sfdc_cms__route', route, 'content.json')
            )
          );
        const routeMetaCall = renderStub
          .getCalls()
          .find((call) =>
            call.args[1].includes(
              path.join('sfdc_cms__route', route, '_meta.json')
            )
          );
        expect(routeContentCall, `Expected route content for ${route}`).to
          .exist;
        expect(routeMetaCall, `Expected route meta for ${route}`).to.exist;
      });
    });

    [
      'checkPasswordResetEmail',
      'error',
      'forgotPassword',
      'home',
      'login',
      'newsDetail',
      'register',
      'serviceNotAvailable',
      'tooManyRequests',
    ].forEach((view) => {
      it(`should generate view: ${view}`, async () => {
        const generator = new DxpSiteGenerator(defaultMockInputs);
        await generator.generate();

        const viewContentCall = renderStub
          .getCalls()
          .find((call) =>
            call.args[1].includes(
              path.join('sfdc_cms__view', view, 'content.json')
            )
          );
        const viewMetaCall = renderStub
          .getCalls()
          .find((call) =>
            call.args[1].includes(
              path.join('sfdc_cms__view', view, '_meta.json')
            )
          );
        expect(viewContentCall, `Expected view content for ${view}`).to.exist;
        expect(viewMetaCall, `Expected view meta for ${view}`).to.exist;
        expect(viewContentCall!.args[2]).to.have.property('uuid');
        expect(viewContentCall!.args[2].uuid).to.be.a('function');
      });
    });

    ['scopedHeaderAndFooter', 'snaThemeLayout'].forEach((layout) => {
      it(`should generate theme layout: ${layout}`, async () => {
        const generator = new DxpSiteGenerator(defaultMockInputs);
        await generator.generate();

        const layoutContentCall = renderStub
          .getCalls()
          .find((call) =>
            call.args[1].includes(
              path.join('sfdc_cms__themeLayout', layout, 'content.json')
            )
          );
        const layoutMetaCall = renderStub
          .getCalls()
          .find((call) =>
            call.args[1].includes(
              path.join('sfdc_cms__themeLayout', layout, '_meta.json')
            )
          );
        expect(layoutContentCall, `Expected layout content for ${layout}`).to
          .exist;
        expect(layoutMetaCall, `Expected layout meta for ${layout}`).to.exist;
        expect(layoutContentCall!.args[2]).to.have.property('uuid');
        expect(layoutContentCall!.args[2].uuid).to.be.a('function');
      });
    });

    [
      ['appPage', 'sfdc_cms__appPage', 'mainAppPage'],
      ['brandingSet', 'sfdc_cms__brandingSet', 'Build_Your_Own_LWR'],
      ['languageSettings', 'sfdc_cms__languageSettings', 'languages'],
      [
        'mobilePublisherConfig',
        'sfdc_cms__mobilePublisherConfig',
        'mobilePublisherConfig',
      ],
      ['theme', 'sfdc_cms__theme', 'Build_Your_Own_LWR'],
    ].forEach(([name, type, folder]) => {
      it(`should generate ${name} files`, async () => {
        const generator = new DxpSiteGenerator(defaultMockInputs);
        await generator.generate();

        const contentCall = renderStub
          .getCalls()
          .find((call) =>
            call.args[1].includes(path.join(type, folder, 'content.json'))
          );
        const metaCall = renderStub
          .getCalls()
          .find((call) =>
            call.args[1].includes(path.join(type, folder, '_meta.json'))
          );
        expect(contentCall, `Expected ${name} content`).to.exist;
        expect(metaCall, `Expected ${name} meta`).to.exist;
      });
    });

    it('should generate site content with correct urlName transformation', async () => {
      const options: DxpSiteOptions = {
        ...defaultMockInputs,
        sitename: 'My "Test" Site!',
      };
      const generator = new DxpSiteGenerator(options);
      await generator.generate();

      const siteContentCall = renderStub
        .getCalls()
        .find((call) =>
          call.args[0].includes(path.join('sfdc_cms__site', 'content.json'))
        );
      expect(siteContentCall).to.exist;
      expect(siteContentCall!.args[2]).to.deep.equal({
        siteName: 'My \\"Test\\" Site!',
        urlName: 'my-test-site',
      });
    });
  });

  describe('site name transformations', () => {
    let renderStub: sinon.SinonStub;

    beforeEach(() => {
      renderStub = sinon
        .stub(DxpSiteGenerator.prototype as any, 'render')
        .resolves();
    });

    [
      ['spaces to underscores', 'My   Site', 'My_Site', 'My_Site1'],
      ['special characters', 'Site@#$Name!', 'Site_Name', 'Site_Name1'],
      ['prefix X for leading number', '123Site', 'X123Site', 'X123Site1'],
      ['leading special chars then number', '##1Site', '_1Site', '_1Site1'],
    ].forEach(
      ([description, sitename, expectedDevName, expectedPicassoDevName]) => {
        it(`should transform site name: ${description}`, async () => {
          const options: DxpSiteOptions = {
            ...defaultMockInputs,
            sitename,
          };
          const generator = new DxpSiteGenerator(options);
          await generator.generate();

          const networkCall = renderStub
            .getCalls()
            .find((call) => call.args[1].includes('network-meta.xml'));
          expect(networkCall!.args[2].siteDevName).to.equal(expectedDevName);
          expect(networkCall!.args[2].picassoSiteDevName).to.equal(
            expectedPicassoDevName
          );
        });
      }
    );

    it('should encode special characters in network file name', async () => {
      const options: DxpSiteOptions = {
        ...defaultMockInputs,
        sitename: "Site ~!.'()@#$%&+= Name",
      };
      const generator = new DxpSiteGenerator(options);
      await generator.generate();

      const networkCall = renderStub
        .getCalls()
        .find((call) => call.args[1].includes('network-meta.xml'));
      expect(networkCall!.args[1]).to.include(
        'Site %7E%21%2E%27%28%29%40%23%24%25%26%2B%3D Name.network-meta.xml'
      );
    });
  });

  describe('UUID generation', () => {
    let renderStub: sinon.SinonStub;

    beforeEach(() => {
      renderStub = sinon
        .stub(DxpSiteGenerator.prototype as any, 'render')
        .resolves();
    });

    it('should generate valid UUID format', async () => {
      const generator = new DxpSiteGenerator(defaultMockInputs);
      await generator.generate();

      const viewContentCalls = renderStub
        .getCalls()
        .filter(
          (call) =>
            call.args[1].includes('sfdc_cms__view') &&
            call.args[1].includes('content.json')
        );

      expect(viewContentCalls.length).to.be.greaterThan(0);
      const uuidFunction = viewContentCalls[0].args[2].uuid;
      const uuid = uuidFunction();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuid).to.match(uuidRegex);
    });

    it('should cache UUIDs by key', async () => {
      const generator = new DxpSiteGenerator(defaultMockInputs);
      await generator.generate();

      const viewContentCalls = renderStub
        .getCalls()
        .filter(
          (call) =>
            call.args[1].includes('sfdc_cms__view') &&
            call.args[1].includes('content.json')
        );

      expect(viewContentCalls.length).to.be.greaterThan(0);
      const uuidFunction = viewContentCalls[0].args[2].uuid;
      const key = 'test-key';
      const firstCall = uuidFunction(key);
      const secondCall = uuidFunction(key);

      expect(firstCall).to.equal(secondCall);
    });

    it('should generate different UUIDs for different keys', async () => {
      const generator = new DxpSiteGenerator(defaultMockInputs);
      await generator.generate();

      const viewContentCalls = renderStub
        .getCalls()
        .filter(
          (call) =>
            call.args[1].includes('sfdc_cms__view') &&
            call.args[1].includes('content.json')
        );

      expect(viewContentCalls.length).to.be.greaterThan(0);
      const uuidFunction = viewContentCalls[0].args[2].uuid;
      const firstKey = uuidFunction('key1');
      const secondKey = uuidFunction('key2');

      expect(firstKey).to.not.equal(secondKey);
    });

    it('should generate different UUIDs when called without key', async () => {
      const generator = new DxpSiteGenerator(defaultMockInputs);
      await generator.generate();

      const viewContentCalls = renderStub
        .getCalls()
        .filter(
          (call) =>
            call.args[1].includes('sfdc_cms__view') &&
            call.args[1].includes('content.json')
        );

      expect(viewContentCalls.length).to.be.greaterThan(0);
      const uuidFunction = viewContentCalls[0].args[2].uuid;
      const uuid1 = uuidFunction();
      const uuid2 = uuidFunction();

      expect(uuid1).to.not.equal(uuid2);
    });
  });
});
