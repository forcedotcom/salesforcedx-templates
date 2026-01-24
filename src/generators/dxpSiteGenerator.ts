/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { CreateUtil } from '../utils';
import { DxpSiteOptions } from '../utils/types';
import { BaseGenerator } from './baseGenerator';
import { nls } from '../i18n';

const TEMPLATE_ROOT = 'dxpsite';

export default class DxpSiteGenerator extends BaseGenerator<DxpSiteOptions> {
  private uuidCache: Record<string, string> = {};

  constructor(options: DxpSiteOptions) {
    super(options);
  }

  public validateOptions(): void {
    // site name allows anything, but we will strip it down for dev name

    // url path prefix must be strictly alphanumeric, no "-" or "_", can start with a number
    // empty string is allowed (for sites without a prefix)
    const alphaRegExp = /^[a-zA-Z0-9]*$/;
    if (!alphaRegExp.test(this.options.urlpathprefix)) {
      throw new Error(
        nls.localize('AlphaNumericValidationError', 'url-path-prefix')
      );
    }

    CreateUtil.checkInputs(this.options.template);
  }

  public async generate(): Promise<void> {
    const { sitename, urlpathprefix, template } = this.options;

    const siteDevName = this.toSiteDevName(sitename);
    const picassoSiteDevName = this.toPicassoSiteDevName(siteDevName);

    this.sourceRootWithPartialPath(path.join(TEMPLATE_ROOT, template));

    await this.generateNetwork(
      sitename,
      siteDevName,
      picassoSiteDevName,
      urlpathprefix
    );

    await this.generateCustomSite(sitename, siteDevName, urlpathprefix);

    await this.generateDigitalExperienceConfig(
      sitename,
      picassoSiteDevName,
      urlpathprefix
    );

    const bundlePath = path.join(
      this.outputdir,
      'digitalExperiences',
      'site',
      picassoSiteDevName
    );
    await this.generateDEBMeta(bundlePath, picassoSiteDevName);
    await this.generateDEBAppPage(bundlePath);
    await this.generateDEBBrandingSet(bundlePath);
    await this.generateDEBLanguageSettings(bundlePath);
    await this.generateDEBMobilePublisherConfig(bundlePath);
    await this.generateDEBRoutes(bundlePath);
    await this.generateDEBSite(bundlePath, sitename, picassoSiteDevName);
    await this.generateDEBTheme(bundlePath);
    await this.generateDEBThemeLayouts(bundlePath);
    await this.generateDEBViews(bundlePath);
  }

  private async generateNetwork(
    siteName: string,
    siteDevName: string,
    picassoSiteDevName: string,
    urlPathPrefix: string
  ): Promise<void> {
    const fileName = this.encodeForFileName(siteName);
    await this.render(
      this.templatePath('_network.xml'),
      this.destinationPath(
        path.join(this.outputdir, 'networks', `${fileName}.network-meta.xml`)
      ),
      { siteName, siteDevName, picassoSiteDevName, urlPathPrefix }
    );
  }

  private async generateCustomSite(
    siteName: string,
    siteDevName: string,
    urlPathPrefix: string
  ): Promise<void> {
    await this.render(
      this.templatePath('_customSite.xml'),
      this.destinationPath(
        path.join(this.outputdir, 'sites', `${siteDevName}.site-meta.xml`)
      ),
      { siteName, siteDevName, urlPathPrefix }
    );
  }

  private async generateDigitalExperienceConfig(
    siteName: string,
    picassoSiteDevName: string,
    urlPathPrefix: string
  ): Promise<void> {
    await this.render(
      this.templatePath('_digitalExperienceConfig.xml'),
      this.destinationPath(
        path.join(
          this.outputdir,
          'digitalExperienceConfigs',
          `${picassoSiteDevName}.digitalExperienceConfig-meta.xml`
        )
      ),
      { siteName, picassoSiteDevName, urlPathPrefix }
    );
  }

