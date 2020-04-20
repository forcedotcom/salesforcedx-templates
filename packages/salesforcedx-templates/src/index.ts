import YeomanGenerator from 'yeoman-generator';
import { ApexClassGenerator, ApexClassOptions } from './generators';
import { TemplateOptions } from './types';
import { GeneratorContext } from './context/context';

export const SfdxGenerator = {
  apexclass: new GeneratorContext<ApexClassOptions>(ApexClassGenerator),
  apextrigger: new GeneratorContext<ApexClassOptions>(ApexClassGenerator)
};
