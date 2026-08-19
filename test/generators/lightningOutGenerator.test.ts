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
  name: 'MyLoApp',
  runtime: 'LWR_CORE',
  components: ['c-my-button'],
  hostDomains: ['https://app.example.com'],
  eca: { contactEmail: 'dev@example.com' },
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
    it('should throw when name is not a valid metadata name', () => {
      expect(
        () => new LightningOutGenerator(baseOpts(outputDir, { name: '9bad' }))
      ).to.throw(/name/i);
    });

    it('should throw when runtime is not LWR_CORE or CLWR', () => {
      expect(
        () =>
          new LightningOutGenerator(
            baseOpts(outputDir, {
              runtime: 'NOPE' as LightningOutOptions['runtime'],
            })
          )
      ).to.throw(/runtime/i);
    });

    it('should throw when components is empty', () => {
      expect(
        () => new LightningOutGenerator(baseOpts(outputDir, { components: [] }))
      ).to.throw(/components/i);
    });

    it('should throw when hostDomains is empty', () => {
      expect(
        () => new LightningOutGenerator(baseOpts(outputDir, { hostDomains: [] }))
      ).to.throw(/hostDomains/i);
    });

    it('should throw when a hostDomain is not an https origin', () => {
      expect(
        () =>
          new LightningOutGenerator(
            baseOpts(outputDir, {
              hostDomains: ['http://app.example.com'],
            })
          )
      ).to.throw(/https/i);
    });

    it('should throw when a hostDomain contains a wildcard', () => {
      expect(
        () =>
          new LightningOutGenerator(
            baseOpts(outputDir, {
              hostDomains: ['https://*.example.com'],
            })
          )
      ).to.throw(/https/i);
    });

    it('should throw when contactEmail is missing or invalid', () => {
      expect(
        () =>
          new LightningOutGenerator(
            baseOpts(outputDir, {
              eca: { contactEmail: 'not-an-email' },
            })
          )
      ).to.throw(/contactEmail/i);
    });

    it('should throw when distributionState is invalid', () => {
      expect(
        () =>
          new LightningOutGenerator(
            baseOpts(outputDir, {
              eca: {
                contactEmail: 'dev@example.com',
                distributionState:
                  'Bogus' as LightningOutOptions['eca']['distributionState'],
              },
            })
          )
      ).to.throw(/distributionState/i);
    });

    it('should accept a valid CLWR definition', () => {
      expect(
        () =>
          new LightningOutGenerator(
            baseOpts(outputDir, { runtime: 'CLWR' })
          )
      ).to.not.throw();
    });
  });

  describe('generate', () => {
    it('should emit all seven artifact types', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const result = await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, {
          hostDomains: ['https://app.example.com', 'https://portal.example.com'],
        })
      );

      assertFileExists(
        path.join(
          outputDir,
          'lightningOutApps',
          'MyLoApp.lightningOutApp-meta.xml'
        )
      );
      assertFileExists(
        path.join(
          outputDir,
          'iframeWhiteListUrlSettings',
          'IframeWhiteListUrlSettings.iframeWhiteListUrlSettings-meta.xml'
        )
      );
      assertFileExists(
        path.join(outputDir, 'settings', 'MyDomain.settings-meta.xml')
      );
      assertFileExists(
        path.join(outputDir, 'settings', 'Security.settings-meta.xml')
      );
      assertFileExists(
        path.join(outputDir, 'externalClientApps', 'MyLoApp.eca-meta.xml')
      );
      assertFileExists(
        path.join(
          outputDir,
          'extlClntAppGlobalOauthSets',
          'MyLoApp.ecaGlblOauth-meta.xml'
        )
      );
      assertFileExists(
        path.join(
          outputDir,
          'extlClntAppOauthSettings',
          'MyLoApp.ecaOauth-meta.xml'
        )
      );

      // One CORS file per host domain, named by sanitized origin.
      assertFileExists(
        path.join(
          outputDir,
          'corsWhitelistOrigins',
          'app_example_com.corsWhitelistOrigin-meta.xml'
        )
      );
      assertFileExists(
        path.join(
          outputDir,
          'corsWhitelistOrigins',
          'portal_example_com.corsWhitelistOrigin-meta.xml'
        )
      );

      expect(result.created.length).to.be.greaterThan(0);
    });

    it('should render the app name and runtime into the LightningOutApp', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, { runtime: 'CLWR', components: ['c-foo', 'c-bar'] })
      );
      const app = path.join(
        outputDir,
        'lightningOutApps',
        'MyLoApp.lightningOutApp-meta.xml'
      );
      assertFileContent(app, 'CLWR');
      assertFileContent(app, 'c-foo');
      assertFileContent(app, 'c-bar');
    });

    it('should not emit a double-hyphen inside the iframe XML comment (invalid XML — rejected by deploy)', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir)
      );
      const iframe = path.join(
        outputDir,
        'iframeWhiteListUrlSettings',
        'IframeWhiteListUrlSettings.iframeWhiteListUrlSettings-meta.xml'
      );
      const body = fs.readFileSync(iframe, 'utf8');
      const commentMatch = body.match(/<!--[\s\S]*?-->/);
      expect(commentMatch, 'iframe file should contain an XML comment').to.not.be
        .null;
      const inner = commentMatch![0].slice(4, -3); // strip <!-- and -->
      expect(inner, 'XML comments must not contain "--"').to.not.match(/--/);
    });

    it('should include the WARNING comment in the iframe artifact', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir)
      );
      assertFileContent(
        path.join(
          outputDir,
          'iframeWhiteListUrlSettings',
          'IframeWhiteListUrlSettings.iframeWhiteListUrlSettings-meta.xml'
        ),
        /WARNING/i
      );
    });

    it('should list only the app host domains in the iframe artifact by default', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, { hostDomains: ['https://app.example.com'] })
      );
      const iframe = path.join(
        outputDir,
        'iframeWhiteListUrlSettings',
        'IframeWhiteListUrlSettings.iframeWhiteListUrlSettings-meta.xml'
      );
      assertFileContent(iframe, 'https://app.example.com');
    });

    it('should MERGE existing entries + app domains when existingIframeEntries is supplied (Option B)', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, {
          hostDomains: ['https://app.example.com'],
          existingIframeEntries: [
            // a foreign-context entry that MUST be preserved verbatim
            { url: 'https://vf.example.com', context: 'Visualforce' },
            // an existing LightningOut entry that must NOT be duplicated
            { url: 'https://app.example.com', context: 'LightningOut' },
          ],
        })
      );
      const iframe = path.join(
        outputDir,
        'iframeWhiteListUrlSettings',
        'IframeWhiteListUrlSettings.iframeWhiteListUrlSettings-meta.xml'
      );
      const body = fs.readFileSync(iframe, 'utf8');
      // the foreign-context entry survives with its own context intact
      expect(body).to.include('https://vf.example.com');
      expect(body).to.include('<context>Visualforce</context>');
      expect(body).to.include('https://app.example.com');
      // de-duplicated: app.example.com appears exactly once
      const occurrences = body.split('https://app.example.com').length - 1;
      expect(occurrences, 'app.example.com should appear exactly once').to.equal(
        1
      );
    });
  });

  describe('Option A — no silent overwrite', () => {
    it('should throw if a target file already exists and force is not set', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir)
      );
      // Second run against the same dir must refuse to clobber.
      let threw: Error | undefined;
      try {
        await templateService.create(
          TemplateType.LightningOut,
          baseOpts(outputDir)
        );
      } catch (e) {
        threw = e as Error;
      }
      expect(threw, 'expected a throw on second run').to.be.instanceOf(Error);
      expect(threw!.message).to.match(/already exist/i);
    });

    it('should overwrite without error when force is true', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir)
      );
      let threw: Error | undefined;
      try {
        await templateService.create(
          TemplateType.LightningOut,
          baseOpts(outputDir, { force: true })
        );
      } catch (e) {
        threw = e as Error;
      }
      expect(threw, 'force:true should not throw').to.be.undefined;
    });
  });
});
