/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { nls, MessageKey } from '../../src/i18n/index';
import { CreateUtil } from '../../src/utils';

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return { ...actual, readdirSync: vi.fn(actual.readdirSync) };
});

const resetReaddir = async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  vi.mocked(fs.readdirSync).mockImplementation(actual.readdirSync);
};

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

    const assertErrorThrown = (input: string, errorName: MessageKey) => {
      expect(() => CreateUtil.checkInputs(input)).toThrow(
        nls.localize(errorName),
      );
    };
  });

  describe('getCommandTemplatesForFiletype', () => {
    const templateType = 'apexclass';
    const templatesPath = path.resolve(
      __dirname,
      '../../src/templates',
      templateType,
    );

    afterEach(resetReaddir);

    it('should get template names for a given file suffix and folder name', () => {
      vi.mocked(fs.readdirSync).mockImplementation(((p: string) => {
        if (p === templatesPath) {
          return ['Template.cls', 'Template2.cls'];
        }
        return [];
      }) as never);

      assertTemplateNames(['Template', 'Template2']);
    });

    it('should ignore files that do not have the given suffix', () => {
      vi.mocked(fs.readdirSync).mockImplementation(((p: string) => {
        if (p === templatesPath) {
          return ['Template.cls', '_class.cls-meta.xml'];
        }
        return [];
      }) as never);

      assertTemplateNames(['Template']);
    });

    const assertTemplateNames = (names: string[]) => {
      const templates = CreateUtil.getCommandTemplatesForFiletype(
        /.cls$/,
        templateType,
      );
      expect(templates).toEqual(names);
    };
  });

  describe('getCommandTemplatesInSubdirs', () => {
    const templateType = 'lightningcomponent';
    const templatePath = path.resolve(
      __dirname,
      '../../src/templates',
      templateType,
    );
    const auraPath = path.join(templatePath, 'aura');

    const dirent = (name: string, isDirectory: boolean): fs.Dirent => {
      const ent = new fs.Dirent();
      ent.name = name;
      ent.isDirectory = () => isDirectory;
      ent.isFile = () => !isDirectory;
      return ent;
    };

    afterEach(resetReaddir);

    it('should get template names', () => {
      vi.mocked(fs.readdirSync).mockImplementation(((p: string) => {
        if (p === templatePath) {
          return [
            dirent('Template1', true),
            dirent('Template2', true),
            dirent('afile.txt', false),
          ];
        }
        return [];
      }) as never);

      const templates = CreateUtil.getCommandTemplatesInSubdirs(templateType);
      expect(templates).toEqual(['Template1', 'Template2']);
    });

    it('should get template names for given subdir', () => {
      vi.mocked(fs.readdirSync).mockImplementation(((p: string) => {
        if (p === auraPath) {
          return [dirent('Template1', true), dirent('Template2', true)];
        }
        return [];
      }) as never);

      const templates = CreateUtil.getCommandTemplatesInSubdirs(templateType, {
        subdir: 'aura',
      });
      expect(templates).toEqual(['Template1', 'Template2']);
    });

    it('should ignore subdirs that do not have the given file suffix', () => {
      vi.mocked(fs.readdirSync).mockImplementation(((p: string) => {
        if (p === auraPath) {
          return [
            dirent('Template1', true),
            dirent('Template2', true),
            dirent('Template3', true),
          ];
        }
        if (p === path.join(auraPath, 'Template1')) {
          return [
            dirent('Template1.cmp', false),
            dirent('Template1Controller.js', false),
          ];
        }
        if (p === path.join(auraPath, 'Template2')) {
          return [dirent('randomfile.html', false)];
        }
        if (p === path.join(auraPath, 'Template3')) {
          return [];
        }
        return [];
      }) as never);

      const templates = CreateUtil.getCommandTemplatesInSubdirs(templateType, {
        subdir: 'aura',
        filetype: /\.cmp$/,
      });
      expect(templates).toEqual(['Template1']);
    });
  });
});
