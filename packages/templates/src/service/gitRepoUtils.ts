/* eslint header/header: off */
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
import { nls } from '../i18n';

interface RepoInfo {
  username: string;
  name: string;
  branch: string;
  filePath: string;
}
/**
 * extract repo info from uri
 * @param repoUri uri to git repo
 */
export async function getRepoInfo(repoUri: URL): Promise<RepoInfo> {
  const [, username, name, t, branch, ...file] = repoUri.pathname.split('/');
  const filePath = `${file.join('/')}`;

  // For repos with no branch information, fetch default branch
  if (t === undefined) {
    const infoResponse = await got(
      `https://api.github.com/repos/${username}/${name}`
    ).catch(e => e);
    if (infoResponse.statusCode !== 200) {
      throw new Error(
        nls.localize('customTemplatesCannotRetrieveDefaultBranch', repoUri.href)
      );
    }
    const info = JSON.parse(infoResponse.body);
    return { username, name, branch: info['default_branch'], filePath };
  }

  if (username && name && branch && t === 'tree') {
    return { username, name, branch, filePath };
  } else {
    throw new Error(
      nls.localize('customTemplatesInvalidRepoUrl', repoUri.href)
    );
  }
}

/**
 * Returns a path to store custom templates from a Git repo
 * @param repoUri repository uri
 * @returns path to store custom templates
 */
export function getStoragePathForCustomTemplates(repoUri: URL) {
  const folderHash = crypto
    .createHash('md5')
    .update(repoUri.href)
    .digest('hex');

  const customTemplatesPath = path.join(
    Global.DIR,
    'custom-templates',
    folderHash
  );
  return customTemplatesPath;
}

/**
 * Load custom templates Git repo. Currently only supports GitHub.
 * @param repoUri repo uri
 * @param forceLoadingRemoteRepo by default do not reload remote repo if the repo is already downloaded
 * @returns path to the local storage location of the repo
 */
export async function loadCustomTemplatesGitRepo(
  repoUri: URL,
  forceLoadingRemoteRepo = false
) {
  const customTemplatesPath = getStoragePathForCustomTemplates(repoUri);
  // Do not load the remote repo if already the repo is already downloaded.
  if (fs.existsSync(customTemplatesPath) && !forceLoadingRemoteRepo) {
    return customTemplatesPath;
  }

  if (repoUri.protocol !== 'https:') {
    throw new Error(
      nls.localize(
        'customTemplatesShouldUseHttpsProtocol',
        `"${repoUri.protocol}"`
      )
    );
  }
  if (repoUri.hostname !== 'github.com') {
    throw new Error(
      nls.localize('customTemplatesSupportsGitHubOnly', repoUri.href)
    );
  }

  const { username, name, branch, filePath } = await getRepoInfo(repoUri);

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

  return customTemplatesPath;
}
