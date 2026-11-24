/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as fs from 'fs';
import * as path from 'path';
import { type ProjectOptions, TemplateService, TemplateType } from '../../src';

chai.use(chaiAsPromised);
chai.config.truncateThreshold = 100000;
chai.should();
const { expect } = chai;

const OUTPUT_DIR = path.join('testsoutput', 'computeProject');
const APP_NAME = 'MyComputeApp';

// Files that belong to the reference-app repos, not to a customer's app
const DENIED_FILES = [
  'CODEOWNERS',
  'LICENSE.txt',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'app.json',
  path.join('test', 'routes', 'accounts.test.js'),
  path.join('app', 'routers', 'accounts.py'),
  path.join('app', 'routers', 'unitofwork.py'),
  path.join('app', 'routers', 'datacloud.py'),
  path.join('tests', 'routers', 'test_accounts.py')
];

const EXPECTED_FILES = {
  node: [
    '.forceignore',
    '.gitignore',
    '.prettierignore',
    '.prettierrc.json',
    'MyComputeApp.computeApp-meta.xml',
    'Procfile',
    'README.md',
    'api-spec.yaml',
    path.join('bin', 'invoke.sh'),
    'eslint.config.js',
    'package-lock.json',
    'package.json',
    'project.toml',
    path.join('src', 'app.js'),
    path.join('src', 'plugins', 'README.md'),
    path.join('src', 'plugins', 'heroku-applink.js'),
    path.join('src', 'routes', 'index.js'),
    path.join('test', 'helper.js'),
    path.join('test', 'routes', 'healthcheck.test.js')
  ],
  python: [
    '.forceignore',
    '.gitignore',
    '.python-version',
    'MyComputeApp.computeApp-meta.xml',
    'Procfile',
    'README.md',
    path.join('app', 'main.py'),
    'api-spec.yaml',
    path.join('bin', 'invoke.py'),
    'project.toml',
    'pytest.ini',
    'requirements.txt',
    path.join('tests', 'conftest.py'),
    path.join('tests', 'test_main.py')
  ]
};

async function remove(file: string) {
  await fs.promises.rm(file, { force: true, recursive: true });
}

function listFiles(root: string, relativeDir = ''): string[] {
  return fs
    .readdirSync(path.join(root, relativeDir), { withFileTypes: true })
    .flatMap((entry) => {
      const relativePath = path.join(relativeDir, entry.name);
      return entry.isDirectory() ? listFiles(root, relativePath) : [relativePath];
    })
    .sort();
}

function read(...segments: string[]): string {
  return fs.readFileSync(path.join(...segments), 'utf8');
}

async function createCompute(options: Partial<ProjectOptions>) {
  return TemplateService.getInstance().create(TemplateType.Project, {
    outputdir: OUTPUT_DIR,
    projectname: APP_NAME,
    template: 'compute',
    defaultpackagedir: 'force-app',
    ...options
  });
}

