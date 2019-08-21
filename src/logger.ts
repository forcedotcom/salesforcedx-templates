// a modified copy of yeoman-environments lib/util/log.js
// adapted to be a TypeScript file
// gathers the output and allows it to be fetched
// not using events
// not using color coding
// disabling tslint check on the let xxx = require lines to avoid having to mess with .d.ts files for now for those
'use strict';

/* tslint:disable no-var-requires */
/* tslint:disable only-arrow-functions*/
/* tslint:disable no-any*/

// tslint:disable-next-line:prefer-const
let util = require('util');
// tslint:disable-next-line:prefer-const
let table = require('text-table');
// tslint:disable-next-line:prefer-const
let logSymbols = require('log-symbols');

// padding step
// const step = '  ';
const padding = ' ';

// color -> status mappings
const colors: { [kind: string]: string } = {
  skip: 'yellow',
  force: 'yellow',
  create: 'green',
  invoke: 'bold',
  conflict: 'red',
  identical: 'cyan',
  info: 'gray'
};

export class Log {
  private output: string = '';
  private cleanOutput: string[] = [];

  constructor() {
    let that: { [kind: string]: any } = this;
    let self: Log = this;
    console.log('we are in the constructor');
    Object.keys(colors).forEach(function(status) {
      // Returns the logger
      that[status] = (...args: any[]) => {
        self.setCleanOutput(args);
        self.write(self.pad(status)).write(padding);
        self.write(self.applyNoStyle(args) + '\n');
        return self;
      };
    });
  }
  public log(msg: string, ctx: any): Log {
    msg = msg || '';
    if (typeof ctx === 'object' && !Array.isArray(ctx)) {
      this.output = this.output + this.formatter(msg, ctx);
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

  // A simple write method, with formatted message.
  //
  // Returns the logger
  public write(...args: any[]): Log {
    this.output = this.output + util.format.apply(util, args);
    return this;
  }

  public setCleanOutput(args: any) {
    this.cleanOutput.push(args);
  }

  // Same as `log.write()` but automatically appends a `\n` at the end
  // of the message.
  public writeln(...args: any[]): Log {
    this.write.apply(this, args);
    this.write('\n');
    return this;
  }

  // Convenience helper to write sucess status, this simply prepends the
  // message with a gren `✔`.
  public ok(...args: any[]): Log {
    this.write(
      logSymbols.success + ' ' + util.format.apply(util, arguments) + '\n'
    );
    return this;
  }

  public error(...args: any[]): Log {
    this.write(
      logSymbols.error + ' ' + util.format.apply(util, arguments) + '\n'
    );
    return this;
  }

  // tslint:disable-next-line:no-any
  public table(opts: any[] | any): any {
    // tslint:disable-next-line:no-any
    let tableData: any[] = [];

    opts = Array.isArray(opts) ? { rows: opts } : opts;
    opts.rows = opts.rows || [];

    // tslint:disable-next-line:only-arrow-functions
    // tslint:disable-next-line:no-any
    // tslint:disable-next-line:only-arrow-functions
    opts.rows.forEach(function(row: any) {
      tableData.push(row);
    });

    return table(tableData);
  }

  private pad(status: any) {
    let max = 'identical'.length;
    let delta = max - status.length;
    return delta ? new Array(delta + 1).join(' ') + status : status;
  }

  // borrowed from https://github.com/mikeal/logref/blob/master/main.js#L6-15
  private formatter(msg: string, ctx: any) {
    while (msg.indexOf('%') !== -1) {
      let start = msg.indexOf('%');
      let end = msg.indexOf(' ', start);

      if (end === -1) {
        end = msg.length;
      }

      msg =
        msg.slice(0, start) + ctx[msg.slice(start + 1, end)] + msg.slice(end);
    }

    return msg;
  }

  private applyNoStyle(inArgs: string[]): string {
    let args = inArgs;
    let argsLen = args.length;
    let str = '';

    if (argsLen > 1) {
      // don't slice `arguments`, it prevents v8 optimizations
      for (let a = 1; a < argsLen; a++) {
        str += ' ' + args[a];
      }
    } else {
      str = args[0];
    }
    return str;
  }
}
