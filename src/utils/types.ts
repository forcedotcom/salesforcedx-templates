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

import AnalyticsTemplateGenerator from '../generators/analyticsTemplateGenerator';
import ApexClassGenerator from '../generators/apexClassGenerator';
import ApexTriggerGenerator from '../generators/apexTriggerGenerator';
import FlexipageGenerator from '../generators/flexipageGenerator';
import LightningAppGenerator from '../generators/lightningAppGenerator';
import LightningComponentGenerator from '../generators/lightningComponentGenerator';
import LightningEventGenerator from '../generators/lightningEventGenerator';
import LightningInterfaceGenerator from '../generators/lightningInterfaceGenerator';
import LightningTestGenerator from '../generators/lightningTestGenerator';
import DigitalExperienceSiteGenerator from '../generators/digitalExperienceSiteGenerator';
import ProjectGenerator from '../generators/projectGenerator';
import StaticResourceGenerator from '../generators/staticResourceGenerator';
import VisualforceComponentGenerator from '../generators/visualforceComponentGenerator';
import VisualforcePageGenerator from '../generators/visualforcePageGenerator';
import UIBundleGenerator from '../generators/uiBundleGenerator';
import { BaseGenerator } from '../generators/baseGenerator';

export type GeneratorClass<TOptions extends TemplateOptions> = new (
  options: TOptions,
  context?: GeneratorContext,
  cwd?: string,
) => BaseGenerator<TOptions>;

/**
 * Optional context for generators allowing fs and template path injection.
 * When not provided, defaults to Node's fs and __dirname-based template resolution.
 * cwd is owned by TemplateService; pass via constructor param.
 */
export type GeneratorContext = {
  /** Node-fs-compatible object. Defaults to require('node:fs'). Pass memfs for web. */
  readonly fs?: typeof import('node:fs');
  /** Absolute path to built-in templates root. Overrides __dirname-based resolution. */
  readonly templatesRootPath?: string;
};

export type Generators =
  | typeof AnalyticsTemplateGenerator
  | typeof ApexClassGenerator
  | typeof ApexTriggerGenerator
  | typeof FlexipageGenerator
  | typeof LightningAppGenerator
  | typeof LightningComponentGenerator
  | typeof LightningEventGenerator
  | typeof LightningTestGenerator
  | typeof LightningInterfaceGenerator
  | typeof DigitalExperienceSiteGenerator
  | typeof ProjectGenerator
  | typeof StaticResourceGenerator
  | typeof VisualforceComponentGenerator
  | typeof VisualforcePageGenerator
  | typeof UIBundleGenerator;

/**
 * Available Template types
 * Each template type must have a corresponding generator class:
 * - generator class file should locate in generators/
 * - generator class file should default export a generator class extending SfGenerator
 * - generator class file should have a name same as the type name, except with the first letter lowercased
 */
export enum TemplateType {
  AnalyticsTemplate,
  ApexClass,
  ApexTrigger,
  Flexipage,
  LightningApp,
  LightningComponent,
  LightningEvent,
  LightningInterface,
  LightningTest,
  DigitalExperienceSite,
  Project,
  VisualforceComponent,
  VisualforcePage,
  StaticResource,
  UIBundle,
}

export const generators = new Map<TemplateType, GeneratorClass<any>>([
  [TemplateType.AnalyticsTemplate, AnalyticsTemplateGenerator],
  [TemplateType.ApexClass, ApexClassGenerator],
  [TemplateType.ApexTrigger, ApexTriggerGenerator],
  [TemplateType.Flexipage, FlexipageGenerator],
  [TemplateType.LightningApp, LightningAppGenerator],
  [TemplateType.LightningComponent, LightningComponentGenerator],
  [TemplateType.LightningEvent, LightningEventGenerator],
  [TemplateType.LightningInterface, LightningInterfaceGenerator],
  [TemplateType.LightningTest, LightningTestGenerator],
  [TemplateType.DigitalExperienceSite, DigitalExperienceSiteGenerator],
  [TemplateType.Project, ProjectGenerator],
  [TemplateType.StaticResource, StaticResourceGenerator],
  [TemplateType.VisualforceComponent, VisualforceComponentGenerator],
  [TemplateType.VisualforcePage, VisualforcePageGenerator],
  [TemplateType.UIBundle, UIBundleGenerator],
]);

