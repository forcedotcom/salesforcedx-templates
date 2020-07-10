import { createEnv } from 'yeoman-environment';
import YeomanGenerator, { Answers } from 'yeoman-generator';
import { GeneratorResult, TemplateOptions } from '../types';
import { Log } from '../utils';

export class GeneratorContext<T extends TemplateOptions> {
  private generator: typeof YeomanGenerator;

  constructor(generator: typeof YeomanGenerator) {
    this.generator = generator;
  }

  public async create(options: T): Promise<GeneratorResult> {
    const adapter = new SfdxGeneratorAdapter();
    const env = createEnv(undefined, undefined, adapter);
    env.registerStub(this.generator, 'generator');

    options = this.setBaseDefaults(options);
    await env.run('generator', options, undefined);
    const { outputdir: outputDir } = options;

    return {
      outputDir,
      created: adapter.log.getCleanOutput(),
      rawOutput: `target dir = ${outputDir}\n${adapter.log.getOutput()}`
    };
  }

  private setBaseDefaults(options: T): T {
    options.apiversion = options.apiversion || this.getDefaultApiVersion();
    options.outputdir = options.outputdir || process.cwd();
    return options;
  }

  private getDefaultApiVersion(): string {
    const versionTrimmed = require('../../package.json').version.trim();
    return `${versionTrimmed.split('.')[0]}.0`;
  }
}

class SfdxGeneratorAdapter {
  public log = new Log();

  constructor() {}

  public prompt(
    opt: [YeomanGenerator.Questions],
    cb: () => void
  ): Promise<Answers> {
    const promptPromise = new Promise<Answers>(resolve => {
      const answers: Answers = {};
      answers[0] = '';
      resolve(answers);
    });
    promptPromise.then(cb || undefined).catch(() => {
      throw new Error('Error resolving conflicting files');
    });
    return promptPromise;
  }
}
