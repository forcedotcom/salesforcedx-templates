/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as generator from 'yeoman-generator';
import { Answers, OptionsMap } from './types';
import { Log } from './logger';

export class ForceGeneratorAdapter {
  public log = new Log();
  // tslint:disable-next-line:no-any
  private values?: any;

  // tslint:disable-next-line:no-any
  constructor(values?: any) {
    this.values = values ? values : {};
  }

  public prompt(opt: [generator.Questions], cb: () => void): Promise<Answers> {
    let localValues: OptionsMap = this.values!;
    let promptPromise = new Promise<Answers>((resolve, reject) => {
      let answers: Answers = {};
      for (let i = 0; i < opt.length; i++) {
        let question: generator.Questions = opt[i];
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
