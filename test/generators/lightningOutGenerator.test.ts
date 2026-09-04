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
import LightningOutGenerator from '../../src/generators/lightningOutGenerator';
import { getDefaultApiVersion } from '../../src/generators/baseGenerator';
import { LightningOutOptions } from '../../src/utils/types';

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

const baseOpts = (
  outputdir: string,
  overrides: Partial<LightningOutOptions> = {}
): LightningOutOptions => ({
  appName: 'MyLoApp',
  runtime: 'LWR_CORE',
  components: ['c/myButton'],
  hostDomains: ['https://app.example.com'],
  eca: {
    name: 'MyLoApp_ECA',
    contactEmail: 'dev@example.com',
    callbackUrl: 'https://app.example.com/frontdoor.html',
  },
  outputdir,
  apiversion: getDefaultApiVersion(),
  ...overrides,
});

describe('LightningOutGenerator', () => {
  const outputDir = path.join('testsoutput', 'lightningout');
  beforeEach(async () => {
    await remove(outputDir);
  });
  after(async () => {
    await remove(outputDir);
  });

  describe('validateOptions', () => {
    it('reports all missing required inputs at once', () => {
      let msg = '';
      try {
        new LightningOutGenerator({ outputdir: outputDir } as unknown as LightningOutOptions);
      } catch (e) {
        msg = (e as Error).message;
      }
      expect(msg).to.match(/appName/);
      expect(msg).to.match(/eca\.name/);
      expect(msg).to.match(/runtime/);
      expect(msg).to.match(/hostDomains/);
      expect(msg).to.match(/callbackUrl/i);
    });
    it('throws when appName is not a valid DeveloperName', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { appName: '9bad' }))).to.throw(/appName/i);
    });
    it('throws when appName exceeds 64 chars', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { appName: 'A'.repeat(65) }))).to.throw(/appName/i);
    });
    it('throws when eca.name is not a valid DeveloperName', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { eca: { name: '1x', contactEmail: 'dev@example.com', callbackUrl: 'https://app.example.com/cb' } }))).to.throw(/eca\.name/i);
    });
    it('throws when runtime is not LWR_CORE or CLWR', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { runtime: 'NOPE' as LightningOutOptions['runtime'] }))).to.throw(/runtime/i);
    });
    it('throws when hostDomains is empty', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { hostDomains: [] }))).to.throw(/hostDomains/i);
    });
    it('throws when a hostDomain is not an https origin', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { hostDomains: ['http://app.example.com'] }))).to.throw(/https/i);
    });
    it('throws when a hostDomain contains a wildcard', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { hostDomains: ['https://*.example.com'] }))).to.throw(/wildcard/i);
    });
    it('throws when contactEmail is invalid', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { eca: { name: 'MyLoApp_ECA', contactEmail: 'not-an-email', callbackUrl: 'https://app.example.com/cb' } }))).to.throw(/email/i);
    });
    it('throws when callbackUrl is not https', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { eca: { name: 'MyLoApp_ECA', contactEmail: 'dev@example.com', callbackUrl: 'http://app.example.com/cb' } }))).to.throw(/callback/i);
    });
    it('throws when a component reference is malformed', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { components: ['badref'] }))).to.throw(/component/i);
    });
    it('accepts a valid CLWR definition and warns it is experimental', () => {
      const g = new LightningOutGenerator(baseOpts(outputDir, { runtime: 'CLWR' }));
      expect(g.warnings.join(' ')).to.match(/experimental/i);
    });
    it('warns (does not throw) on empty components', () => {
      const g = new LightningOutGenerator(baseOpts(outputDir, { components: [] }));
      expect(g.warnings.join(' ')).to.match(/component/i);
    });
    it('warns when the callback URL origin is not among the host domains', () => {
      const g = new LightningOutGenerator(baseOpts(outputDir, { eca: { name: 'MyLoApp_ECA', contactEmail: 'dev@example.com', callbackUrl: 'https://other.example.com/cb' } }));
      expect(g.warnings.join(' ')).to.match(/callback/i);
    });
  });

  describe('generate', () => {
    it('emits exactly the seven artifact types and NO iframe artifact', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const result = await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, { hostDomains: ['https://app.example.com', 'https://portal.example.com:8080'] })
      );
      assertFileExists(path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml'));
      assertFileExists(path.join(outputDir, 'settings', 'MyDomain.settings-meta.xml'));
      assertFileExists(path.join(outputDir, 'settings', 'Security.settings-meta.xml'));
      assertFileExists(path.join(outputDir, 'externalClientApps', 'MyLoApp_ECA.eca-meta.xml'));
      assertFileExists(path.join(outputDir, 'extlClntAppGlobalOauthSets', 'MyLoApp_ECA.ecaGlblOauth-meta.xml'));
      assertFileExists(path.join(outputDir, 'extlClntAppOauthSettings', 'MyLoApp_ECA.ecaOauth-meta.xml'));
      // one CORS file per host domain
      assertFileExists(path.join(outputDir, 'corsWhitelistOrigins', 'app_example_com.corsWhitelistOrigin-meta.xml'));
      assertFileExists(path.join(outputDir, 'corsWhitelistOrigins', 'portal_example_com_8080.corsWhitelistOrigin-meta.xml'));
      // NO iframe artifact
      expect(fs.existsSync(path.join(outputDir, 'iframeWhiteListUrlSettings'))).to.be.false;
      expect(result.created.length).to.be.greaterThan(0);
    });
    it('uses appName for the app file and eca.name for the ECA files', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.LightningOut, baseOpts(outputDir, { appName: 'AppX', eca: { name: 'EcaY', contactEmail: 'dev@example.com', callbackUrl: 'https://app.example.com/cb' } }));
      assertFileExists(path.join(outputDir, 'lightningOutApps', 'AppX.lightningOutApp-meta.xml'));
      assertFileExists(path.join(outputDir, 'externalClientApps', 'EcaY.eca-meta.xml'));
    });
    it('renders appName, runtime, and component refs into the LightningOutApp', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.LightningOut, baseOpts(outputDir, { runtime: 'CLWR', components: ['c/foo', 'c:bar'] }));
      const app = path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml');
      assertFileContent(app, 'CLWR');
      assertFileContent(app, 'c/foo');
      assertFileContent(app, 'c:bar');
      assertFileContent(app, '<applicationName>MyLoApp</applicationName>');
    });
    it('hardcodes distributionState=Local and OAuth scope Web', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.LightningOut, baseOpts(outputDir));
      assertFileContent(path.join(outputDir, 'externalClientApps', 'MyLoApp_ECA.eca-meta.xml'), '<distributionState>Local</distributionState>');
      assertFileContent(path.join(outputDir, 'extlClntAppOauthSettings', 'MyLoApp_ECA.ecaOauth-meta.xml'), /<commaSeparatedOauthScopes>Web<\/commaSeparatedOauthScopes>/);
    });
    it('keeps the consumer secret optional on the ECA global OAuth settings', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.LightningOut, baseOpts(outputDir));
      assertFileContent(path.join(outputDir, 'extlClntAppGlobalOauthSets', 'MyLoApp_ECA.ecaGlblOauth-meta.xml'), '<isConsumerSecretOptional>true</isConsumerSecretOptional>');
    });
    it('re-run overwrites without error (no silent-overwrite guard)', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.LightningOut, baseOpts(outputDir));
      let threw: Error | undefined;
      try {
        await templateService.create(TemplateType.LightningOut, baseOpts(outputDir));
      } catch (e) {
        threw = e as Error;
      }
      expect(threw, 're-run should not throw').to.be.undefined;
    });
  });
});
