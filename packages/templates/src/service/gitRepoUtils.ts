/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2021 Vercel, Inc. All rights reserved.
 *  Licensed under the MIT License. See OSSREADME.json in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * The following implementation are adapted from create-next-app
 * See https://github.com/vercel/next.js for more information
 */

import { Global } from '@salesforce/core';
import * as crypto from 'crypto';
import * as fs from 'fs';
import got from 'got';
import * as path from 'path';
import { Stream } from 'stream';
import * as tar from 'tar';
import { promisify } from 'util';

const loadedCustomTemplatesGitRepos = new Map<string, boolean>();

/**
 * Load custom templates Git repo. Currently only supports GitHub.
 * @param repoUri repo uri
 * @returns path to the local storage location of the repo
 */
export async function loadCustomTemplatesGitRepo(
  repoUri: URL,
  forceLoadingRemoteRepo: boolean = false
) {
  // For current session, do not load the remote repo if already loaded.
  if (
    loadedCustomTemplatesGitRepos.get(repoUri.href) &&
    !forceLoadingRemoteRepo
  ) {
    return;
  }

  if (repoUri.protocol !== 'https:') {
    throw new Error(
      `Only https protocol is supported for custom templates. Got ${repoUri.protocol}.`
    );
  }
  if (repoUri.hostname !== 'github.com') {
    throw new Error(
      `Unsupported custom templates repo ${repoUri.href}. Only GitHub is supported.`
    );
  }

  // TODO:
  // - handle invalid GitHub URL: username, name, branch, "tree", filePath must be valid
  // - handle repos with no branch information
  const [, username, name, , branch, ...file] = repoUri.pathname.split('/');
  const filePath = `${file.join('/')}`;

  const folderHash = crypto
    .createHash('md5')
    .update(repoUri.href)
    .digest('hex');

  const customTemplatesPath = path.join(
    Global.DIR,
    'custom-templates',
    folderHash
  );

  if (!fs.existsSync(customTemplatesPath)) {
    fs.mkdirSync(customTemplatesPath, { recursive: true });
  }

  // Download the repo and extract to the SFDX global state folder
  const pipeline = promisify(Stream.pipeline);
  await pipeline(
    got.stream(
      `https://codeload.github.com/${username}/${name}/tar.gz/${branch}`
    ),
    tar.extract(
      {
        cwd: customTemplatesPath,
        strip: filePath ? filePath.split('/').length + 1 : 1
      },
      [`${name}-${branch}${filePath ? `/${filePath}` : ''}`]
    )
  );

  loadedCustomTemplatesGitRepos.set(repoUri.href, true);
  return customTemplatesPath;
}
