/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import AnalyticsTemplateGenerator from '../generators/analyticsTemplateGenerator';
import ApexClassGenerator from '../generators/apexClassGenerator';
import ApexTriggerGenerator from '../generators/apexTriggerGenerator';
import LightningAppGenerator from '../generators/lightningAppGenerator';
import LightningComponentGenerator from '../generators/lightningComponentGenerator';
import LightningEventGenerator from '../generators/lightningEventGenerator';
import LightningInterfaceGenerator from '../generators/lightningInterfaceGenerator';
import LightningTestGenerator from '../generators/lightningTestGenerator';
import ProjectGenerator from '../generators/projectGenerator';
import StaticResourceGenerator from '../generators/staticResourceGenerator';
import VisualforceComponentGenerator from '../generators/visualforceComponentGenerator';
import VisualforcePageGenerator from '../generators/visualforcePageGenerator';
import { BaseGenerator } from '../generators/baseGenerator';

export type GeneratorClass<TOptions extends TemplateOptions> = new (
  options: TOptions
) => BaseGenerator<TOptions>;

export type Generators =
  | typeof AnalyticsTemplateGenerator
  | typeof ApexClassGenerator
  | typeof ApexTriggerGenerator
  | typeof LightningAppGenerator
  | typeof LightningComponentGenerator
  | typeof LightningEventGenerator
  | typeof LightningTestGenerator
  | typeof LightningInterfaceGenerator
  | typeof ProjectGenerator
  | typeof StaticResourceGenerator
  | typeof VisualforceComponentGenerator
  | typeof VisualforcePageGenerator;

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
  LightningApp,
  LightningComponent,
  LightningEvent,
  LightningInterface,
  LightningTest,
  Project,
  VisualforceComponent,
  VisualforcePage,
  StaticResource,
}

export const generators = new Map<TemplateType, GeneratorClass<any>>([
  [TemplateType.AnalyticsTemplate, AnalyticsTemplateGenerator],
  [TemplateType.ApexClass, ApexClassGenerator],
  [TemplateType.ApexTrigger, ApexTriggerGenerator],
  [TemplateType.LightningApp, LightningAppGenerator],
  [TemplateType.LightningComponent, LightningComponentGenerator],
  [TemplateType.LightningEvent, LightningEventGenerator],
  [TemplateType.LightningInterface, LightningInterfaceGenerator],
  [TemplateType.LightningTest, LightningTestGenerator],
  [TemplateType.Project, ProjectGenerator],
  [TemplateType.StaticResource, StaticResourceGenerator],
  [TemplateType.VisualforceComponent, VisualforceComponentGenerator],
  [TemplateType.VisualforcePage, VisualforcePageGenerator],
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
export interface TemplateOptions {
  apiversion?: string;
  outputdir?: string;
}

export interface AnalyticsTemplateOptions extends TemplateOptions {
  templatename: string;
}

export interface ApexClassOptions extends TemplateOptions {
  template:
    | 'DefaultApexClass'
    | 'BasicUnitTest'
    | 'ApexUnitTest'
    | 'ApexException'
    | 'InboundEmailService';
  classname: string;
}

type ApexTriggerEvent =
  | 'before insert'
  | 'before update'
  | 'before delete'
  | 'after insert'
  | 'after update'
  | 'after delete'
  | 'after undelete';

export interface ApexTriggerOptions extends TemplateOptions {
  triggername: string;
  triggerevents: ApexTriggerEvent[];
  sobject: string;
  template: 'ApexTrigger';
}

export interface LightningAppOptions extends TemplateOptions {
  appname: string;
  template: 'DefaultLightningApp';
  internal: boolean;
}

export interface LightningComponentOptions extends TemplateOptions {
  componentname: string;
  template:
    | 'default'
    | 'analyticsDashboard'
    | 'analyticsDashboardWithStep'
    | 'typeScript';
  type: 'aura' | 'lwc';
  internal: boolean;
}

export interface LightningEventOptions extends TemplateOptions {
  eventname: string;
  template: 'DefaultLightningEvt';
  internal: boolean;
}

export interface LightningInterfaceOptions extends TemplateOptions {
  interfacename: string;
  template: 'DefaultLightningIntf';
  internal: boolean;
}

export interface LightningTestOptions extends TemplateOptions {
  template: 'DefaultLightningTest';
  testname: string;
  internal: boolean;
}

export interface ProjectOptions extends TemplateOptions {
  projectname: string;
  defaultpackagedir: string;
  /**
   * namespace
   * Note that namespace is a reserved keyword for yeoman generator
   */
  ns: string;
  template: 'standard' | 'empty' | 'analytics';
  manifest: boolean;
  loginurl: string;
}

export interface VisualforceComponentOptions extends TemplateOptions {
  componentname: string;
  label: string;
  template: 'DefaultVFComponent';
}

export interface VisualforcePageOptions extends TemplateOptions {
  pagename: string;
  label: string;
  template: 'DefaultVFPage';
}

export interface StaticResourceOptions extends TemplateOptions {
  resourcename: string;
  contenttype: string;
  template: 'empty';
}
