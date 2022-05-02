/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
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
  private output: string = '';
  private cleanOutput: string[] = [];

  // tslint:disable-next-line: no-any
  [index: string]: any;

  constructor() {
    for (const status of statuses) {
      this[status] = (arg: string) => {
        if (status !== 'identical' && status !== 'conflict') {
          this.cleanOutput.push(arg);
        }
        this.write(this.pad(status)).write(padding);
        this.write(`${arg}\n`);
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

  public write(...args: [string]): Log {
    /* eslint prefer-spread: off */
    this.output = this.output + util.format.apply(util, args);
    return this;
  }

  public pad(status: string) {
    const max = 'identical'.length;
    const delta = max - status.length;
    return delta ? new Array(delta + 1).join(' ') + status : status;
  }

  public setOutput(text: string) {
    this.output = text;
  }

  public setCleanOutput(cleanText: string[]) {
    this.cleanOutput = cleanText;
  }

  public clear() {
    this.output = '';
    this.cleanOutput = [];
  }
}

export interface ILogRef {
  (args: string): void;
  clear(): void;
  setCleanOutput(...args: string[]): void;
  setOutput(text: string): void;
  pad(status: string): string;
  write(arg: string): ILogRef;
  getCleanOutput(): string[];
  getOutput(): string;
  skip(arg: string): ILogRef;
  force(arg: string): ILogRef;
  create(arg: string): ILogRef;
  invoke(arg: string): ILogRef;
  conflict(arg: string): ILogRef;
  identical(arg: string): ILogRef;
  info(arg: string): ILogRef;
}

/**
 * The Yeoman adapter had a log property that has the unusual
 * requirement of being both a function and an object. See the yeoman
 * environment log implementation
 * https://github.com/yeoman/environment/blob/5f0e87b696c4926ba69b9fbd83e4486a02492fcc/lib/util/log.js#L59
 *
 * @param log The Log instance for the Yeoman logger to utilize.
 * @returns The log instance that is both a function and an object.
 */
export const getYeomanLogger = (log: Log): ILogRef => {
  const yeomanLogger = (args: string) => {
    log.info(args);
  };

  yeomanLogger.skip = (args: string) => {
    log.skip(args);
    return yeomanLogger;
  };

  yeomanLogger.force = (args: string) => {
    log.force(args);
    return yeomanLogger;
  };

  yeomanLogger.create = (args: string) => {
    log.create(args);
    return yeomanLogger;
  };

  yeomanLogger.invoke = (args: string) => {
    log.invoke(args);
    return yeomanLogger;
  };

  yeomanLogger.conflict = (args: string) => {
    log.conflict(args);
    return yeomanLogger;
  };

  yeomanLogger.identical = (args: string) => {
    log.identical(args);
    return yeomanLogger;
  };

  yeomanLogger.info = (args: string) => {
    log.info(args);
    return yeomanLogger;
  };

  yeomanLogger.clear = () => {
    log.clear();
  };

  yeomanLogger.setCleanOutput = (...args: string[]) => {
    log.setCleanOutput(args);
  };

  yeomanLogger.setOutput = (text: string) => {
    log.setOutput(text);
  };

  yeomanLogger.pad = (status: string) => {
    return log.pad(status);
  };

  yeomanLogger.write = (...args: [string]) => {
    log.write(...args);
    return yeomanLogger;
  };

  yeomanLogger.getCleanOutput = () => {
    return log.getCleanOutput();
  };

  yeomanLogger.getOutput = () => {
    return log.getOutput();
  };

  return yeomanLogger;
};
