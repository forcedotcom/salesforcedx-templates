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

  constructor() {
    let that: { [kind: string]: any } = this;
    let self: Log = this;
    console.log('we are in the constructor');
    Object.keys(colors).forEach(function(status) {
      // Each predefined status has its logging method utility, handling
      // status color and padding before the usual `.write()`
      //
      // Example
      //
      //    this.log
      //      .write()
      //      .info('Doing something')
      //      .force('Forcing filepath %s, 'some path')
      //      .conflict('on %s' 'model.js')
      //      .write()
      //      .ok('This is ok');
      //
      // The list of status and mapping colors
      //
      //    skip       yellow
      //    force      yellow
      //    create     green
      //    invoke     bold
      //    conflict   red
      //    identical  cyan
      //    info       grey
      //
      // Returns the logger
      that[status] = (...args: any[]) => {
        // let color = colors[status];
        // this.write(chalk[color](pad(status))).write(padding);
        // this.write(util.format.apply(util, arguments) + '\n');
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

  // _.extend(log, events.EventEmitter.prototype);

  public getOutput(): string {
    return this.output;
  }

  // A simple write method, with formatted message.
  //
  // Returns the logger
  public write(...args: any[]): Log {
    this.output = this.output + util.format.apply(util, args);
    return this;
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

  // log.on('up', function () {
  //   padding = padding + step;
  // });

  // log.on('down', function () {
  //   padding = padding.replace(step, '');
  // });

  // A basic wrapper around `cli-table` package, resetting any single
  // char to empty strings, this is used for aligning options and
  // arguments without too much Math on our side.
  //
  // - opts - A list of rows or an Hash of options to pass through cli
  //          table.
  //
  // Returns the table reprensetation
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

// `this.log` is a [logref](https://github.com/mikeal/logref)
// compatible logger, with an enhanced API.
//
// It also has EventEmitter like capabilities, so you can call on / emit
// on it, namely used to increase or decrease the padding.
//
// All logs are done against STDERR, letting you stdout for meaningfull
// value and redirection, should you need to generate output this way.
//
// Log functions take two arguments, a message and a context. For any
// other kind of paramters, `console.error` is used, so all of the
// console format string goodies you're used to work fine.
//
// - msg      - The message to show up
// - context  - The optional context to escape the message against
//
// Returns the logger
