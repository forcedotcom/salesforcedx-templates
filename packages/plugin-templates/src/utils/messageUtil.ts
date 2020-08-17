/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);

export type Token = string | number | boolean;

// TODO: Update util when sfdxdocgen is updated to support oclif
export class MessageUtil {
  /**
   * Get the message for a given key
   * @param key The key of the message
   * @param tokens The values to substitute in the message
   */
  public static get(key: string, tokens?: Token[]): string {
    return this.messages.getMessage(key, tokens);
  }

  /**
   * Get the description used in the --help output for the command
   * @param descriptionKey The message key for the description text
   * @param isLightningBundle If the command is for a lightning bundle
   * @param tokens The values to substitute in the message
   * @param extra Extra text to append to the description at the end
   */
  public static buildDescription(
    descriptionKey: string,
    isLightningBundle: boolean,
    tokens?: Token[],
    extra?: string
  ): string {
    return (
      this.messages.getMessage(descriptionKey, tokens) +
      '\n' +
      this.getHelpHead(isLightningBundle) +
      (extra || '')
    );
  }

  /**
   * Get the help text displayed in site documentation for the command
   *
   * **USE `buildDescription` FOR SETTING THE `description` PROPERTY OF
   * A COMMAND. THIS IS EXCLUSIVELY USED TO SET THE `help` PROPERTY ON THE COMMAND FOR
   * DOC GENERATING PURPOSES AND IS NOT SHOWN IN THE --help OUTPUT.**
   * @param examples Example uses of the command
   * @param isLightningBundle If the command is for a lightning bundle
   * @param extra Extra text to append to the help message before the examples
   */
  public static buildHelpText(
    examples: string[],
    isLightningBundle: boolean,
    extra?: string
  ): string {
    return (
      this.getHelpHead(isLightningBundle) +
      (extra || '') +
      this.messages.getMessage('HelpExamplesTitle') +
      examples.reduce((acc, current) => acc + `   ${current}\n`, '')
    );
  }

  private static messages = Messages.loadMessages(
    '@salesforce/plugin-templates',
    'messages'
  );

  private static getHelpHead(isLightning: boolean): string {
    return (
      this.messages.getMessage('HelpDefaults') +
      this.messages.getMessage('HelpOutputDirRelative') +
      (isLightning ? MessageUtil.get('HelpOutputDirRelativeLightning') : '')
    );
  }
}
