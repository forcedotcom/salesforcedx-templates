import * as generator from 'yeoman-generator';
import { OptionsMap } from './options';
import { Answers } from './options';
import * as logger from './logger';

export class ForceGeneratorAdapter {
  private values: OptionsMap;
  // tslint:disable-next-line:member-ordering
  public log: logger.Log = new logger.Log();

  constructor(values: OptionsMap) {
    this.values = values;
  }

  public prompt(opt: [generator.Questions], cb: () => void): Promise<Answers> {
    let localValues: OptionsMap = this.values;
    // tslint:disable-next-line:only-arrow-functions
    let promptPromise = new Promise<Answers>(function(resolve, reject) {
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

    promptPromise.then(cb || undefined);

    return promptPromise;
  }
}
