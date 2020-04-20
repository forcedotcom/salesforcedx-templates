import { createEnv } from 'yeoman-environment';
import YeomanGenerator from 'yeoman-generator';
import SfdxGeneratorAdapter from './adapter';
import { TemplateOptions, GeneratorResult } from '../types';

export class GeneratorContext<T extends TemplateOptions> {
  private generator: typeof YeomanGenerator;

  constructor(generator: typeof YeomanGenerator) {
    this.generator = generator;
  }

  public async run(options: T): Promise<GeneratorResult> {
    const adapter = new SfdxGeneratorAdapter();
    // @ts-ignore
    const env = createEnv(undefined, undefined, adapter);
    env.registerStub(this.generator, 'generator');

    const result = await env.run('generator', options);
    const { outputdir: outputDir } = options;
    return {
      outputDir,
      created: adapter.log.getCleanOutput(),
      rawOutput: `target dir = ${outputDir}\n${adapter.log.getOutput()}`
    };
  }
}
