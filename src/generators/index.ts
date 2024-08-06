/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { TemplateType } from '../utils/types';
import analyticsTemplateGenerator from './analyticsTemplateGenerator';
import apexClassGenerator from './apexClassGenerator';
import apexTriggerGenerator from './apexTriggerGenerator';
import lightningAppGenerator from './lightningAppGenerator';
import lightningComponentGenerator from './lightningComponentGenerator';
import lightningEventGenerator from './lightningEventGenerator';
import lightningInterfaceGenerator from './lightningInterfaceGenerator';
import lightningTestGenerator from './lightningTestGenerator';
import projectGenerator from './projectGenerator';
import staticResourceGenerator from './staticResourceGenerator';
import visualforceComponentGenerator from './visualforceComponentGenerator';
import visualforcePageGenerator from './visualforcePageGenerator';

export type Generators =
  | typeof analyticsTemplateGenerator
  | typeof apexClassGenerator
  | typeof apexTriggerGenerator
  | typeof lightningAppGenerator
  | typeof lightningComponentGenerator
  | typeof lightningEventGenerator
  | typeof lightningTestGenerator
  | typeof lightningInterfaceGenerator
  | typeof projectGenerator
  | typeof staticResourceGenerator
  | typeof visualforceComponentGenerator
  | typeof visualforcePageGenerator;

export const generators = new Map<TemplateType, Generators>([
  [TemplateType.AnalyticsTemplate, analyticsTemplateGenerator],
  [TemplateType.ApexClass, apexClassGenerator],
  [TemplateType.ApexTrigger, apexTriggerGenerator],
  [TemplateType.LightningApp, lightningAppGenerator],
  [TemplateType.LightningComponent, lightningComponentGenerator],
  [TemplateType.LightningEvent, lightningEventGenerator],
  [TemplateType.LightningInterface, lightningInterfaceGenerator],
  [TemplateType.LightningTest, lightningTestGenerator],
  [TemplateType.Project, projectGenerator],
  [TemplateType.VisualforceComponent, visualforceComponentGenerator],
  [TemplateType.VisualforcePage, visualforcePageGenerator],
  [TemplateType.StaticResource, staticResourceGenerator],
]);
