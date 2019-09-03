/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as generator from 'yeoman-generator';
import { Log } from './logger';
import { Answers, OptionsMap } from './types';

export class ForceGeneratorAdapter {
  public log = new Log();

  // tslint:disable-next-line:no-any
  private values?: any;

  // tslint:disable-next-line:no-any
  constructor(values?: any) {
    this.values = values ? values : {};
  }

  public prompt(opt: [generator.Questions], cb: () => void): Promise<Answers> {
    const localValues: OptionsMap = this.values!;
    const promptPromise = new Promise<Answers>((resolve, reject) => {
      const answers: Answers = {};
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < opt.length; i++) {
        const question: generator.Questions = opt[i];
        // tslint:disable-next-line:no-unused-expression
        if (question === 'action') {
          answers[question.name] = 'write';
        } else {
          let retValue: string = localValues[0];
          if (!retValue) {
            retValue = '';
          }
          answers[0] = retValue;
        }
      }
      resolve(answers);
    });

    promptPromise.then(cb || undefined).catch(() => {
      throw new Error('Error resolving conflicting files');
    });

    return promptPromise;
  }
}
