/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// tslint:disable no-any
'use strict';

import * as util from 'util';
import * as table from 'text-table';
import * as logSymbols from 'log-symbols';

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

  constructor() {
    for (const status of statuses) {
      this[status] = (arg: string) => {
        this.cleanOutput.push(arg);
        this.write(this.pad(status)).write(padding);
        this.write(this.applyNoStyle(arg) + '\n');
        return this;
      };
    }
  }

  public log(msg: string, context: any): Log {
    msg = msg || '';
    if (typeof context === 'object' && !Array.isArray(context)) {
      this.output = this.output + this.formatter(msg, context);
    } else {
      this.output = msg;
    }

    return this;
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

  public writeln(...args: string[]): Log {
    this.write.apply(this, args);
    this.write('\n');
    return this;
  }

  public ok(...args: string[]): Log {
    this.write(
      logSymbols.success + ' ' + util.format.apply(util, arguments) + '\n'
    );
    return this;
  }

  public error(...args: string[]): Log {
    this.write(
      logSymbols.error + ' ' + util.format.apply(util, arguments) + '\n'
    );
    return this;
  }

  public table(opts: any[] | any): any {
    let tableData: any[] = [];

    opts = Array.isArray(opts) ? { rows: opts } : opts;
    opts.rows = opts.rows || [];

    opts.rows.forEach((row: string) => {
      tableData.push(row);
    });

    return table(tableData);
  }

  private pad(status: string) {
    let max = 'identical'.length;
    let delta = max - status.length;
    return delta ? new Array(delta + 1).join(' ') + status : status;
  }

  // borrowed from https://github.com/mikeal/logref/blob/master/main.js#L6-15
  private formatter(msg: string, context: any) {
    while (msg.indexOf('%') !== -1) {
      let start = msg.indexOf('%');
      let end = msg.indexOf(' ', start);

      if (end === -1) {
        end = msg.length;
      }

      msg =
        msg.slice(0, start) +
        context[msg.slice(start + 1, end)] +
        msg.slice(end);
    }

    return msg;
  }

  private applyNoStyle(args: string): string {
    let argsLen = args.length;
    let str = '';

    if (argsLen > 1) {
      for (let a = 0; a < argsLen; a++) {
        str += '' + args[a];
      }
    } else {
      str = args[0];
    }
    return str;
  }
}
