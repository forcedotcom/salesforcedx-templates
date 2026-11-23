/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { nls } from '../../src/i18n';
import { CreateUtil } from '../../src/utils';

import { assert, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('CreateUtil', () => {
  describe('checkInputs', () => {
    it('should throw error for input with empty characters', () => {
      assertErrorThrown('', 'AlphaNumericNameError');
    });

    it('should throw error for input with non-alphanumeric characters', () => {
      assertErrorThrown('test!@#$%^&*()_+-=', 'AlphaNumericNameError');
    });

    it('should throw error for input that does not start with a letter', () => {
      assertErrorThrown('5test', 'NameMustStartWithLetterError');
    });

    it('should throw error for input that ends with an underscore', () => {
      assertErrorThrown('test_', 'EndWithUnderscoreError');
    });

    it('should throw error for input that contains a double underscore', () => {
      assertErrorThrown('test__c', 'DoubleUnderscoreError');
    });

    const assertErrorThrown = (input: string, errorName: string) => {
      try {
        CreateUtil.checkInputs(input);
        assert.fail(`Expected checkInputs to throw ${errorName} error.`);
      } catch (e) {
        const err = e as Error;
        expect(err.message).to.equal(nls.localize(errorName));
      }
    };
  });

  describe('getCommandTemplatesForFiletype', () => {
    const templateType = 'apexclass';
    const templatesPath = path.resolve(__dirname, '../../src/templates', templateType);

    let readdirStub: Mock;
    let fakeFs: typeof fs;

    beforeEach(() => {
      // The source accepts an injected `fs`; mock that rather than the real
      // `fs` namespace, whose members are non-writable under `module: nodenext`.
      readdirStub = vi.fn();
      fakeFs = { readdirSync: readdirStub } as unknown as typeof fs;
    });

    it('should get template names for a given file suffix and folder name', () => {
      readdirStub.mockReturnValue(['Template.cls', 'Template2.cls']);

      assertTemplateNames(['Template', 'Template2']);
    });

    it('should ignore files that do not have the given suffix', () => {
      readdirStub.mockReturnValue(['Template.cls', '_class.cls-meta.xml']);

      assertTemplateNames(['Template']);
    });

    const assertTemplateNames = (names: string[]) => {
      const templates = CreateUtil.getCommandTemplatesForFiletype(/.cls$/, templateType, fakeFs);
      expect(readdirStub).toHaveBeenCalledExactlyOnceWith(templatesPath);
      expect(templates).to.eql(names);
    };
  });

  describe('getCommandTemplatesInSubdirs', () => {
    const templateType = 'lightningcomponent';
    const templatePath = path.resolve(__dirname, '../../src/templates', templateType);
    const auraPath = path.join(templatePath, 'aura');

    function dirent(name: string, isDirectory: boolean): fs.Dirent {
      const ent = new fs.Dirent();
      ent.name = name;
      ent.isDirectory = () => isDirectory;
      ent.isFile = () => !isDirectory;
      return ent;
    }

    let readdirStub: Mock;
    let fakeFs: typeof fs;

    beforeEach(() => {
      readdirStub = vi.fn();
      fakeFs = { readdirSync: readdirStub } as unknown as typeof fs;
    });

    it('should get template names', () => {
      readdirStub.mockReturnValue([dirent('Template1', true), dirent('Template2', true), dirent('afile.txt', false)]);

      const templates = CreateUtil.getCommandTemplatesInSubdirs(templateType, {}, fakeFs);
      expect(readdirStub).toHaveBeenCalledExactlyOnceWith(templatePath, { withFileTypes: true });
      expect(templates).to.eql(['Template1', 'Template2']);
    });

    it('should get template names for given subdir', () => {
      readdirStub.mockReturnValue([dirent('Template1', true), dirent('Template2', true)]);

      const templates = CreateUtil.getCommandTemplatesInSubdirs(templateType, { subdir: 'aura' }, fakeFs);
      expect(readdirStub).toHaveBeenCalledExactlyOnceWith(auraPath, { withFileTypes: true });
      expect(templates).to.eql(['Template1', 'Template2']);
    });

    it('should ignore subdirs that do not have the given file suffix', () => {
      const directories = new Map([
        [auraPath, [dirent('Template1', true), dirent('Template2', true), dirent('Template3', true)]],
        [path.join(auraPath, 'Template1'), [dirent('Template1.cmp', false), dirent('Template1Controller.js', false)]],
        [path.join(auraPath, 'Template2'), [dirent('randomfile.html', false)]],
        [path.join(auraPath, 'Template3'), []]
      ]);
      readdirStub.mockImplementation((directory: string) => directories.get(directory));

      const templates = CreateUtil.getCommandTemplatesInSubdirs(
        templateType,
        { subdir: 'aura', filetype: /\.cmp$/ },
        fakeFs
      );
      for (const directory of directories.keys()) {
        expect(readdirStub).toHaveBeenCalledWith(directory, { withFileTypes: true });
      }
      expect(templates).to.eql(['Template1']);
    });
  });
});
