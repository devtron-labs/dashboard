/*
 * Copyright (c) 2024. Devtron Inc.
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

import { DOCUMENTATION } from '@Config/constants'
import { GitProvider } from '@Components/common/GitTabs/constants'
import { DefaultShortGitOpsType, GitOpsFormErrorType } from './gitops.type'

export const GitHost = {
    GITHUB: 'https://github.com/',
    GITLAB: 'https://gitlab.com/',
    AZURE_DEVOPS: 'https://dev.azure.com/',
    BITBUCKET_CLOUD: 'https://bitbucket.org/',
}

export const ShortGitHosts = ['github.com', 'gitlab.com', 'dev.azure.com', 'bitbucket.org']

export const GitLink = {
    GITHUB: 'https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/creating-a-new-organization-from-scratch',
    GITLAB: 'https://docs.gitlab.com/ee/user/group/#create-a-group',
    AZURE_DEVOPS:
        'https://docs.microsoft.com/en-us/azure/devops/organizations/projects/create-project?view=azure-devops&tabs=preview-page#create-a-project',
    BITBUCKET_WORKSPACE: 'https://support.atlassian.com/bitbucket-cloud/docs/create-your-workspace/',
    BITBUCKET_PROJECT: 'https://support.atlassian.com/bitbucket-cloud/docs/group-repositories-into-projects/',
}

export const DefaultGitOpsConfig = {
    id: null,
    provider: GitProvider.GITHUB,
    active: true,
    enableTLSVerification: false,
    isCADataPresent: false,
    isTLSCertDataPresent: false,
    isTLSKeyDataPresent: false,
    isCADataClearedAfterInitialConfig: false,
    isTLSCertDataClearedAfterInitialConfig: false,
    isTLSKeyDataClearedAfterInitialConfig: false,
}

export const DefaultShortGitOps: DefaultShortGitOpsType = {
    host: '',
    username: '',
    token: '',
    gitHubOrgId: '',
    gitLabGroupId: '',
    azureProjectName: '',
    bitBucketWorkspaceId: '',
    bitBucketProjectKey: '',
    caData: '',
    tlsCertData: '',
    tlsKeyData: '',
    sshHost: '',
    sshKey: '',
    authMode: null,
}

export const DefaultErrorFields: GitOpsFormErrorType = {
    host: '',
    username: '',
    token: '',
    gitHubOrgId: '',
    gitLabGroupId: '',
    azureProjectName: '',
    bitBucketWorkspaceId: '',
    bitBucketProjectKey: '',
    sshHost: '',
    sshKey: '',
    caData: '',
    tlsCertData: '',
    tlsKeyData: '',
}

export const LinkAndLabelSpec = {
    [GitProvider.GITHUB]: {
        link: GitLink.GITHUB,
        linkText: '(How to create organization in GitHub?)',
        label: 'GitHub Organisation Name',
    },
    [GitProvider.GITLAB]: {
        link: GitLink.GITLAB,
        linkText: '(How to create group in GitLab?)',
        label: 'GitLab Group ID',
    },
    [GitProvider.AZURE_DEVOPS]: {
        link: GitLink.AZURE_DEVOPS,
        linkText: '(How to create project in Azure?)',
        label: 'Azure DevOps Project Name',
    },
    [GitProvider.BITBUCKET_CLOUD]: {
        link: GitLink.BITBUCKET_PROJECT,
        linkText: '(How to create project in bitbucket?)',
        label: 'Bitbucket Project Key',
    },
}
export const gitOpsRepoNotConfiguredWithOptionsHidden =
    'Deployment via GitOps requires a repository to save deployment manifests. Please configure and try again.'
export const gitOpsRepoNotConfiguredWithEnforcedEnv = (env: string): string =>
    `Deployment to ‘${env}’ requires a GitOps repository. Please configure and try again.`
export const gitOpsRepoNotConfigured =
    'GitOps repository is required to deploy using GitOps. You can deploy using helm or configure GitOps repository and try again.'

export const PROVIDER_DOC_LINK_MAP: Record<
    Exclude<GitProvider, GitProvider.OTHER_GIT_OPS | GitProvider.AWS_CODE_COMMIT>,
    string
> = {
    [GitProvider.GITHUB]: DOCUMENTATION.GLOBAL_CONFIG_GITOPS_GITHUB,
    [GitProvider.GITLAB]: DOCUMENTATION.GLOBAL_CONFIG_GITOPS_GITLAB,
    [GitProvider.AZURE_DEVOPS]: DOCUMENTATION.GLOBAL_CONFIG_GITOPS_AZURE,
    [GitProvider.BITBUCKET_CLOUD]: DOCUMENTATION.GLOBAL_CONFIG_GITOPS_BITBUCKET,
}
