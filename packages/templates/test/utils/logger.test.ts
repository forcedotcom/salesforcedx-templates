/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { Log } from '../../src/utils';

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