  private async generateDEBMeta(
    bundlePath: string,
    picassoSiteDevName: string
  ): Promise<void> {
    await this.render(
      this.templatePath('_digitalExperience.xml'),
      this.destinationPath(
        path.join(
          bundlePath,
          `${picassoSiteDevName}.digitalExperience-meta.xml`
        )
      ),
      { picassoSiteDevName }
    );
  }

  private async generateDEBAppPage(bundlePath: string): Promise<void> {
    const appPagePath = path.join(
      bundlePath,
      'sfdc_cms__appPage',
      'mainAppPage'
    );
    await this.render(
      this.templatePath('sfdc_cms__appPage', 'mainAppPage', 'content.json'),
      this.destinationPath(path.join(appPagePath, 'content.json')),
      {}
    );
    await this.render(
      this.templatePath('sfdc_cms__appPage', 'mainAppPage', '_meta.json'),
      this.destinationPath(path.join(appPagePath, '_meta.json')),
      {}
    );
  }

  private async generateDEBBrandingSet(bundlePath: string): Promise<void> {
    const brandingPath = path.join(
      bundlePath,
      'sfdc_cms__brandingSet',
      'Build_Your_Own_LWR'
    );
    await this.render(
      this.templatePath(
        'sfdc_cms__brandingSet',
        'Build_Your_Own_LWR',
        'content.json'
      ),
      this.destinationPath(path.join(brandingPath, 'content.json')),
      {}
    );
    await this.render(
      this.templatePath(
        'sfdc_cms__brandingSet',
        'Build_Your_Own_LWR',
        '_meta.json'
      ),
      this.destinationPath(path.join(brandingPath, '_meta.json')),
      {}
    );
  }

  private async generateDEBLanguageSettings(bundlePath: string): Promise<void> {
    const langPath = path.join(
      bundlePath,
      'sfdc_cms__languageSettings',
      'languages'
    );
    await this.render(
      this.templatePath(
        'sfdc_cms__languageSettings',
        'languages',
        'content.json'
      ),
      this.destinationPath(path.join(langPath, 'content.json')),
      {}
    );
    await this.render(
      this.templatePath(
        'sfdc_cms__languageSettings',
        'languages',
        '_meta.json'
      ),
      this.destinationPath(path.join(langPath, '_meta.json')),
      {}
    );
  }

  private async generateDEBMobilePublisherConfig(
    bundlePath: string
  ): Promise<void> {
    const mobileConfigPath = path.join(
      bundlePath,
      'sfdc_cms__mobilePublisherConfig',
      'mobilePublisherConfig'
    );
    await this.render(
      this.templatePath(
        'sfdc_cms__mobilePublisherConfig',
        'mobilePublisherConfig',
        'content.json'
      ),
      this.destinationPath(path.join(mobileConfigPath, 'content.json')),
      {}
    );
    await this.render(
      this.templatePath(
        'sfdc_cms__mobilePublisherConfig',
        'mobilePublisherConfig',
        '_meta.json'
      ),
      this.destinationPath(path.join(mobileConfigPath, '_meta.json')),
      {}
    );
  }

  private async generateDEBRoutes(bundlePath: string): Promise<void> {
    const routes = [
      'Check_Password',
      'Error',
      'Forgot_Password',
      'Home',
      'Login',
      'News_Detail__c',
      'Register',
      'Service_Not_Available',
      'Too_Many_Requests',
    ];

    for (const route of routes) {
      const routePath = path.join(bundlePath, 'sfdc_cms__route', route);
      await this.render(
        this.templatePath('sfdc_cms__route', route, 'content.json'),
        this.destinationPath(path.join(routePath, 'content.json')),
        {}
      );
      await this.render(
        this.templatePath('sfdc_cms__route', route, '_meta.json'),
        this.destinationPath(path.join(routePath, '_meta.json')),
        {}
      );
    }
  }