export type CreateOutput = {
  outputDir: string;
  created: string[];
  rawOutput: string;
};

/**
 * Template Options
 * If not supplied, the apiversion and outputdir use default values.
 */
export type TemplateOptions = {
  apiversion?: string;
  outputdir?: string;
};

export type AnalyticsTemplateOptions = {
  templatename: string;
} & TemplateOptions;

export type ApexClassOptions = {
  template:
    | 'DefaultApexClass'
    | 'BasicUnitTest'
    | 'ApexUnitTest'
    | 'ApexException'
    | 'InboundEmailService';
  classname: string;
} & TemplateOptions;

type ApexTriggerEvent =
  | 'before insert'
  | 'before update'
  | 'before delete'
  | 'after insert'
  | 'after update'
  | 'after delete'
  | 'after undelete';

export type ApexTriggerOptions = {
  triggername: string;
  triggerevents: ApexTriggerEvent[];
  sobject: string;
  template: 'ApexTrigger';
} & TemplateOptions;

export type LightningAppOptions = {
  appname: string;
  template: 'DefaultLightningApp';
  internal: boolean;
} & TemplateOptions;

export type LightningComponentOptions = {
  componentname: string;
  template:
    | 'default'
    | 'analyticsDashboard'
    | 'analyticsDashboardWithStep'
    | 'typeScript';
  type: 'aura' | 'lwc';
  internal: boolean;
} & TemplateOptions;

export type LightningEventOptions = {
  eventname: string;
  template: 'DefaultLightningEvt';
  internal: boolean;
} & TemplateOptions;

export type LightningInterfaceOptions = {
  interfacename: string;
  template: 'DefaultLightningIntf';
  internal: boolean;
} & TemplateOptions;

export type LightningTestOptions = {
  template: 'DefaultLightningTest';
  testname: string;
  internal: boolean;
} & TemplateOptions;

export type ProjectOptions = {
  projectname: string;
  defaultpackagedir: string;
  /**
   * namespace
   * Note that namespace is a reserved keyword for yeoman generator
   */
  ns: string;
  template:
    | 'standard'
    | 'empty'
    | 'analytics'
    | 'reactinternalapp'
    | 'reactexternalapp'
    | 'agent'
    | 'nativemobile';
  manifest: boolean;
  loginurl: string;
  lwcLanguage?: 'javascript' | 'typescript';
} & TemplateOptions;

export type VisualforceComponentOptions = {
  componentname: string;
  label: string;
  template: 'DefaultVFComponent';
} & TemplateOptions;

export type VisualforcePageOptions = {
  pagename: string;
  label: string;
  template: 'DefaultVFPage';
} & TemplateOptions;

export type StaticResourceOptions = {
  resourcename: string;
  contenttype: string;
  template: 'empty';
} & TemplateOptions;

export type UIBundleOptions = {
  bundlename: string;
  template: string;
  masterlabel?: string;
  internal?: boolean;
} & TemplateOptions;

export type FlexipageOptions = {
  flexipagename: string;
  template: 'RecordPage' | 'AppPage' | 'HomePage';
  flexipageTemplatesGitRepo?: string; // Optional - uses local templates if not provided
  forceLoadingRemoteRepo?: boolean;
  masterlabel?: string;
  description?: string;
  internal?: boolean;
  // RecordPage specific options
  entityName?: string; // Required for RecordPage (e.g., 'Account', 'Rental_Property__c')
  primaryField?: string; // Single primary field for dynamic highlights (e.g., 'Name')
  secondaryFields?: string[]; // Secondary fields for dynamic highlights (e.g., ['Industry', 'AnnualRevenue'])
  detailFields?: string[]; // Fields to display in the Details tab field section (e.g., ['Name', 'Phone', 'Industry'])
} & TemplateOptions;

export type DigitalExperienceSiteOptions = {
  template: string;
  sitename: string;
  urlpathprefix: string;
  adminemail: string;
} & TemplateOptions;
