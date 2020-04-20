export type TemplateOptions = {
  apiversion: string;
  outputdir: string;
};

export type GeneratorResult = {
  outputDir: string;
  /**
   * Files created during generation
   */
  created: string[];
  /**
   * String representation of output results
   */
  rawOutput: string;
};
