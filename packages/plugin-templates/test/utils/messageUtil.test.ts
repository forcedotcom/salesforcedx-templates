/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// tslint:disable: no-unused-expression

import { Messages } from '@salesforce/core';
import { expect } from 'chai';
import { MessageUtil } from '../../src/utils';

Messages.importMessagesDirectory(__dirname);

describe('MessageUtil', () => {
  const extra = 'some extra text';
  const expectedHelp = `${MessageUtil.get('HelpDefaults') +
    MessageUtil.get('HelpOutputDirRelative')}`;

  describe('get', () => {
    const messages = Messages.loadMessages(
      '@salesforce/plugin-templates',
      'messages'
    );

    it('should get a message with a given key', () => {
      expect(MessageUtil.get('Test')).to.equal(messages.getMessage('Test'));
    });

    it('should format message with given tokens', () => {
      expect(MessageUtil.get('TargetDirOutput', ['something'])).to.equal(
        messages.getMessage('TargetDirOutput', ['something'])
      );
    });
  });

  describe('buildDescription', () => {
    it('should build description', () => {
      expect(MessageUtil.buildDescription('Test', false)).to.equal(
        MessageUtil.get('Test') + '\n' + expectedHelp
      );
    });

    it('should build description for lightning bundles', () => {
      const bundleType = MessageUtil.get('App');
      expect(
        MessageUtil.buildDescription('LightningDescription', true, [bundleType])
      ).to.equal(
        MessageUtil.get('LightningDescription', [bundleType]) +
          '\n' +
          expectedHelp +
          MessageUtil.get('HelpOutputDirRelativeLightning')
      );
    });

    it('should build description with extra text', () => {
      expect(
        MessageUtil.buildDescription('Test', false, undefined, extra)
      ).to.equal(MessageUtil.get('Test') + '\n' + expectedHelp + extra);
    });

    it('should build description for lightning bundles with extra text', () => {
      const bundleType = MessageUtil.get('App');
      expect(
        MessageUtil.buildDescription(
          'LightningDescription',
          true,
          [bundleType],
          extra
        )
      ).to.equal(
        MessageUtil.get('LightningDescription', [bundleType]) +
          '\n' +
          expectedHelp +
          MessageUtil.get('HelpOutputDirRelativeLightning') +
          extra
      );
    });
  });

  describe('buildHelpText', () => {
    const examples = [
      '$ sfdx some:example:command',
      '$ sfdx some:example:command -t'
    ];

    it('should build help text', () => {
      expect(MessageUtil.buildHelpText(examples, false)).to.equal(
        expectedHelp +
          MessageUtil.get('HelpExamplesTitle') +
          examples.reduce((acc, current) => acc + `   ${current}\n`, '')
      );
    });

    it('should build help text for lightning bundle', () => {
      expect(MessageUtil.buildHelpText(examples, true)).to.equal(
        expectedHelp +
          MessageUtil.get('HelpOutputDirRelativeLightning') +
          MessageUtil.get('HelpExamplesTitle') +
          examples.reduce((acc, current) => acc + `   ${current}\n`, '')
      );
    });

    it('should build help text with extra text', () => {
      expect(MessageUtil.buildHelpText(examples, false, extra)).to.equal(
        expectedHelp +
          extra +
          MessageUtil.get('HelpExamplesTitle') +
          examples.reduce((acc, current) => acc + `   ${current}\n`, '')
      );
    });

    it('should build help text for lightning bundle with extra text', () => {
      expect(MessageUtil.buildHelpText(examples, true, extra)).to.equal(
        expectedHelp +
          MessageUtil.get('HelpOutputDirRelativeLightning') +
          extra +
          MessageUtil.get('HelpExamplesTitle') +
          examples.reduce((acc, current) => acc + `   ${current}\n`, '')
      );
    });
  });
});