  private async generateDEBSite(
    bundlePath: string,
    siteName: string,
    picassoSiteDevName: string
  ): Promise<void> {
    const urlName = siteName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // keep only alphanumeric characters
      .replace(/-$/, ''); // remove trailing hyphen
    const sitePath = path.join(
      bundlePath,
      'sfdc_cms__site',
      picassoSiteDevName
    );
    siteName = JSON.stringify(siteName) // escape special characters since this needs to be a JSON string
      .slice(1, -1); // remove quotes added by JSON.stringify
    await this.render(
      this.templatePath('sfdc_cms__site', 'content.json'),
      this.destinationPath(path.join(sitePath, 'content.json')),
      { siteName, urlName }
    );
    await this.render(
      this.templatePath('sfdc_cms__site', '_meta.json'),
      this.destinationPath(path.join(sitePath, '_meta.json')),
      { picassoSiteDevName }
    );
  }

  private async generateDEBTheme(bundlePath: string): Promise<void> {
    const themePath = path.join(
      bundlePath,
      'sfdc_cms__theme',
      'Build_Your_Own_LWR'
    );
    await this.render(
      this.templatePath(
        'sfdc_cms__theme',
        'Build_Your_Own_LWR',
        'content.json'
      ),
      this.destinationPath(path.join(themePath, 'content.json')),
      {}
    );
    await this.render(
      this.templatePath('sfdc_cms__theme', 'Build_Your_Own_LWR', '_meta.json'),
      this.destinationPath(path.join(themePath, '_meta.json')),
      {}
    );
  }

  private async generateDEBThemeLayouts(bundlePath: string): Promise<void> {
    const layouts = ['scopedHeaderAndFooter', 'snaThemeLayout'];

    for (const layout of layouts) {
      const layoutPath = path.join(bundlePath, 'sfdc_cms__themeLayout', layout);
      await this.render(
        this.templatePath('sfdc_cms__themeLayout', layout, 'content.json'),
        this.destinationPath(path.join(layoutPath, 'content.json')),
        { uuid: this.generateUUID.bind(this) }
      );
      await this.render(
        this.templatePath('sfdc_cms__themeLayout', layout, '_meta.json'),
        this.destinationPath(path.join(layoutPath, '_meta.json')),
        {}
      );
    }
  }

  private async generateDEBViews(bundlePath: string): Promise<void> {
    const views = [
      'checkPasswordResetEmail',
      'error',
      'forgotPassword',
      'home',
      'login',
      'newsDetail',
      'register',
      'serviceNotAvailable',
      'tooManyRequests',
    ];

    for (const view of views) {
      const viewPath = path.join(bundlePath, 'sfdc_cms__view', view);
      await this.render(
        this.templatePath('sfdc_cms__view', view, 'content.json'),
        this.destinationPath(path.join(viewPath, 'content.json')),
        { uuid: this.generateUUID.bind(this) }
      );
      await this.render(
        this.templatePath('sfdc_cms__view', view, '_meta.json'),
        this.destinationPath(path.join(viewPath, '_meta.json')),
        {}
      );
    }
  }

  private generateUUID(key: string | undefined): string {
    if (!key) {
      return crypto.randomUUID();
    }

    if (!this.uuidCache[key]) {
      this.uuidCache[key] = crypto.randomUUID();
    }

    return this.uuidCache[key];
  }

  private toSiteDevName(sitename: string): string {
    return sitename
      .replace(/[^a-zA-Z0-9]+/g, '_') // remove non-alphanumeric characters
      .replace(/_$/, '') // remove trailing underscore
      .replace(/^([0-9])/, 'X$1'); // prefix with X if it starts with a number
  }

  private toPicassoSiteDevName(siteDevName: string): string {
    return `${siteDevName}1`;
  }

  private encodeForFileName(str: string): string {
    const charMap = {
      '~': '%7E',
      '!': '%21',
      '.': '%2E',
      "'": '%27',
      '(': '%28',
      ')': '%29',
    };

    // encodeURIComponent is for URL, so we need additional steps to match filename
    // encoding from the server
    return encodeURIComponent(str)
      .replace(/%20/g, ' ')
      .replace(/[~!.'()]/g, (char) => charMap[char as keyof typeof charMap]);
  }
}
