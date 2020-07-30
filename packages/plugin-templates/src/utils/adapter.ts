/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 * Derived from https://github.com/yeoman/environment/blob/master/lib/adapter.js
 */
import { StringKeyValueObject } from '@salesforce/templates/lib/utils/types';
import * as generator from 'yeoman-generator';
import { Log } from './logger';

export type Answers = StringKeyValueObject<string>;

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
