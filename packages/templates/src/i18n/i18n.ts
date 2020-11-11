/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Conventions:
 * _message: is for unformatted text that will be shown as-is to
 * the user.
 * _text: is for text that will appear in the UI, possibly with
 * decorations, e.g., $(x) uses the https://octicons.github.com/ and should not
 * be localized
 *
 * If ommitted, we will assume _message.
 */
export const messages = {
  AlphaNumericNameError: 'Name must contain only alphanumeric characters.',
  NameMustStartWithLetterError: 'Name must start with a letter.',
  EndWithUnderscoreError: "Name can't end with an underscore.",
  DoubleUnderscoreError: "Name can't contain 2 consecutive underscores.",
  InvalidMimeType: 'The value of this argument must be a valid MIME type.',

  MissingWaveTemplatesDir:
    "Analytics templates must have a parent folder named 'waveTemplates'.",
  MissingAuraDir: "Lightning bundles must have a parent folder named 'aura'.",
  MissingLWCDir: "Lightning bundles must have a parent folder named 'lwc'.",

  LightningAppBundle: 'A Lightning Application Bundle',
  LightningComponentBundle: 'A Lightning Component Bundle',
  LightningEventBundle: 'A Lightning Event Bundle',
  LightningInterfaceBundle: 'A Lightning Interface Bundle',
  LightningTest: 'A Lightning Test',

  RawOutput: 'target dir = %s\n%s'
};
