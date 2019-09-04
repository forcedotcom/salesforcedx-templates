/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// tslint:disable no-any
'use strict';

import * as util from 'util';

const padding = ' ';
const statuses = [
  'skip',
  'force',
  'create',
  'invoke',
  'conflict',
  'identical',
  'info'
];

export class Log {
  public output: string = '';
  public cleanOutput: string[] = [];

  constructor() {
    for (const status of statuses) {
      this[status] = (arg: string) => {
        if (status !== 'identical') {
          this.cleanOutput.push(arg);
        }
        this.write(this.pad(status)).write(padding);
        this.write(arg + '\n');
        return this;
      };
    }
  }

  public getOutput(): string {
    return this.output;
  }

  public getCleanOutput(): string[] {
    return this.cleanOutput;
  }

  public write(...args: string[]): Log {
    this.output = this.output + util.format.apply(util, args);
    return this;
  }

  public pad(status: string) {
    let max = 'identical'.length;
    let delta = max - status.length;
    return delta ? new Array(delta + 1).join(' ') + status : status;
  }
}
