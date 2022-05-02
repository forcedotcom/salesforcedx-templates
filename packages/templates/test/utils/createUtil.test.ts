/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { nls } from '../../src/i18n';
import { CreateUtil } from '../../src/utils';

import { assert, expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { SinonStub, stub } from 'sinon';

/* tslint:disable: no-unused-expression */
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
    const templatesPath = path.resolve(
      __dirname,
      '../../src/templates',
      templateType
    );

    let readdirStub: SinonStub;

    beforeEach(() => {
      // @ts-ignore
      readdirStub = stub(fs, 'readdirSync');
    });

    afterEach(() => readdirStub.restore());

    it('should get template names for a given file suffix and folder name', () => {
      readdirStub
        .withArgs(templatesPath)
        .returns(['Template.cls', 'Template2.cls']);

      assertTemplateNames(['Template', 'Template2']);
    });

    it('should ignore files that do not have the given suffix', () => {
      readdirStub
        .withArgs(templatesPath)
        .returns(['Template.cls', '_class.cls-meta.xml']);

      assertTemplateNames(['Template']);
    });

    const assertTemplateNames = (names: string[]) => {
      const templates = CreateUtil.getCommandTemplatesForFiletype(
        /.cls$/,
        templateType
      );
      expect(templates).to.eql(names);
    };
  });

  describe('getCommandTemplatesInSubdirs', () => {
    const templateType = 'lightningcomponent';
    const templatePath = path.resolve(
      __dirname,
      '../../src/templates',
      templateType
    );
    const auraPath = path.join(templatePath, 'aura');

    function dirent(name: string, isDirectory: boolean): fs.Dirent {
      const ent = new fs.Dirent();
      ent.name = name;
      ent.isDirectory = () => isDirectory;
      ent.isFile = () => !isDirectory;
      return ent;
    }

    let readdirStub: SinonStub;

    beforeEach(() => {
      readdirStub = stub(fs, 'readdirSync');
    });

    afterEach(() => readdirStub.restore());

    it('should get template names', () => {
      readdirStub
        .withArgs(templatePath, { withFileTypes: true })
        .returns([
          dirent('Template1', true),
          dirent('Template2', true),
          dirent('afile.txt', false)
        ]);

      const templates = CreateUtil.getCommandTemplatesInSubdirs(templateType);
      expect(templates).to.eql(['Template1', 'Template2']);
    });

    it('should get template names for given subdir', () => {
      readdirStub
        .withArgs(auraPath, { withFileTypes: true })
        .returns([dirent('Template1', true), dirent('Template2', true)]);

      const templates = CreateUtil.getCommandTemplatesInSubdirs(templateType, {
        subdir: 'aura'
      });
      expect(templates).to.eql(['Template1', 'Template2']);
    });

    it('should ignore subdirs that do not have the given file suffix', () => {
      readdirStub
        .withArgs(auraPath, { withFileTypes: true })
        .returns([
          dirent('Template1', true),
          dirent('Template2', true),
          dirent('Template3', true)
        ]);
      readdirStub
        .withArgs(path.join(auraPath, 'Template1'), { withFileTypes: true })
        .returns([
          dirent('Template1.cmp', false),
          dirent('Template1Controller.js', false)
        ]);
      readdirStub
        .withArgs(path.join(auraPath, 'Template2'), { withFileTypes: true })
        .returns([dirent('randomfile.html', false)]);
      readdirStub
        .withArgs(path.join(auraPath, 'Template3'), { withFileTypes: true })
        .returns([]);

      const templates = CreateUtil.getCommandTemplatesInSubdirs(templateType, {
        subdir: 'aura',
        filetype: /\.cmp$/
      });
      expect(templates).to.eql(['Template1']);
    });
  });
});
