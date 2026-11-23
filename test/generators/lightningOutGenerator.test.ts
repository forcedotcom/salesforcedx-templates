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
import { nls } from '../../src/i18n';
import {
  type LightningOutGeneratorOptions,
  type LightningOutGuestOptions,
  type LightningOutOptions
} from '../../src/utils/types';

chai.config.truncateThreshold = 100000;
const { expect } = chai;

async function remove(file: string) {
  await fs.promises.rm(file, { force: true, recursive: true });
}

function assertFileExists(file: string) {
  expect(fs.existsSync(file), `Expected file to exist: ${file}`).to.be.true;
}

function readFileContent(file: string): string {
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function listFiles(dir: string): string[] {
  return (fs.readdirSync(dir, { recursive: true }) as string[])
    .filter((f) => fs.statSync(path.join(dir, f)).isFile())
    .sort();
}

function assertFileContent(file: string, needle: string | RegExp) {
  assertFileExists(file);
  const body = readFileContent(file);
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
    it('throws when callbackUrl is not a parsable URL', () => {
      expect(
        () =>
          new LightningOutGenerator(
            baseOpts(outputDir, {
              eca: { name: 'MyLoApp_ECA', contactEmail: 'dev@example.com', callbackUrl: 'not a url' }
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
      const guestOpts = (overrides: Partial<LightningOutGuestOptions> = {}): LightningOutGuestOptions => ({
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
      const errorOf = (opts: LightningOutGeneratorOptions): string => {
        try {
          new LightningOutGenerator(opts);
        } catch (e) {
          return (e as Error).message;
        }
        return '';
      };
      it('reports both site and access on LWR_CORE in one error', () => {
        const msg = errorOf(baseOpts(outputDir, { site: 's', access: 'guest' }));
        expect(msg).to.include(nls.localize('InvalidLightningOutClwrOnly', ['site', 'LWR_CORE']));
        expect(msg).to.include(nls.localize('InvalidLightningOutClwrOnly', ['access', 'LWR_CORE']));
      });
      it('does not add CLWR-only errors on top of an invalid runtime', () => {
        const msg = errorOf(baseOpts(outputDir, { runtime: 'NOPE' as LightningOutOptions['runtime'], site: 's' }));
        expect(msg).to.include(nls.localize('InvalidLightningOutRuntime', ['LWR_CORE, CLWR']));
        expect(msg).to.not.include('applies only to runtime CLWR');
      });
      it('missing runtime with access=guest reports only the missing runtime', () => {
        const msg = errorOf(guestOpts({ runtime: undefined as unknown as LightningOutOptions['runtime'] }));
        expect(msg).to.include(nls.localize('MissingLightningOutInputs', ['runtime']));
        expect(msg).to.not.match(/eca\.name|hostDomains/);
      });
      it('rejects " guest" (no trimming of the access enum)', () => {
        expect(
          errorOf(baseOpts(outputDir, { runtime: 'CLWR', access: ' guest' as LightningOutOptions['access'] }))
        ).to.include(nls.localize('InvalidLightningOutAccess', ['guest, authenticated']));
      });
      for (const bad of ['my\nsite', 'my\tsite', 'my\u007fsite', 'my\u0085site', 'my\uffffsite']) {
        it(`rejects a site name with a control/non-XML character (${JSON.stringify(bad)})`, () => {
          expect(errorOf(guestOpts({ site: bad }))).to.include(nls.localize('InvalidLightningOutSiteName'));
        });
      }
      it('invalid runtime with access=guest reports only the runtime error', () => {
        const msg = errorOf(guestOpts({ runtime: 'clwr' as LightningOutOptions['runtime'] }));
        expect(msg).to.include(nls.localize('InvalidLightningOutRuntime', ['LWR_CORE, CLWR']));
        expect(msg).to.not.match(/eca\.name|hostDomains|Missing required/);
      });
      it('missing runtime with access=authenticated still reports the eca/hostDomains inputs', () => {
        const msg = errorOf({
          appName: 'A',
          access: 'authenticated',
          outputdir: outputDir
        } as unknown as LightningOutOptions);
        expect(msg).to.match(/runtime/);
        expect(msg).to.match(/eca\.name/);
        expect(msg).to.match(/hostDomains/);
      });
      it('hostDomains: null is absent — fine for guest, missing for authenticated', () => {
        const nul = null as unknown as string[];
        expect(errorOf(guestOpts({ hostDomains: nul }))).to.equal('');
        expect(errorOf(baseOpts(outputDir, { runtime: 'CLWR', hostDomains: nul }))).to.include(
          nls.localize('MissingLightningOutInputs', ['hostDomains'])
        );
      });
      it('rejects non-string hostDomains elements without a raw TypeError', () => {
        const msg = errorOf(guestOpts({ hostDomains: [123] as unknown as string[] }));
        expect(msg).to.include(nls.localize('InvalidLightningOutHostDomainsType'));
        expect(msg).to.not.match(/is not a function/);
      });
      it('rejects a non-array components value', () => {
        const msg = errorOf(guestOpts({ components: 'c/foo' as unknown as string[] }));
        expect(msg).to.include(nls.localize('InvalidLightningOutComponentsType'));
        expect(msg).to.not.include('c"');
      });
      it('treats null site/access as absent', () => {
        expect(
          errorOf(
            baseOpts(outputDir, {
              site: null as unknown as string,
              access: null as unknown as LightningOutOptions['access']
            })
          )
        ).to.equal('');
      });
      it('rejects a non-array hostDomains in guest mode too', () => {
        const msg = errorOf(guestOpts({ hostDomains: 'https://a.example.com' as unknown as string[] }));
        expect(msg).to.include(nls.localize('InvalidLightningOutHostDomainsType'));
      });
      it('reports a non-array hostDomains as a type error, not as missing', () => {
        const msg = errorOf(baseOpts(outputDir, { hostDomains: 'https://a.example.com' as unknown as string[] }));
        expect(msg).to.include(nls.localize('InvalidLightningOutHostDomainsType'));
        expect(msg).to.not.include('Missing required input');
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
      describe('additional site/access validation', () => {
        const clwr = (o: Partial<LightningOutOptions> = {}) => baseOpts(outputDir, { runtime: 'CLWR', ...o });
        for (const bad of ['\r', '\u0000', '\u001f', '\u009f', '\ufffe']) {
          it(`rejects a site containing control-char boundary ${JSON.stringify(bad)}`, () => {
            expect(errorOf(clwr({ site: `a${bad}b` }))).to.include(nls.localize('InvalidLightningOutSiteName'));
          });
        }
        it('rejects a lone surrogate in a site but accepts a valid surrogate pair', () => {
          for (const bad of ['a\ud800b', '\udfff', 'a\ud800']) {
            expect(errorOf(clwr({ site: bad }))).to.include(nls.localize('InvalidLightningOutSiteName'));
          }
          expect(errorOf(clwr({ site: 'Site 😀' }))).to.equal('');
        });
        it('accepts a non-breaking space and a normal internal space in a site name', () => {
          expect(errorOf(clwr({ site: 'My\u00a0Site' }))).to.equal('');
          expect(errorOf(clwr({ site: 'My Site' }))).to.equal('');
        });
        const eca = (e: Partial<NonNullable<LightningOutOptions['eca']>>) =>
          baseOpts(outputDir, {
            eca: {
              name: 'MyLoApp_ECA',
              contactEmail: 'dev@example.com',
              callbackUrl: 'https://app.example.com/cb',
              ...e
            }
          });
        for (const bad of [
          ' https://app.example.com/cb',
          'https://app.example.com/cb\n',
          'https://app.example.com/c\tb',
          'https://app.example.com/cb\u0000'
        ]) {
          it(`rejects a callbackUrl with whitespace/control chars ${JSON.stringify(bad)}`, () => {
            expect(errorOf(eca({ callbackUrl: bad }))).to.include(
              nls.localize('InvalidLightningOutCallbackUrl', [bad])
            );
          });
        }
        it('rejects a contactEmail with a control character', () => {
          expect(errorOf(eca({ contactEmail: 'dev@exam\u0001ple.com' }))).to.include(
            nls.localize('InvalidLightningOutContactEmail', ['dev@exam\u0001ple.com'])
          );
        });
        for (const bad of [123, {}, true]) {
          it(`rejects a non-string site ${JSON.stringify(bad)}`, () => {
            expect(errorOf(clwr({ site: bad as unknown as string }))).to.include(
              nls.localize('InvalidLightningOutSiteName')
            );
          });
        }
        it('site: "" on LWR_CORE reports the CLWR-only error, not the blank-site error', () => {
          const msg = errorOf(baseOpts(outputDir, { site: '' }));
          expect(msg).to.include(nls.localize('InvalidLightningOutClwrOnly', ['site', 'LWR_CORE']));
          expect(msg).to.not.include(nls.localize('InvalidLightningOutSiteName'));
        });
        it('site with a missing runtime reports the missing runtime (and validates the site as CLWR would)', () => {
          const ok = errorOf(baseOpts(outputDir, { runtime: undefined as unknown as 'CLWR', site: 'my_site' }));
          expect(ok).to.include(nls.localize('MissingLightningOutInputs', ['runtime']));
          expect(ok).to.not.include('applies only to runtime CLWR');
          expect(ok).to.not.include(nls.localize('InvalidLightningOutSiteName'));
          const bad = errorOf(baseOpts(outputDir, { runtime: undefined as unknown as 'CLWR', site: '  ' }));
          expect(bad).to.include(nls.localize('MissingLightningOutInputs', ['runtime']));
          expect(bad).to.include(nls.localize('InvalidLightningOutSiteName'));
        });
        for (const bad of ['', 'Guest', 'GUEST', 123]) {
          it(`rejects access ${JSON.stringify(bad)} on CLWR`, () => {
            expect(errorOf(clwr({ access: bad as unknown as LightningOutOptions['access'] }))).to.include(
              nls.localize('InvalidLightningOutAccess', ['guest, authenticated'])
            );
          });
        }
        it('an invalid access value reports only the access error, not missing ECA inputs', () => {
          const msg = errorOf(
            baseOpts(outputDir, {
              runtime: 'CLWR',
              access: 'Guest' as LightningOutOptions['access'],
              site: 'my_site',
              hostDomains: undefined,
              eca: undefined
            })
          );
          expect(msg).to.include(nls.localize('InvalidLightningOutAccess', ['guest, authenticated']));
          expect(msg).to.not.include('eca.name');
          expect(msg).to.not.include('hostDomains');
        });
        it('reports appName, blank site, access and hostDomain errors together in one error', () => {
          const msg = errorOf(
            clwr({
              appName: '9bad',
              site: '  ',
              access: 'public' as LightningOutOptions['access'],
              hostDomains: ['ftp://x.example.com']
            })
          );
          expect(msg).to.match(/appName/);
          expect(msg).to.include(nls.localize('InvalidLightningOutSiteName'));
          expect(msg).to.include(nls.localize('InvalidLightningOutAccess', ['guest, authenticated']));
          expect(msg).to.match(/http or https/i);
        });
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
      expect(readFileContent(path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml'))).to
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
        return files.map((f) => [f, readFileContent(path.join(outputDir, f))]);
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
      const body = readFileContent(path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml'));
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
      expect(readFileContent(path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml'))).to
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
    it('CLWR authenticated with a site (golden): app literal, other files identical to LWR_CORE', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      const snapshot = async (o: Partial<LightningOutOptions>) => {
        await remove(outputDir);
        await templateService.create(TemplateType.LightningOut, baseOpts(outputDir, o));
        return Object.fromEntries(listFiles(outputDir).map((f) => [f, readFileContent(path.join(outputDir, f))]));
      };
      const lwr = await snapshot({});
      const clwr = await snapshot({ runtime: 'CLWR', access: 'authenticated', site: 'my_site' });
      const appFile = path.join('lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml');
      expect(Object.keys(clwr)).to.deep.equal(Object.keys(lwr));
      for (const f of Object.keys(lwr).filter((k) => k !== appFile)) {
        expect(clwr[f], f).to.equal(lwr[f]);
      }
      expect(clwr[appFile]).to.equal(`<?xml version="1.0" encoding="UTF-8"?>
<LightningOutApp xmlns="http://soap.sforce.com/2006/04/metadata">
    <applicationName>MyLoApp</applicationName>
    <isEnabled>true</isEnabled>
    <runtime>CLWR</runtime>
    <components>
        <component>
            <componentName>c/myButton</componentName>
        </component>
    </components>
    <allowedDomains>
        <domain>
            <hostDomain>https://app.example.com</hostDomain>
        </domain>
    </allowedDomains>
    <sites>
        <siteName>my_site</siteName>
    </sites>
</LightningOutApp>
`);
    });
    it('access: null on CLWR emits the full authenticated set', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, { runtime: 'CLWR', access: null as unknown as LightningOutOptions['access'] })
      );
      expect(listFiles(outputDir)).to.have.length(7);
    });
    it('guest ignores a valid eca block and trims the site name', async () => {
      const templateService = TemplateService.getInstance(process.cwd());
      await templateService.create(
        TemplateType.LightningOut,
        baseOpts(outputDir, { runtime: 'CLWR', access: 'guest', site: '  my_site  ' })
      );
      expect(listFiles(outputDir)).to.deep.equal([path.join('lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml')]);
      assertFileContent(
        path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml'),
        '<siteName>my_site</siteName>'
      );
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
    describe('site/access generation (additional coverage)', () => {
      const appPath = () => path.join(outputDir, 'lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml');
      const readApp = () => readFileContent(appPath());
      const create = (o: LightningOutGeneratorOptions) =>
        TemplateService.getInstance(process.cwd()).create(TemplateType.LightningOut, o);
      const gOpts = (o: Partial<LightningOutGuestOptions> = {}): LightningOutGuestOptions =>
        baseOpts(outputDir, { runtime: 'CLWR', access: 'guest', hostDomains: undefined, ...o });
      const header = `<?xml version="1.0" encoding="UTF-8"?>
<LightningOutApp xmlns="http://soap.sforce.com/2006/04/metadata">
    <applicationName>MyLoApp</applicationName>
    <isEnabled>true</isEnabled>
`;

      it('CLWR authenticated without a site equals the LWR_CORE golden with only runtime changed', async () => {
        await create(baseOpts(outputDir, { runtime: 'CLWR' }));
        expect(readApp()).to.equal(`${header}    <runtime>CLWR</runtime>
    <components>
        <component>
            <componentName>c/myButton</componentName>
        </component>
    </components>
    <allowedDomains>
        <domain>
            <hostDomain>https://app.example.com</hostDomain>
        </domain>
    </allowedDomains>
</LightningOutApp>
`);
        expect(readApp()).to.not.include('<sites>');
      });
      it('guest without a site emits no <sites>', async () => {
        await create(gOpts());
        expect(readApp()).to.not.include('<sites>');
      });
      for (const [label, components] of [
        ['undefined', undefined],
        ['empty', [] as string[]]
      ] as const) {
        it(`guest with no hosts and ${label} components emits only a minimal app file`, async () => {
          await create(gOpts({ hostDomains: [], components }));
          expect(listFiles(outputDir)).to.deep.equal([
            path.join('lightningOutApps', 'MyLoApp.lightningOutApp-meta.xml')
          ]);
          expect(readApp()).to.equal(`${header}    <runtime>CLWR</runtime>
    <components>
    </components>
</LightningOutApp>
`);
          expect(readApp()).to.not.include('<allowedDomains>');
        });
      }
      for (const access of ['guest', 'authenticated'] as const) {
        it(`site: null through generate() emits no <sites> (${access})`, async () => {
          await create(baseOpts(outputDir, { runtime: 'CLWR', access, site: null as unknown as string }));
          expect(readApp()).to.not.include('<sites>');
        });
      }
      it('emits site names verbatim or escaped in <siteName>', async () => {
        const cases: [string, string][] = [
          ['My Site', 'My Site'],
          ['Café Site', 'Café Site'],
          [`A "q" 'x'`, 'A &#34;q&#34; &#39;x&#39;']
        ];
        for (const [site, expected] of cases) {
          await remove(outputDir);
          await create(gOpts({ site }));
          expect(readApp(), site).to.include(`<siteName>${expected}</siteName>`);
        }
      });
      it('re-run: CLWR+site then LWR_CORE rewrites the app file without <sites>', async () => {
        await create(baseOpts(outputDir, { runtime: 'CLWR', site: 'my_site' }));
        expect(readApp()).to.include('<siteName>my_site</siteName>');
        await create(baseOpts(outputDir));
        expect(readApp()).to.include('<runtime>LWR_CORE</runtime>');
        expect(readApp()).to.not.include('<sites>');
      });
      it('re-run: authenticated then guest leaves the old files on disk and writes the guest app file', async () => {
        await create(baseOpts(outputDir, { runtime: 'CLWR' }));
        const before = listFiles(outputDir);
        expect(before).to.have.length(7);
        await create(baseOpts(outputDir, { runtime: 'CLWR', access: 'guest', site: 'my_site' }));
        expect(listFiles(outputDir)).to.deep.equal(before);
        expect(readApp()).to.include('<siteName>my_site</siteName>');
      });
      it('re-run: guest then authenticated yields the full set', async () => {
        await create(gOpts({ site: 'my_site' }));
        expect(listFiles(outputDir)).to.have.length(1);
        await create(baseOpts(outputDir, { runtime: 'CLWR', site: 'my_site' }));
        expect(listFiles(outputDir)).to.have.length(7);
      });
      it('authenticated CLWR with a site and 2 hosts emits 2 CORS files and <sites> after the last domain', async () => {
        await create(
          baseOpts(outputDir, {
            runtime: 'CLWR',
            site: 'my_site',
            hostDomains: ['https://app.example.com', 'https://portal.example.com:8080']
          })
        );
        const files = listFiles(outputDir);
        expect(files.filter((f) => f.startsWith('corsWhitelistOrigins'))).to.have.length(2);
        expect(files).to.have.length(8);
        const body = readApp();
        expect(body.indexOf('<sites>')).to.be.greaterThan(body.lastIndexOf('</domain>'));
        expect(body.indexOf('<sites>')).to.be.greaterThan(body.indexOf('</allowedDomains>'));
      });
    });
  });
});
