/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Single source for placeholder rename (copy-templates) and replacement (webappTemplateUtils).
 * Do not add .json - this .ts is compiled to lib/ so no copy step is needed.
 */
export default [
  {
    key: 'PACKAGE_DIR_PLACEHOLDER',
    placeholder: '_p_',
    dirInNpm: 'force-app',
    parent: 'dest',
    replacement: 'defaultpackagedir',
  },
  {
    key: 'MAIN_DEFAULT_PLACEHOLDER',
    placeholder: '_m_',
    dirInNpm: 'main/default',
    parent: '_p_',
    removeEmptySibling: 'main',
    replacement: 'main/default',
  },
  {
    key: 'WEBAPPLICATIONS_PLACEHOLDER',
    placeholder: '_w_',
    dirInNpm: 'webapplications',
    parent: '_m_',
    replacement: 'webapplications',
  },
  {
    key: 'DIGITAL_EXPERIENCES_PLACEHOLDER',
    placeholder: '_d_',
    dirInNpm: 'digitalExperiences',
    parent: '_m_',
    replacement: 'digitalExperiences',
  },
  {
    key: 'SITE_PLACEHOLDER',
    placeholder: '_s_',
    dirInNpm: 'site',
    parent: '_d_',
    replacement: 'site',
  },
  {
    key: 'A4DRULES_PLACEHOLDER',
    placeholder: '_r_',
    dirInNpm: '.a4drules',
    parent: 'dest',
    replacement: '.a4drules',
  },
  {
    key: 'A4D_SKILL_AGENTFORCE_PLACEHOLDER',
    placeholder: '_k_',
    dirInNpm:
      'skills/feature-react-agentforce-conversation-client-embedded-agent',
    parent: '_r_',
    toPath: 'skills/_k_',
    replacement: 'feature-react-agentforce-conversation-client-embedded-agent',
  },
];
