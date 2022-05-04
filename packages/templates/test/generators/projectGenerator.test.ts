/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { expect } from 'chai';
import ProjectGenerator from '../../src/generators/projectGenerator';
import * as YeomanEnvironment from 'yeoman-environment';
import { CreateUtil } from '../../src/utils';
import { assert, restore, SinonStub, stub } from 'sinon';
import { ProjectOptions } from '../../src';

describe('ProjectGenerator Unit Tests', () => {
  const testEnv = YeomanEnvironment.createEnv();

  let mockProjectOptions: ProjectOptions & { env: any };
  let checkInputsStub: SinonStub;
  let mkdirSyncStub: SinonStub;
  let existsSyncStub: SinonStub;

  beforeEach(() => {
    mockProjectOptions = {
      projectname: 'testProject',
      defaultpackagedir: 'some/other/dir',
      ns: 'imunique',
      template: 'standard',
      manifest: false,
      loginurl: 'https://never.gonna.log.you.in.com',
      env: testEnv
    };
    checkInputsStub = stub(CreateUtil, 'checkInputs');
    mkdirSyncStub = stub(fs, 'mkdirSync').returns(undefined);
    existsSyncStub = stub(fs, 'existsSync').returns(false);
  });

  afterEach(() => {
    restore();
  });

  it('Should set the customInstallTask feature to false for the ProjectGenerator', () => {
    const generator = new ProjectGenerator([], mockProjectOptions as any);
    expect((generator as any).features.customInstallTask).to.equal(false);
  });

  it('Should attempt to validate template.', () => {
    const generator = new ProjectGenerator([], mockProjectOptions as any);
    checkInputsStub.reset();
    generator.validateOptions();
    assert.calledOnce(checkInputsStub);
    assert.calledWith(checkInputsStub, 'standard');
  });

  describe('writing()', () => {
    it('Should attempt to write template files with standard template.', () => {
      const generator = new ProjectGenerator([], mockProjectOptions as any);
      const copyTplStub = stub(generator.fs, 'copyTpl');
      copyTplStub.returns();
      generator.writing();
      assert.callCount(copyTplStub, 18);
      assert.callCount(existsSyncStub, 36);
      assert.callCount(mkdirSyncStub, 18);
    });

    it('Should attempt to write template files with empty template.', () => {
      mockProjectOptions.template = 'empty';
      const generator = new ProjectGenerator([], mockProjectOptions as any);
      const copyTplStub = stub(generator.fs, 'copyTpl');
      copyTplStub.returns();
      generator.writing();
      assert.callCount(copyTplStub, 4);
      assert.callCount(existsSyncStub, 12);
      assert.callCount(mkdirSyncStub, 8);
    });

    it('Should attempt to write template files with analytics template.', () => {
      mockProjectOptions.template = 'analytics';
      const generator = new ProjectGenerator([], mockProjectOptions as any);
      const copyTplStub = stub(generator.fs, 'copyTpl');
      copyTplStub.returns();
      generator.writing();
      assert.callCount(copyTplStub, 16);
      assert.callCount(existsSyncStub, 27);
      assert.callCount(mkdirSyncStub, 11);
    });
  });

  describe('writing() with manifest', () => {
    beforeEach(() => {
      mockProjectOptions.manifest = true;
    });

    it('Should attempt to write template files with standard template with manifest.', () => {
      const generator = new ProjectGenerator([], mockProjectOptions as any);
      const copyTplStub = stub(generator.fs, 'copyTpl');
      copyTplStub.returns();
      generator.writing();
      assert.callCount(copyTplStub, 19);
      assert.callCount(existsSyncStub, 37);
      assert.callCount(mkdirSyncStub, 18);
    });

    it('Should attempt to write template files with empty template with manifest.', () => {
      mockProjectOptions.template = 'empty';

      const generator = new ProjectGenerator([], mockProjectOptions as any);
      const copyTplStub = stub(generator.fs, 'copyTpl');
      copyTplStub.returns();
      generator.writing();
      assert.callCount(copyTplStub, 5);
      assert.callCount(existsSyncStub, 13);
      assert.callCount(mkdirSyncStub, 8);
    });

    it('Should attempt to write template files with analytics template with manifest.', () => {
      mockProjectOptions.template = 'analytics';
      const generator = new ProjectGenerator([], mockProjectOptions as any);
      const copyTplStub = stub(generator.fs, 'copyTpl');
      copyTplStub.returns();
      generator.writing();
      assert.callCount(copyTplStub, 17);
      assert.callCount(existsSyncStub, 28);
      assert.callCount(mkdirSyncStub, 11);
    });
  });
});