describe('compute project template', () => {
  const projectDir = path.join(OUTPUT_DIR, APP_NAME);
  const appDir = path.join(projectDir, 'force-app', 'main', 'default', 'computeApps', APP_NAME);

  beforeEach(async () => remove(OUTPUT_DIR));
  after(async () => remove(OUTPUT_DIR));

  (['node', 'python'] as const).forEach((computeLanguage) => {
    describe(`computeLanguage: ${computeLanguage}`, () => {
      it('creates a project with one compute app and the expected files', async () => {
        const result = await createCompute({ computeLanguage });

        expect(listFiles(appDir)).to.deep.equal([...EXPECTED_FILES[computeLanguage]].sort());
        // Every file in the result was actually written
        result.created.forEach((file) => expect(fs.existsSync(file), file).to.be.true);
        expect(result.created.map((file) => path.normalize(file))).to.include.members(
          ['sfdx-project.json', 'README.md', '.forceignore'].map((file) => path.join(projectDir, file))
        );
      });

      it('writes the compute app metadata file named after the app', async () => {
        await createCompute({ computeLanguage });

        const xml = read(appDir, `${APP_NAME}.computeApp-meta.xml`);
        expect(xml).to.contain('<ComputeApp xmlns="http://soap.sforce.com/2006/04/metadata">');
        expect(xml).to.contain(`<masterLabel>${APP_NAME}</masterLabel>`);
        expect(xml).to.contain('<description>');
      });

      it('substitutes the app name and leaves no template placeholders behind', async () => {
        await createCompute({ computeLanguage });

        expect(read(appDir, 'api-spec.yaml')).to.contain(`title: ${APP_NAME} API`);
        expect(read(appDir, 'README.md')).to.contain(`# ${APP_NAME}`);
        expect(read(appDir, 'README.md')).to.contain(`ComputeApp:${APP_NAME}`);
        expect(read(projectDir, 'README.md')).to.contain(`# ${APP_NAME}`);

        listFiles(projectDir).forEach((file) => {
          const body = read(projectDir, file);
          expect(body, file).to.not.contain('__APP_NAME');
          expect(body, file).to.not.contain('<%');
        });
      });

      it('does not include repository-governance files or example endpoints', async () => {
        await createCompute({ computeLanguage });

        DENIED_FILES.forEach((file) => expect(fs.existsSync(path.join(appDir, file)), file).to.be.false);
        expect(fs.existsSync(path.join(appDir, 'gitignore'))).to.be.false;
        listFiles(appDir)
          // the lockfile pins thousands of unrelated package names
          .filter((file) => file !== 'package-lock.json')
          .forEach((file) => {
            expect(read(appDir, file), file).to.not.match(/unitofwork|\/accounts|datacloud/i);
          });
      });

      it('declares the app buildpacks and a Procfile', async () => {
        await createCompute({ computeLanguage });

        const buildpacks = read(appDir, 'project.toml');
        expect(buildpacks).to.contain(computeLanguage === 'node' ? 'heroku/nodejs' : 'heroku/python');
        expect(buildpacks).to.contain('heroku/heroku-applink');
        expect(buildpacks).to.contain('heroku/procfile');
        expect(read(appDir, 'Procfile')).to.contain('heroku-applink-service-mesh');
      });

      it('keeps the bin/ helper scripts executable', async function () {
        if (process.platform === 'win32') this.skip();
        await createCompute({ computeLanguage });

        fs.readdirSync(path.join(appDir, 'bin')).forEach((file) => {
          expect(fs.statSync(path.join(appDir, 'bin', file)).mode & 0o111, file).to.not.equal(0);
        });
      });

      it('honors a custom default package directory', async () => {
        await createCompute({ computeLanguage, defaultpackagedir: 'compute-src' });

        expect(read(projectDir, 'README.md')).to.contain(`compute-src/main/default/computeApps/${APP_NAME}/`);

        expect(
          fs.existsSync(
            path.join(
              projectDir,
              'compute-src',
              'main',
              'default',
              'computeApps',
              APP_NAME,
              `${APP_NAME}.computeApp-meta.xml`
            )
          )
        ).to.be.true;
      });
    });
  });

  it('uses starter source for the chosen language only', async () => {
    await createCompute({ computeLanguage: 'node' });
    expect(fs.existsSync(path.join(appDir, 'package.json'))).to.be.true;
    expect(fs.existsSync(path.join(appDir, 'requirements.txt'))).to.be.false;

    await remove(OUTPUT_DIR);
    await createCompute({ computeLanguage: 'python' });
    expect(fs.existsSync(path.join(appDir, 'requirements.txt'))).to.be.true;
    expect(fs.existsSync(path.join(appDir, 'package.json'))).to.be.false;
  });

  describe('skill-expected extras', () => {
    it('ignores build output and dependencies when deploying the app', async () => {
      await createCompute({ computeLanguage: 'node' });
      const ignored = read(appDir, '.forceignore').split('\n');
      ['node_modules/', '.tap/', '.git/', '__pycache__/', 'target/', 'vendor/'].forEach((entry) =>
        expect(ignored).to.include(entry)
      );
    });

    it('pins Python 3.12', async () => {
      await createCompute({ computeLanguage: 'python' });
      expect(read(appDir, '.python-version').trim()).to.equal('3.12');
    });

    it('lets the node starter pass npm test without full coverage', async () => {
      await createCompute({ computeLanguage: 'node' });
      const pkg = JSON.parse(read(appDir, 'package.json')) as { tap: Record<string, unknown> };
      // tap defaults to requiring 100% coverage, which the starter does not have
      expect(pkg.tap).to.deep.equal({ 'allow-incomplete-coverage': true });
    });

    it('does not write External Client App metadata without a contact email', async () => {
      await createCompute({ computeLanguage: 'node' });
      expect(fs.existsSync(path.join(projectDir, 'force-app', 'main', 'default', 'externalClientApps'))).to.be.false;
    });

    (['node', 'python'] as const).forEach((computeLanguage) => {
      it(`writes the four External Client App files named after the app (${computeLanguage})`, async () => {
        await createCompute({ computeLanguage, computeContactEmail: 'dev@example.com' });
        const source = path.join(projectDir, 'force-app', 'main', 'default');

        const eca = read(source, 'externalClientApps', `${APP_NAME}.eca-meta.xml`);
        expect(eca).to.contain('<contactEmail>dev@example.com</contactEmail>');
        expect(eca).to.contain(`<label>${APP_NAME}</label>`);
        expect(read(source, 'extlClntAppGlobalOauthSets', `${APP_NAME}.ecaGlblOauth-meta.xml`)).to.contain(
          `<externalClientApplication>${APP_NAME}</externalClientApplication>`
        );
        expect(read(source, 'extlClntAppOauthSettings', `${APP_NAME}_oauth.ecaOauth-meta.xml`)).to.contain(
          'Basic, Api, RefreshToken'
        );
        expect(read(source, 'extlClntAppOauthPolicies', `${APP_NAME}_oauthPlcy.ecaOauthPlcy-meta.xml`)).to.contain(
          'ManageHerokuCompute'
        );
      });
    });

    it('writes the External Client App files under a custom default package directory', async () => {
      await createCompute({
        computeLanguage: 'node',
        computeContactEmail: 'dev@example.com',
        defaultpackagedir: 'compute-src'
      });
      expect(
        fs.existsSync(
          path.join(projectDir, 'compute-src', 'main', 'default', 'externalClientApps', `${APP_NAME}.eca-meta.xml`)
        )
      ).to.be.true;
    });

    ['not-an-email', 'a@b', 'a b@example.com', 'a@exa<mple.com', '<x>@example.com'].forEach((email) => {
      it(`rejects the contact email '${email}'`, async () => {
        await createCompute({ computeLanguage: 'node', computeContactEmail: email }).should.be.rejectedWith(
          Error,
          'Invalid computeContactEmail value'
        );
        expect(fs.existsSync(projectDir)).to.be.false;
      });
    });
  });

  describe('validation', () => {
    it('rejects a missing language', async () => {
      await createCompute({}).should.be.rejectedWith(Error, 'The compute template requires computeLanguage');
      expect(fs.existsSync(projectDir)).to.be.false;
    });

    it('rejects an unsupported language, naming the supported ones', async () => {
      // @ts-expect-error -- deliberately outside the supported language type
      await createCompute({ computeLanguage: 'ruby' }).should.be.rejectedWith(
        Error,
        "Invalid computeLanguage value: 'ruby'. Must be one of: node, python."
      );
      expect(fs.existsSync(projectDir)).to.be.false;
    });

    ['my-app', 'My__App', '1App', 'App_', '../evil', 'My App'].forEach((projectname) => {
      it(`rejects the project/app name '${projectname}'`, async () => {
        await createCompute({ computeLanguage: 'node', projectname }).should.be.rejectedWith(Error);
        expect(fs.existsSync(path.join(OUTPUT_DIR, projectname))).to.be.false;
        expect(fs.existsSync(projectDir)).to.be.false;
      });
    });

    it('ignores computeLanguage for other templates', async () => {
      await createCompute({ template: 'standard', computeLanguage: 'node' });

      expect(fs.existsSync(path.join(projectDir, 'force-app', 'main', 'default', 'computeApps'))).to.be.false;
    });
  });
});
