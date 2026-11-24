/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { readFile, rm } from 'node:fs/promises';
import * as path from 'node:path';
import { TemplateService, TemplateType } from '../../src';
import { BUILT_IN_FULL_TEMPLATES } from '../../src/utils/uiBundleTemplateUtils';

async function assertBundleDependencies(bundleDir: string, isAngular: boolean) {
  const manifest = JSON.parse(await readFile(path.join(bundleDir, 'package.json'), 'utf8')) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  const lock = JSON.parse(await readFile(path.join(bundleDir, 'package-lock.json'), 'utf8')) as {
    packages: Record<
      string,
      { version: string; dependencies: Record<string, string>; devDependencies?: Record<string, string> }
    >;
  };
  const bundlePackage = isAngular ? '@salesforce/angular-plugin-ui-bundle' : '@salesforce/ui-bundle';
  const expectedDependencies = {
    [bundlePackage]: '^13.2.1',
    '@salesforce/platform-sdk': '^13.2.1'
  };

  expect(manifest.dependencies).to.include(expectedDependencies);
  expect(lock.packages[''].dependencies).to.deep.equal(manifest.dependencies);
  expect(lock.packages[''].devDependencies).to.deep.equal(manifest.devDependencies);
  for (const dependency of [bundlePackage, '@salesforce/ui-bundle', '@salesforce/platform-sdk']) {
    const versions = Object.entries(lock.packages)
      .filter(([packagePath]) => packagePath.endsWith(`node_modules/${dependency}`))
      .map(([, pkg]) => pkg.version);
    expect([...new Set(versions)], dependency).to.deep.equal(['13.2.1']);
  }
  expect(lock.packages['node_modules/@salesforce/ui-bundle'].dependencies).to.include({
    '@salesforce/platform-sdk': '^13.2.1'
  });
  if (isAngular) {
    expect(lock.packages[`node_modules/${bundlePackage}`].dependencies).to.include({
      '@salesforce/ui-bundle': '^13.2.1'
    });
  }
}

describe('Generated UI bundle dependencies', () => {
  const outputdir = path.join('testsoutput', 'uiBundleDependencies');
  const appname = 'DependencyCheck';

  before(async () => {
    await rm(outputdir, { recursive: true, force: true });
  });

  for (const template of ['reactbasic', 'angularbasic', 'vuebasic']) {
    it(`generates ${template} with UI bundle 13.2.1 and a matching lockfile`, async () => {
      const bundleOutputdir = path.join(outputdir, template);
      await new TemplateService(process.cwd()).create(TemplateType.UIBundle, {
        template,
        bundlename: appname,
        outputdir: bundleOutputdir,
        internal: true
      });

      await assertBundleDependencies(path.join(bundleOutputdir, appname), template.startsWith('angular'));
    });
  }

  for (const template of BUILT_IN_FULL_TEMPLATES) {
    it(`generates ${template} with UI bundle 13.2.1 and a matching lockfile`, async () => {
      const projectOutputdir = path.join(outputdir, template);
      await new TemplateService(process.cwd()).create(TemplateType.Project, {
        template,
        projectname: appname,
        defaultpackagedir: 'force-app',
        outputdir: projectOutputdir
      });

      await assertBundleDependencies(
        path.join(projectOutputdir, appname, 'force-app', 'main', 'default', 'uiBundles', appname),
        template.startsWith('angular')
      );
    });
  }
});
