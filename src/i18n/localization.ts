/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as util from 'util';

const MISSING_LABEL_MSG = '!!! MISSING LABEL !!!';
export interface LocalizationProvider {
  localize(label: string, args?: string | string[]): string;
}

export class Localization implements LocalizationProvider {
  private readonly delegate: Message;

  constructor(delegate: Message) {
    this.delegate = delegate;
  }

  public localize(label: string, args?: string | string[]): string {
    return this.delegate.localize(label, args);
  }
}

export type MessageBundle = {
  readonly [index: string]: string;
};

export class Message implements LocalizationProvider {
  private readonly messages: MessageBundle;

  constructor(messages: MessageBundle) {
    this.messages = messages;
  }

  public localize(label: string, args?: string | string[]): string {
    let possibleLabel = this.getLabel(label);
    let formatArgs = args;

    if (typeof args === 'undefined' && possibleLabel) {
      return possibleLabel;
    }

    // Note: We are getting an array of arrays when we want to consume the ...args param
    // e.g. [['value1', 'value2']]
    if (typeof formatArgs !== 'undefined' && Array.isArray(formatArgs)) {
      formatArgs = Array.isArray(formatArgs[0]) ? formatArgs[0] : formatArgs;
    } else if (
      typeof formatArgs !== 'undefined' &&
      !Array.isArray(formatArgs)
    ) {
      formatArgs = [formatArgs];
    }

    if (!possibleLabel) {
      console.warn(`Missing label for key: ${label}`);
      possibleLabel = `${MISSING_LABEL_MSG} ${label}`;

      if (Array.isArray(formatArgs) && formatArgs.length >= 1) {
        formatArgs.forEach((arg) => {
          possibleLabel += ` (${arg})`;
        });
      }
      return possibleLabel;
    }

    if (Array.isArray(formatArgs) && formatArgs.length >= 1) {
      const expectedNumArgs = possibleLabel.split('%s').length - 1;
      if (formatArgs.length !== expectedNumArgs) {
        // just log it, we might want to hide some in some languages on purpose
        console.log(
          `Arguments do not match for label '${label}', got ${formatArgs.length} but want ${expectedNumArgs}`
        );
      }

      formatArgs.unshift(possibleLabel);
      return util.format(...formatArgs);
    }

    return possibleLabel;
  }

  private getLabel(label: string): string | undefined {
    if (this.messages[label]) {
      return this.messages[label];
    } else {
      return undefined;
    }
  }
}
