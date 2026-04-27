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
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import { CreateUtil, DigitalExperienceSiteOptions } from '../../src/index';
import DigitalExperienceSiteGenerator from '../../src/generators/digitalExperienceSiteGenerator';

describe('DigitalExperienceSiteGenerator', () => {
  const defaultMockInputs: DigitalExperienceSiteOptions = {
    template: 'BuildYourOwnLWR',
    sitename: 'TestSite',
    urlpathprefix: 'testprefix',
    adminemail: 'test@salesforce.com',
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateOptions', () => {
    [
      ['alphanumeric', 'testprefix'],
      ['starting with number', '123test'],
      ['empty string', ''],
    ].forEach(([description, urlpathprefix]) => {
      it(`should accept urlpathprefix ${description}`, () => {
        const options: DigitalExperienceSiteOptions = {
          ...defaultMockInputs,
          urlpathprefix,
        };
        expect(() => new DigitalExperienceSiteGenerator(options)).not.toThrow();
      });
    });

    [
      ['hyphen', 'test-prefix'],
      ['underscore', 'test_prefix'],
      ['special characters', 'test@prefix!'],
    ].forEach(([description, urlpathprefix]) => {
      it(`should reject urlpathprefix with ${description}`, () => {
        const options: DigitalExperienceSiteOptions = {
          ...defaultMockInputs,
          urlpathprefix,
        };
        expect(() => new DigitalExperienceSiteGenerator(options)).toThrow(
          'url-path-prefix must contain only alphanumeric characters.',
        );
      });
    });

    it('should call CreateUtil.checkInputs for template validation', () => {
      const checkInputsSpy = vi
        .spyOn(CreateUtil, 'checkInputs')
        .mockReturnValue('');
      new DigitalExperienceSiteGenerator(defaultMockInputs);
      expect(checkInputsSpy).toHaveBeenCalledOnce();
      expect(checkInputsSpy).toHaveBeenCalledWith('BuildYourOwnLWR');
    });
  });

  describe('generate', () => {
    let renderSpy: MockInstance;

    beforeEach(() => {
      renderSpy = vi
        .spyOn(DigitalExperienceSiteGenerator.prototype as any, 'render')
        .mockResolvedValue(undefined);
    });

    const findCall = (matcher: (args: any[]) => boolean) =>
      renderSpy.mock.calls.find((args) => matcher(args));

    it('should generate network file with correct path and variables', async () => {
      const generator = new DigitalExperienceSiteGenerator(defaultMockInputs);
      await generator.generate();

      const networkCall = findCall((args) =>
        args[1].includes('network-meta.xml'),
      );
      expect(networkCall).toBeDefined();
      expect(networkCall![1]).toContain(
        path.join('networks', 'TestSite.network-meta.xml'),
      );
      expect(networkCall![2]).toEqual({
        siteName: 'TestSite',
        siteDevName: 'TestSite',
        picassoSiteDevName: 'TestSite1',
        urlPathPrefix: 'testprefix',
        adminEmail: 'test@salesforce.com',
      });
    });

    it('should generate custom site file with correct path and variables', async () => {
      const generator = new DigitalExperienceSiteGenerator(defaultMockInputs);
      await generator.generate();

      const siteCall = findCall((args) => args[1].includes('site-meta.xml'));
      expect(siteCall).toBeDefined();
      expect(siteCall![1]).toContain(
        path.join('sites', 'TestSite.site-meta.xml'),
      );
      expect(siteCall![2]).toEqual({
        siteName: 'TestSite',
        siteDevName: 'TestSite',
        urlPathPrefix: 'testprefix',
      });
    });

    it('should generate digital experience config file', async () => {
      const generator = new DigitalExperienceSiteGenerator(defaultMockInputs);
      await generator.generate();

      const configCall = findCall((args) =>
        args[1].includes('digitalExperienceConfig-meta.xml'),
      );
      expect(configCall).toBeDefined();
      expect(configCall![1]).toContain(
        path.join(
          'digitalExperienceConfigs',
          'TestSite1.digitalExperienceConfig-meta.xml',
        ),
      );
    });

    it('should generate digital experience bundle meta', async () => {
      const generator = new DigitalExperienceSiteGenerator(defaultMockInputs);
      await generator.generate();

      const metaCall = findCall((args) =>
        args[1].includes('digitalExperience-meta.xml'),
      );
      expect(metaCall).toBeDefined();
      expect(metaCall![1]).toContain(
        path.join(
          'digitalExperiences',
          'site',
          'TestSite1',
          'TestSite1.digitalExperience-meta.xml',
        ),
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
        const generator = new DigitalExperienceSiteGenerator(defaultMockInputs);
        await generator.generate();

        const routeContentCall = findCall((args) =>
          args[1].includes(path.join('sfdc_cms__route', route, 'content.json')),
        );
        const routeMetaCall = findCall((args) =>
          args[1].includes(path.join('sfdc_cms__route', route, '_meta.json')),
        );
        expect(
          routeContentCall,
          `Expected route content for ${route}`,
        ).toBeDefined();
        expect(routeMetaCall, `Expected route meta for ${route}`).toBeDefined();
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
        const generator = new DigitalExperienceSiteGenerator(defaultMockInputs);
        await generator.generate();

        const viewContentCall = findCall((args) =>
          args[1].includes(path.join('sfdc_cms__view', view, 'content.json')),
        );
        const viewMetaCall = findCall((args) =>
          args[1].includes(path.join('sfdc_cms__view', view, '_meta.json')),
        );
        expect(
          viewContentCall,
          `Expected view content for ${view}`,
        ).toBeDefined();
        expect(viewMetaCall, `Expected view meta for ${view}`).toBeDefined();
        expect(viewContentCall![2]).toHaveProperty('uuid');
        expect(typeof viewContentCall![2].uuid).toBe('function');
      });
    });

    ['scopedHeaderAndFooter', 'snaThemeLayout'].forEach((layout) => {
      it(`should generate theme layout: ${layout}`, async () => {
        const generator = new DigitalExperienceSiteGenerator(defaultMockInputs);
        await generator.generate();

        const layoutContentCall = findCall((args) =>
          args[1].includes(
            path.join('sfdc_cms__themeLayout', layout, 'content.json'),
          ),
        );
        const layoutMetaCall = findCall((args) =>
          args[1].includes(
            path.join('sfdc_cms__themeLayout', layout, '_meta.json'),
          ),
        );
        expect(
          layoutContentCall,
          `Expected layout content for ${layout}`,
        ).toBeDefined();
        expect(
          layoutMetaCall,
          `Expected layout meta for ${layout}`,
        ).toBeDefined();
        expect(layoutContentCall![2]).toHaveProperty('uuid');
        expect(typeof layoutContentCall![2].uuid).toBe('function');
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
        const generator = new DigitalExperienceSiteGenerator(defaultMockInputs);
        await generator.generate();

        const contentCall = findCall((args) =>
          args[1].includes(path.join(type, folder, 'content.json')),
        );
        const metaCall = findCall((args) =>
          args[1].includes(path.join(type, folder, '_meta.json')),
        );
        expect(contentCall, `Expected ${name} content`).toBeDefined();
        expect(metaCall, `Expected ${name} meta`).toBeDefined();
      });
    });

    it('should generate site content with correct urlName transformation', async () => {
      const options: DigitalExperienceSiteOptions = {
        ...defaultMockInputs,
        sitename: 'My "Test" Site!',
      };
      const generator = new DigitalExperienceSiteGenerator(options);
      await generator.generate();

      const siteContentCall = findCall((args) =>
        args[0].includes(path.join('sfdc_cms__site', 'content.json')),
      );
      expect(siteContentCall).toBeDefined();
      expect(siteContentCall![2]).toEqual({
        siteName: 'My \\"Test\\" Site!',
        urlName: 'my-test-site',
      });
    });
  });

  describe('site name transformations', () => {
    let renderSpy: MockInstance;

    beforeEach(() => {
      renderSpy = vi
        .spyOn(DigitalExperienceSiteGenerator.prototype as any, 'render')
        .mockResolvedValue(undefined);
    });

    [
      ['spaces to underscores', 'My   Site', 'My_Site', 'My_Site1'],
      ['special characters', 'Site@#$Name!', 'Site_Name', 'Site_Name1'],
      ['prefix X for leading number', '123Site', 'X123Site', 'X123Site1'],
      ['leading special chars then number', '##1Site', '_1Site', '_1Site1'],
    ].forEach(
      ([description, sitename, expectedDevName, expectedPicassoDevName]) => {
        it(`should transform site name: ${description}`, async () => {
          const options: DigitalExperienceSiteOptions = {
            ...defaultMockInputs,
            sitename,
          };
          const generator = new DigitalExperienceSiteGenerator(options);
          await generator.generate();

          const networkCall = renderSpy.mock.calls.find((args) =>
            args[1].includes('network-meta.xml'),
          );
          expect(networkCall![2].siteDevName).toBe(expectedDevName);
          expect(networkCall![2].picassoSiteDevName).toBe(
            expectedPicassoDevName,
          );
        });
      },
    );

    it('should encode special characters in network file name', async () => {
      const options: DigitalExperienceSiteOptions = {
        ...defaultMockInputs,
        sitename: "Site ~!.'()@#$%&+= Name",
      };
      const generator = new DigitalExperienceSiteGenerator(options);
      await generator.generate();

      const networkCall = renderSpy.mock.calls.find((args) =>
        args[1].includes('network-meta.xml'),
      );
      expect(networkCall![1]).toContain(
        'Site %7E%21%2E%27%28%29%40%23%24%25%26%2B%3D Name.network-meta.xml',
      );
    });
  });

  describe('UUID generation', () => {
    let renderSpy: MockInstance;

    beforeEach(() => {
      renderSpy = vi
        .spyOn(DigitalExperienceSiteGenerator.prototype as any, 'render')
        .mockResolvedValue(undefined);
    });

    const getViewContentCalls = () =>
      renderSpy.mock.calls.filter(
        (args) =>
          args[1].includes('sfdc_cms__view') &&
          args[1].includes('content.json'),
      );

    it('should generate valid UUID format', async () => {
      const generator = new DigitalExperienceSiteGenerator(defaultMockInputs);
      await generator.generate();

      const viewContentCalls = getViewContentCalls();
      expect(viewContentCalls.length).toBeGreaterThan(0);
      const uuidFunction = viewContentCalls[0][2].uuid;
      const uuid = uuidFunction();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should cache UUIDs by key', async () => {
      const generator = new DigitalExperienceSiteGenerator(defaultMockInputs);
      await generator.generate();

      const viewContentCalls = getViewContentCalls();
      expect(viewContentCalls.length).toBeGreaterThan(0);
      const uuidFunction = viewContentCalls[0][2].uuid;
      const key = 'test-key';
      const firstCall = uuidFunction(key);
      const secondCall = uuidFunction(key);

      expect(firstCall).toBe(secondCall);
    });

    it('should generate different UUIDs for different keys', async () => {
      const generator = new DigitalExperienceSiteGenerator(defaultMockInputs);
      await generator.generate();

      const viewContentCalls = getViewContentCalls();
      expect(viewContentCalls.length).toBeGreaterThan(0);
      const uuidFunction = viewContentCalls[0][2].uuid;
      const firstKey = uuidFunction('key1');
      const secondKey = uuidFunction('key2');

      expect(firstKey).not.toBe(secondKey);
    });

    it('should generate different UUIDs when called without key', async () => {
      const generator = new DigitalExperienceSiteGenerator(defaultMockInputs);
      await generator.generate();

      const viewContentCalls = getViewContentCalls();
      expect(viewContentCalls.length).toBeGreaterThan(0);
      const uuidFunction = viewContentCalls[0][2].uuid;
      const uuid1 = uuidFunction();
      const uuid2 = uuidFunction();

      expect(uuid1).not.toBe(uuid2);
    });
  });
});
