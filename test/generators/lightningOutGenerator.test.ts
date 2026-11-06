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
import { type LightningOutOptions } from '../../src/utils/types';

chai.config.truncateThreshold = 100000;
const { expect } = chai;

async function remove(file: string) {
  await fs.promises.rm(file, { force: true, recursive: true });
}

function assertFileExists(file: string) {
  expect(fs.existsSync(file), `Expected file to exist: ${file}`).to.be.true;
}

function listFiles(dir: string): string[] {
  return (fs.readdirSync(dir, { recursive: true }) as string[])
    .filter((f) => fs.statSync(path.join(dir, f)).isFile())
    .sort();
}

function assertFileContent(file: string, needle: string | RegExp) {
  assertFileExists(file);
  const body = fs.readFileSync(file, 'utf8');
  const match = typeof needle === 'string' ? body.includes(needle) : needle.test(body);
  expect(match, `${file} did not match '${needle}'. Contained:\n\n${body}`).to.be.true;
}

const baseOpts = (outputdir: string, overrides: Partial<LightningOutOptions> = {}): LightningOutOptions => ({
  appName: 'MyLoApp',
  runtime: 'LWR_CORE',
  components: ['c/myButton'],
  hostDomains: ['https://app.example.com'],
  eca: {
    name: 'MyLoApp_ECA',
    contactEmail: 'dev@example.com',
    callbackUrl: 'https://app.example.com/frontdoor.html'
  },
  outputdir,
  apiversion: getDefaultApiVersion(),
  ...overrides
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
        new LightningOutGenerator({
          outputdir: outputDir
        } as unknown as LightningOutOptions);
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
      expect(
        () =>
          new LightningOutGenerator(
            baseOpts(outputDir, {
              eca: {
                name: '1x',
                contactEmail: 'dev@example.com',
                callbackUrl: 'https://app.example.com/cb'
              }
            })
          )
      ).to.throw(/eca\.name/i);
    });
    it('throws when runtime is not LWR_CORE or CLWR', () => {
      expect(
        () =>
          new LightningOutGenerator(
            baseOpts(outputDir, {
              runtime: 'NOPE' as LightningOutOptions['runtime']
            })
          )
      ).to.throw(/runtime/i);
    });
    it('throws when hostDomains is empty', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { hostDomains: [] }))).to.throw(/hostDomains/i);
    });
    it('accepts an http hostDomain (Core allows any http/https origin, not just localhost)', () => {
      expect(
        () => new LightningOutGenerator(baseOpts(outputDir, { hostDomains: ['http://app.example.com'] }))
      ).to.not.throw();
    });
    it('throws when a hostDomain uses a non-http(s) scheme', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { hostDomains: ['ftp://app.example.com'] }))).to.throw(
        /http or https/i
      );
    });
    it('throws when a hostDomain contains a wildcard', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { hostDomains: ['https://*.example.com'] }))).to.throw(
        /wildcard/i
      );
    });
    it('throws when contactEmail is invalid', () => {
      expect(
        () =>
          new LightningOutGenerator(
            baseOpts(outputDir, {
              eca: {
                name: 'MyLoApp_ECA',
                contactEmail: 'not-an-email',
                callbackUrl: 'https://app.example.com/cb'
              }
            })
          )
      ).to.throw(/email/i);
    });
    it('throws when callbackUrl is not https', () => {
      expect(
        () =>
          new LightningOutGenerator(
            baseOpts(outputDir, {
              eca: {
                name: 'MyLoApp_ECA',
                contactEmail: 'dev@example.com',
                callbackUrl: 'http://app.example.com/cb'
              }
            })
          )
      ).to.throw(/callback/i);
    });
    it('throws when a component reference is malformed', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { components: ['badref'] }))).to.throw(/component/i);
    });
    it('accepts a valid CLWR definition without throwing', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { runtime: 'CLWR' }))).to.not.throw();
    });
    it('does not throw on empty components', () => {
      expect(() => new LightningOutGenerator(baseOpts(outputDir, { components: [] }))).to.not.throw();
    });

    describe('site and access (CLWR only)', () => {
      const guestOpts = (overrides: Partial<LightningOutOptions> = {}): LightningOutOptions => ({
        appName: 'MyLoApp',
        runtime: 'CLWR',
        access: 'guest',
        components: ['c/myButton'],
        outputdir: outputDir,
        apiversion: getDefaultApiVersion(),
        ...overrides
      });

      it('throws when site is set on an LWR_CORE definition', () => {
        expect(() => new LightningOutGenerator(baseOpts(outputDir, { site: 'my_site' }))).to.throw(/site.*CLWR/i);
      });
      it('throws when access is set on an LWR_CORE definition, even "authenticated"', () => {
        expect(() => new LightningOutGenerator(baseOpts(outputDir, { access: 'authenticated' }))).to.throw(
          /access.*CLWR/i
        );
      });
      it('throws when access is not guest or authenticated', () => {
        expect(
          () =>
            new LightningOutGenerator(
              baseOpts(outputDir, { runtime: 'CLWR', access: 'public' as LightningOutOptions['access'] })
            )
        ).to.throw(/access must be one of: guest, authenticated/);
      });
      it('throws when site is blank', () => {
        expect(() => new LightningOutGenerator(baseOpts(outputDir, { runtime: 'CLWR', site: '   ' }))).to.throw(
          /site/i
        );
      });
      it('throws when site is not a string', () => {
        expect(
          () =>
            new LightningOutGenerator(
              baseOpts(outputDir, { runtime: 'CLWR', site: ['a'] as unknown as LightningOutOptions['site'] })
            )
        ).to.throw(/site/i);
      });
      it('accepts site on an authenticated CLWR definition', () => {
        expect(
          () => new LightningOutGenerator(baseOpts(outputDir, { runtime: 'CLWR', access: 'authenticated', site: 's' }))
        ).to.not.throw();
      });
      it('guest needs neither eca nor hostDomains', () => {
        expect(() => new LightningOutGenerator(guestOpts({ site: 'my_site' }))).to.not.throw();
      });
      it('guest does not validate an eca block it will not emit', () => {
        expect(
          () =>
            new LightningOutGenerator(
              guestOpts({ eca: { name: '1bad', contactEmail: 'nope', callbackUrl: 'http://x' } })
            )
        ).to.not.throw();
      });
      it('guest still validates hostDomains when given', () => {
        expect(() => new LightningOutGenerator(guestOpts({ hostDomains: ['ftp://x.example.com'] }))).to.throw(
          /http or https/i
        );
      });
      it('authenticated CLWR still requires eca and hostDomains', () => {
        let msg = '';
        try {
          new LightningOutGenerator({
            appName: 'MyLoApp',
            runtime: 'CLWR',
            access: 'authenticated',
            outputdir: outputDir
          } as unknown as LightningOutOptions);
        } catch (e) {
          msg = (e as Error).message;
        }
        expect(msg).to.match(/hostDomains/);
        expect(msg).to.match(/eca\.name/);
      });
    });
    it('does not throw when the callback URL origin is not among the host domains', () => {
      expect(
        () =>
          new LightningOutGenerator(
            baseOpts(outputDir, {
              eca: {
                name: 'MyLoApp_ECA',
                contactEmail: 'dev@example.com',
                callbackUrl: 'https://other.example.com/cb'
              }
            })
          )
      ).to.not.throw();
    });
  });

  describe('generate', () => {
    it('emits exactly the seven artifact types and NO iframe artifact', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const result = await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, {
          hostDomains: ['https://app.example.com', 'https://portal.example.com:8080']
        })
      );
      assertFileExists(path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml'));
      assertFileExists(path.join(outputDir, 'settings', 'MyDomain.settings-meta.xml'));
      assertFileExists(path.join(outputDir, 'settings', 'Security.settings-meta.xml'));
      assertFileExists(path.join(outputDir, 'externalClientApps', 'MyLoApp_ECA.eca-meta.xml'));
      assertFileExists(path.join(outputDir, 'extlClntAppGlobalOauthSets', 'MyLoApp_ECA.ecaGlblOauth-meta.xml'));
      assertFileExists(path.join(outputDir, 'extlClntAppOauthSettings', 'MyLoApp_ECA.ecaOauth-meta.xml'));
      // one CORS file per host domain
      assertFileExists(path.join(outputDir, 'corsWhitelistOrigins', 'app_example_com.corsWhitelistOrigin-meta.xml'));
      assertFileExists(
        path.join(outputDir, 'corsWhitelistOrigins', 'portal_example_com_8080.corsWhitelistOrigin-meta.xml')
      );
      // NO iframe artifact
      expect(fs.existsSync(path.join(outputDir, 'iframeWhiteListUrlSettings'))).to.be.false;
      expect(result.created.length).to.be.greaterThan(0);
    });
    it('uses appName for the app file and eca.name for the ECA files', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, {
          appName: 'AppX',
          eca: {
            name: 'EcaY',
            contactEmail: 'dev@example.com',
            callbackUrl: 'https://app.example.com/cb'
          }
        })
      );
      assertFileExists(path.join(outputDir, 'lightningOutApps', 'AppX.lightningOutApp-meta.xml'));
      assertFileExists(path.join(outputDir, 'externalClientApps', 'EcaY.eca-meta.xml'));
    });
    it('renders appName, runtime, and component refs into the LightningOutApp', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, {
          runtime: 'CLWR',
          components: ['c/foo', 'c:bar']
        })
      );
      const app = path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml');
      assertFileContent(app, 'CLWR');
      assertFileContent(app, 'c/foo');
      assertFileContent(app, 'c:bar');
      assertFileContent(app, '<applicationName>MyLoApp</applicationName>');
    });
    it('trims surrounding whitespace from a component ref before emitting it', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.LightningOut, baseOpts(outputDir, { components: ['  c/foo  '] }));
      const app = path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml');
      // emitted value must equal the validated (trimmed) value — no space-padded componentName
      assertFileContent(app, '<componentName>c/foo</componentName>');
    });
    it('LWR_CORE app file is unchanged (golden)', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, { hostDomains: ['https://app.example.com', 'https://portal.example.com:8080'] })
      );
      expect(fs.readFileSync(path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml'), 'utf8')).to
        .equal(`<?xml version="1.0" encoding="UTF-8"?>
<LightningOutApp xmlns="http://soap.sforce.com/2006/04/metadata">
    <applicationName>MyLoApp</applicationName>
    <isEnabled>true</isEnabled>
    <runtime>LWR_CORE</runtime>
    <components>
        <component>
            <componentName>c/myButton</componentName>
        </component>
    </components>
    <allowedDomains>
        <domain>
            <hostDomain>https://app.example.com</hostDomain>
        </domain>
        <domain>
            <hostDomain>https://portal.example.com:8080</hostDomain>
        </domain>
    </allowedDomains>
</LightningOutApp>
`);
    });
    it('CLWR with no access emits the same files as access=authenticated', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const read = async (o: Partial<LightningOutOptions>) => {
        await remove(outputDir);
        await templateService.create(TemplateType.LightningOut, baseOpts(outputDir, { runtime: 'CLWR', ...o }));
        const files = listFiles(outputDir);
        return files.map((f) => [f, fs.readFileSync(path.join(outputDir, f), 'utf8')]);
      };
      const implicit = await read({});
      const explicit = await read({ access: 'authenticated' });
      expect(explicit).to.deep.equal(implicit);
      expect(implicit.map(([f]) => f)).to.have.length(7); // 6 + 1 CORS file
    });
    it('emits <sites> as the last element for an authenticated CLWR site, trimmed', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, { runtime: 'CLWR', site: '  my_site ' })
      );
      const body = fs.readFileSync(
        path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml'),
        'utf8'
      );
      expect(body).to.include(
        '    </allowedDomains>\n    <sites>\n        <siteName>my_site</siteName>\n    </sites>\n</LightningOutApp>\n'
      );
      expect(body.match(/<sites>/g)).to.have.length(1);
      // authenticated keeps the full set
      assertFileExists(path.join(outputDir, 'externalClientApps', 'MyLoApp_ECA.eca-meta.xml'));
    });
    it('XML-escapes the site name', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, { runtime: 'CLWR', site: 'A & <B>' })
      );
      assertFileContent(
        path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml'),
        '<siteName>A &amp; &lt;B&gt;</siteName>'
      );
    });
    it('guest emits only the app file, with <sites> and no allowedDomains when no host domains', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.LightningOut, {
        appName: 'MyLoApp',
        runtime: 'CLWR',
        access: 'guest',
        site: 'my_site',
        components: ['c/myButton'],
        outputdir: outputDir,
        apiversion: getDefaultApiVersion()
      });
      expect(listFiles(outputDir)).to.deep.equal([path.join('lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml')]);
      expect(fs.readFileSync(path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml'), 'utf8')).to
        .equal(`<?xml version="1.0" encoding="UTF-8"?>
<LightningOutApp xmlns="http://soap.sforce.com/2006/04/metadata">
    <applicationName>MyLoApp</applicationName>
    <isEnabled>true</isEnabled>
    <runtime>CLWR</runtime>
    <components>
        <component>
            <componentName>c/myButton</componentName>
        </component>
    </components>
    <sites>
        <siteName>my_site</siteName>
    </sites>
</LightningOutApp>
`);
    });
    it('guest with host domains keeps allowedDomains but emits no CORS/ECA/settings files', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, { runtime: 'CLWR', access: 'guest', site: 'my_site' })
      );
      expect(listFiles(outputDir)).to.deep.equal([path.join('lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml')]);
      assertFileContent(
        path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml'),
        '<hostDomain>https://app.example.com</hostDomain>'
      );
    });
    it('hardcodes distributionState=Local and OAuth scope Web', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.LightningOut, baseOpts(outputDir));
      assertFileContent(
        path.join(outputDir, 'externalClientApps', 'MyLoApp_ECA.eca-meta.xml'),
        '<distributionState>Local</distributionState>'
      );
      assertFileContent(
        path.join(outputDir, 'extlClntAppOauthSettings', 'MyLoApp_ECA.ecaOauth-meta.xml'),
        /<commaSeparatedOauthScopes>Web<\/commaSeparatedOauthScopes>/
      );
    });
    it('hardcodes the embedding invariants isEnabled/enableOauthCorsPolicy/isFirstPartyCookieUseRequired', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.LightningOut, baseOpts(outputDir));
      assertFileContent(
        path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml'),
        '<isEnabled>true</isEnabled>'
      );
      assertFileContent(
        path.join(outputDir, 'settings', 'Security.settings-meta.xml'),
        '<enableOauthCorsPolicy>true</enableOauthCorsPolicy>'
      );
      assertFileContent(
        path.join(outputDir, 'settings', 'MyDomain.settings-meta.xml'),
        '<isFirstPartyCookieUseRequired>false</isFirstPartyCookieUseRequired>'
      );
    });
    it('keeps the consumer secret optional on the ECA global OAuth settings', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(TemplateType.LightningOut, baseOpts(outputDir));
      assertFileContent(
        path.join(outputDir, 'extlClntAppGlobalOauthSets', 'MyLoApp_ECA.ecaGlblOauth-meta.xml'),
        '<isConsumerSecretOptional>true</isConsumerSecretOptional>'
      );
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
