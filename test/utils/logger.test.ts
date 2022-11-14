/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { SinonStub, stub, assert } from 'sinon';
import { Log } from '../../src/utils';
import { getYeomanLogger, ILogRef } from '../../src/utils/logger';

const logger = new Log();
const output = 'create newClasses.cls\n create newClasses.cls-meta.xml\n';
const cleanOutput = ['newClass.cls', 'newClass.cls-meta.xml'];
logger.setOutput(output);
logger.setCleanOutput(cleanOutput);

describe('getOutput', () => {
  it('should return output', () => {
    const result = logger.getOutput();
    expect(result).to.eql(output);
  });
});

describe('getCleanOutput', () => {
  it('should return clean output', () => {
    const result = logger.getCleanOutput();
    expect(result).to.eql(cleanOutput);
  });
});

describe('pad', () => {
  it('should return a padded string if the given status is shorter than the max', () => {
    const status = 'skip';
    const result = logger.pad(status);
    expect(result).to.eql('     skip');
  });

  it('should return the original string if the given string is the same length as the max', () => {
    const status = 'identical';
    const result = logger.pad(status);
    expect(result).to.eql(status);
  });
});

describe('write', () => {
  it('should return Log with given arguments formatted and added to Log output', () => {
    const newOutput = 'extraClass.cls\n';
    logger.write(newOutput);
    expect(logger.getOutput()).to.eql(`${output}${newOutput}`);
  });
});

describe('yeoman Logger unit tests.', () => {
  const message = 'send a fake message';

  let log: Log;
  let yeomanLogger: ILogRef;

  let infoStub: SinonStub;

  beforeEach(() => {
    log = new Log();
    infoStub = stub(log, 'info');
    yeomanLogger = getYeomanLogger(log);
  });

  it('Should be able to call logger as a function.', () => {
    expect(yeomanLogger).not.to.equal(undefined);
    yeomanLogger(message);
    assert.calledOnce(infoStub);
    assert.calledWith(infoStub, message);
  });

  it('info()', () => {
    const result = yeomanLogger.info(message);
    expect(result).to.eql(yeomanLogger);
    assert.calledWith(infoStub, message);
  });

  it('skip()', () => {
    const skipStub = stub(log, 'skip').returns(log);
    const result = yeomanLogger.skip(message);
    expect(result).to.eql(yeomanLogger);
    assert.calledWith(skipStub, message);
  });

  it('identical()', () => {
    const identicalStub = stub(log, 'identical').returns(log);
    const result = yeomanLogger.identical(message);
    expect(result).to.eql(yeomanLogger);
    assert.calledWith(identicalStub, message);
  });

  it('conflict()', () => {
    const conflictStub = stub(log, 'conflict').returns(log);
    const result = yeomanLogger.conflict(message);
    expect(result).to.eql(yeomanLogger);
    assert.calledWith(conflictStub, message);
  });

  it('invoke()', () => {
    const invokeStub = stub(log, 'invoke').returns(log);
    const result = yeomanLogger.invoke(message);
    expect(result).to.eql(yeomanLogger);
    assert.calledWith(invokeStub, message);
  });

  it('create()', () => {
    const createStub = stub(log, 'create').returns(log);
    const result = yeomanLogger.create(message);
    expect(result).to.eql(yeomanLogger);
    assert.calledWith(createStub, message);
  });

  it('force()', () => {
    const forceStub = stub(log, 'force').returns(log);
    const result = yeomanLogger.force(message);
    expect(result).to.eql(yeomanLogger);
    assert.calledWith(forceStub, message);
  });

  it('clear()', () => {
    const clearStub = stub(log, 'clear');
    yeomanLogger.clear();
    assert.calledOnce(clearStub);
  });

  it('skip()', () => {
    const skipStub = stub(log, 'skip').returns(log);
    const result = yeomanLogger.skip(message);
    expect(result).to.eql(yeomanLogger);
    assert.calledWith(skipStub, message);
  });

  it('setCleanOutput()', () => {
    const setCleanOutputStub = stub(log, 'setCleanOutput');
    yeomanLogger.setCleanOutput(message);
    assert.calledWith(setCleanOutputStub, [message]);
  });

  it('setOutput()', () => {
    const setOutputStub = stub(log, 'setOutput');
    yeomanLogger.setOutput(message);
    assert.calledWith(setOutputStub, message);
  });

  it('pad()', () => {
    const padStub = stub(log, 'pad');
    yeomanLogger.pad(message);
    assert.calledWith(padStub, message);
  });

  it('write()', () => {
    const writeStub = stub(log, 'write');
    const result = yeomanLogger.write(message);
    expect(result).to.equal(yeomanLogger);
    assert.calledWith(writeStub, message);
  });

  it('getCleanOutput()', () => {
    const expected = ['abc1234'];
    const getCleanOutputStub = stub(log, 'getCleanOutput').returns(expected);
    const result = yeomanLogger.getCleanOutput();
    expect(result).to.equal(expected);
    assert.calledOnce(getCleanOutputStub);
  });

  it('getOutput()', () => {
    const expected = 'abc1234';
    const getOutputStub = stub(log, 'getOutput').returns(expected);
    const result = yeomanLogger.getOutput();
    expect(result).to.equal(expected);
    assert.calledOnce(getOutputStub);
  });
});
