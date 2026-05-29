/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as chai from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { TemplateService, TemplateType } from '../../src';
import LightningEmbeddingGenerator from '../../src/generators/lightningEmbeddingGenerator';
import { getDefaultApiVersion } from '../../src/generators/baseGenerator';

chai.config.truncateThreshold = 100000;
const { expect } = chai;

async function remove(file: string) {
  await fs.promises.rm(file, { force: true, recursive: true });
}

function assertFileExists(file: string) {
  expect(fs.existsSync(file), `Expected file to exist: ${file}`).to.be.true;
}

function assertFileContent(file: string, needle: string | RegExp) {
  assertFileExists(file);
  const body = fs.readFileSync(file, 'utf8');
  const match =
    typeof needle === 'string' ? body.includes(needle) : needle.test(body);
  expect(match, `${file} did not match '${needle}'. Contained:\n\n${body}`).to
    .be.true;
}

describe('LightningEmbeddingGenerator', () => {
  const apiVersion = getDefaultApiVersion();
  const lwcOutputDir = path.join('testsoutput', 'lwc');
  const nonLwcOutputDir = path.join('testsoutput', 'embedding');

  beforeEach(async () => {
    await remove(lwcOutputDir);
    await remove(nonLwcOutputDir);
  });

  describe('validateOptions', () => {
    it('should throw when componentname is empty', () => {
      expect(
        () =>
          new LightningEmbeddingGenerator({
            componentname: '',
            src: 'https://app.example.com',
            sandbox: 'allow-scripts',
            shellTitle: 'Demo',
            outputdir: lwcOutputDir,
            internal: true,
          })
      ).to.throw();
    });

    it('should throw when not internal and outputdir is missing lwc parent', () => {
      expect(
        () =>
          new LightningEmbeddingGenerator({
            componentname: 'embeddingDemo',
            src: 'https://app.example.com',
            sandbox: 'allow-scripts',
            shellTitle: 'Demo',
            outputdir: nonLwcOutputDir,
            internal: false,
          })
      ).to.throw(/lwc/i);
    });

    it('should accept http src on localhost', () => {
      expect(
        () =>
          new LightningEmbeddingGenerator({
            componentname: 'embeddingDemo',
            src: 'http://localhost:3000',
            sandbox: 'allow-scripts',
            shellTitle: 'Demo',
            outputdir: lwcOutputDir,
            internal: true,
          })
      ).to.not.throw();
    });

    it('should accept http src on 127.0.0.1', () => {
      expect(
        () =>
          new LightningEmbeddingGenerator({
            componentname: 'embeddingDemo',
            src: 'http://127.0.0.1:8080',
            sandbox: 'allow-scripts',
            shellTitle: 'Demo',
            outputdir: lwcOutputDir,
            internal: true,
          })
      ).to.not.throw();
    });

    it('should reject http src on non-localhost host', () => {
      expect(
        () =>
          new LightningEmbeddingGenerator({
            componentname: 'embeddingDemo',
            src: 'http://app.example.com',
            sandbox: 'allow-scripts',
            shellTitle: 'Demo',
            outputdir: lwcOutputDir,
            internal: true,
          })
      ).to.throw(/https/i);
    });

    it('should reject non-URL src', () => {
      expect(
        () =>
          new LightningEmbeddingGenerator({
            componentname: 'embeddingDemo',
            src: 'not a url',
            sandbox: 'allow-scripts',
            shellTitle: 'Demo',
            outputdir: lwcOutputDir,
            internal: true,
          })
      ).to.throw(/https/i);
    });

    it('should reject non-http(s) protocols', () => {
      expect(
        () =>
          new LightningEmbeddingGenerator({
            componentname: 'embeddingDemo',
            src: 'ftp://example.com',
            sandbox: 'allow-scripts',
            shellTitle: 'Demo',
            outputdir: lwcOutputDir,
            internal: true,
          })
      ).to.throw(/https/i);
    });

    it('should reject empty shellTitle', () => {
      expect(
        () =>
          new LightningEmbeddingGenerator({
            componentname: 'embeddingDemo',
            src: 'https://app.example.com',
            sandbox: 'allow-scripts',
            shellTitle: '   ',
            outputdir: lwcOutputDir,
            internal: true,
          })
      ).to.throw(/shell-title/i);
    });

    it('should reject invalid sandbox tokens', () => {
      expect(
        () =>
          new LightningEmbeddingGenerator({
            componentname: 'embeddingDemo',
            src: 'https://app.example.com',
            sandbox: 'allow-scripts allow-everything',
            shellTitle: 'Demo',
            outputdir: lwcOutputDir,
            internal: true,
          })
      ).to.throw(/allow-everything/);
    });

    it('should accept multiple valid sandbox tokens', () => {
      expect(
        () =>
          new LightningEmbeddingGenerator({
            componentname: 'embeddingDemo',
            src: 'https://app.example.com',
            sandbox: 'allow-scripts allow-forms allow-same-origin',
            shellTitle: 'Demo',
            outputdir: lwcOutputDir,
            internal: true,
          })
      ).to.not.throw();
    });

    it('should reject a single-quote character in src (would break the generated JS string)', () => {
      expect(
        () =>
          new LightningEmbeddingGenerator({
            componentname: 'embeddingDemo',
            src: "https://app.example.com/path?q='foo",
            sandbox: 'allow-scripts',
            shellTitle: 'Demo',
            outputdir: lwcOutputDir,
            internal: true,
          })
      ).to.throw(/single-quote/);
    });

    it('should reject a double-quote character in shellTitle (would break the generated HTML attribute)', () => {
      expect(
        () =>
          new LightningEmbeddingGenerator({
            componentname: 'embeddingDemo',
            src: 'https://app.example.com',
            sandbox: 'allow-scripts',
            shellTitle: 'My "App"',
            outputdir: lwcOutputDir,
            internal: true,
          })
      ).to.throw(/double-quote/);
    });
  });

  describe('generate', () => {
    it('should create the LWC bundle (internal — no meta xml)', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const result = await templateService.create(
        TemplateType.LightningEmbedding,
        {
          componentname: 'embeddingDemo',
          src: 'https://app.example.com',
          sandbox: 'allow-scripts allow-forms',
          shellTitle: 'Demo Shell',
          outputdir: lwcOutputDir,
          apiversion: apiVersion,
          internal: true,
        }
      );

      const base = path.join(lwcOutputDir, 'embeddingDemo');
      assertFileExists(path.join(base, 'embeddingDemo.html'));
      assertFileExists(path.join(base, 'embeddingDemo.js'));
      assertFileExists(path.join(base, 'embeddingDemo.css'));
      expect(
        fs.existsSync(path.join(base, 'embeddingDemo.js-meta.xml')),
        'meta xml should not exist for internal'
      ).to.be.false;

      assertFileContent(path.join(base, 'embeddingDemo.html'), 'allow-scripts');
      assertFileContent(path.join(base, 'embeddingDemo.html'), 'Demo Shell');
      assertFileContent(path.join(base, 'embeddingDemo.js'), 'EmbeddingDemo');
      assertFileContent(
        path.join(base, 'embeddingDemo.js'),
        'https://app.example.com'
      );

      expect(result.created.length).to.be.greaterThan(0);
    });

    it('should generate meta xml when not internal', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.LightningEmbedding, {
        componentname: 'embeddingDemo',
        src: 'https://app.example.com',
        sandbox: 'allow-scripts',
        shellTitle: 'Public Shell',
        outputdir: lwcOutputDir,
        apiversion: apiVersion,
        internal: false,
      });

      const meta = path.join(
        lwcOutputDir,
        'embeddingDemo',
        'embeddingDemo.js-meta.xml'
      );
      assertFileExists(meta);
      assertFileContent(meta, 'Embedding Demo');
      assertFileContent(meta, apiVersion);
    });
  });
});
