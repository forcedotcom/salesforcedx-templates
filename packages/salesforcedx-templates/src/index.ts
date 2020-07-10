import {
  ApexClassGenerator,
  ApexClassOptions,
  GeneratorContext
} from './generators';
import { ApexTriggerOptions } from './generators/apexTriggerGenerator';

export const SfdxTemplates = {
  apexclass: new GeneratorContext<ApexClassOptions>(ApexClassGenerator),
  apextrigger: new GeneratorContext<ApexTriggerOptions>(ApexClassGenerator)
};
