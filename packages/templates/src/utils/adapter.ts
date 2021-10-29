/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as generator from 'yeoman-generator';
import { Log } from './logger';
import { Answers } from './types';

export class ForceGeneratorAdapter {
  public log = new Log();

  constructor() {}

  public prompt(opt: [generator.Questions], cb: () => void): Promise<Answers> {
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
