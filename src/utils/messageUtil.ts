import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);

export class MessageUtil {
  /**
   * Get the message for a given key
   * @param key The key of the message
   * @param tokens The values to substitute in the message
   */
  public static get(
    key: string,
    tokens?: Array<string | number | boolean>
  ): string {
    return this.messages.getMessage(key, tokens);
  }

  /**
   * Get the description used in the --help output for the command
   * @param descriptionKey The message key for the description text
   * @param isLightning If the command is for a lightning bundle
   */
  public static buildDescription(
    descriptionKey: string,
    isLightning: boolean,
    tokens?: Array<string | number | boolean>
  ): string {
    return (
      this.messages.getMessage(descriptionKey, tokens) +
      '\n' +
      this.getHelpHead(isLightning)
    );
  }

  /**
   * Get the help text displayed in site documentation for the command
   *
   * **USE `buildDescription` FOR SETTING THE `description` PROPERTY OF
   * A COMMAND. THIS IS EXCLUSIVELY USED TO SET THE `help` PROPERTY ON THE COMMAND FOR
   * DOC GENERATING PURPOSES AND IS NOT SHOWN IN THE --help OUTPUT.**
   * @param examples Example uses of the command
   * @param isLightning If the command is for a lightning bundle
   */
  public static buildHelpText(
    examples: string[],
    isLightning: boolean
  ): string {
    return (
      this.getHelpHead(isLightning) +
      this.messages.getMessage('help_examples') +
      examples.reduce((acc, current) => acc + `   ${current}\n`, '')
    );
  }

  private static messages = Messages.loadMessages(
    'salesforcedx-templates',
    'messages'
  );

  private static getHelpHead(isLightning: boolean): string {
    return (
      this.messages.getMessage('help_defaults') +
      this.messages.getMessage(
        `help_outputdir_relative${isLightning ? '_lightning' : ''}`
      )
    );
  }
}
