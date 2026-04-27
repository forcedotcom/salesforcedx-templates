/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Conventions:
 * _message: is for unformatted text that will be shown as-is to
 * the user.
 * _text: is for text that will appear in the UI, possibly with
 * decorations, e.g., $(x) uses the https://octicons.github.com/ and should not
 * be localized
 *
 * If omitted, we will assume _message.
 */
export const messages = {
  AlphaNumericNameError: 'Name must contain only alphanumeric characters.',
  NameMustStartWithLetterError: 'Name must start with a letter.',
  EndWithUnderscoreError: "Name can't end with an underscore.",
  DoubleUnderscoreError: "Name can't contain 2 consecutive underscores.",
  InvalidMimeType: 'The value of this argument must be a valid MIME type.',

  MissingWaveTemplatesDir:
    "Analytics templates must have a parent folder named 'waveTemplates'.",
  MissingAuraDir: "Lightning bundles must have a parent folder named 'aura'.",
  MissingLWCDir: "Lightning bundles must have a parent folder named 'lwc'.",
  MissingUIBundlesDir:
    "UI bundles must have a parent folder named 'uiBundles'.",
  MissingFlexipagesDir:
    "FlexiPages must have a parent folder named 'flexipages'.",
  MissingLightningComponentTemplate:
    'Template %s not available for component type %s.',

  localCustomTemplateDoNotExist:
    'Local custom templates folder %s does not exist',
  customTemplatesShouldUseHttpsProtocol:
    'Only HTTPS protocol is supported for custom templates. Got %s.',
  customTemplatesSupportsGitHubOnly:
    'Unsupported custom templates repo %s. Only GitHub is supported.',
  customTemplatesInvalidRepoUrl: 'Invalid custom templates repository URL: %s',
  customTemplatesCannotRetrieveDefaultBranch:
    'Cannot retrieve default branch for custom templates repository: %s',
  LightningAppBundle: 'A Lightning Application Bundle',
  LightningComponentBundle: 'A Lightning Component Bundle',
  LightningEventBundle: 'A Lightning Event Bundle',
  LightningInterfaceBundle: 'A Lightning Interface Bundle',
  LightningTest: 'A Lightning Test',
  RawOutput: 'target dir = %s\n%s',
  templateTypeNotFound: 'The template type does not exist',
  InvalidFlexipageTemplate:
    'Invalid FlexiPage template "%s". Valid templates are: %s',
  RecordPageRequiresEntityName:
    'RecordPage template requires an entityName option (e.g., "Account", "Opportunity", "Custom_Object__c").',
  TooManySecondaryFields:
    'Too many secondary fields specified (%d). The Dynamic Highlights Panel supports a maximum of %d secondary fields.',
  MissingFlexipageTemplate:
    'FlexiPage template "%s" not found in repository: %s. Please verify the template name is correct.',
  FailedToLoadFlexipageTemplatesRepo:
    'Failed to load the FlexiPage templates repository. Please verify the URL is correct and accessible.',

  AlphaNumericValidationError: '%s must contain only alphanumeric characters.',
} as const;
