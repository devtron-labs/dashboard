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

import { RouteComponentProps } from 'react-router'
import { BaseGitOpsType, GitOpsAuthModeType } from '@devtron-labs/devtron-fe-common-lib'

export type GitOpsOrganisationIdType =
    | 'gitHubOrgId'
    | 'gitLabGroupId'
    | 'azureProjectName'
    | 'bitBucketWorkspaceId'
    | 'bitBucketProjectKey'

export enum GitProvider {
    GITLAB = 'GITLAB',
    GITHUB = 'GITHUB',
    AZURE_DEVOPS = 'AZURE_DEVOPS',
    BITBUCKET_CLOUD = 'BITBUCKET_CLOUD',
    AWS_CODE_COMMIT = 'AWS_CODE_COMMIT',
}

export type GitProviderType = GitProvider | 'BITBUCKET_DC'

export interface CustomGitOpsState {
    username: {
        value: string
        error: string
    }
    password: {
        value: string
        error: string
    }
}

export interface GitOpsConfig extends Pick<BaseGitOpsType, 'sshHost' | 'sshKey' | 'username'> {
    id: number
    provider: GitProviderType
    host: string
    token: string
    active: boolean
    gitLabGroupId: string
    gitHubOrgId: string
    azureProjectName: string
    bitBucketWorkspaceId: string
    bitBucketProjectKey: string
}

export interface DefaultShortGitOpsType extends Pick<BaseGitOpsType, 'sshHost' | 'sshKey'> {
    host: string
    username: string
    token: string
    gitHubOrgId: string
    gitLabGroupId: string
    azureProjectName: string
    bitBucketWorkspaceId: string
    bitBucketProjectKey: string
}

export interface GitOpsState {
    /**
     * To define loading, error, logical state of component
     */
    view: string
    /**
     * For error screen manager
     */
    statusCode: number
    /**
     * Currently selected tab
     */
    providerTab: GitProviderType
    /**
     * API response list of all providers with their config
     */
    gitList: GitOpsConfig[]
    /**
     * The details of the selected git provider
     */
    form: GitOpsConfig
    isFormEdited: boolean
    /**
     * To show triangular check on the selected git provider
     * Will be only changed after API call
     */
    lastActiveGitOp: undefined | GitOpsConfig
    saveLoading: boolean
    validateLoading: boolean
    isBitbucketCloud: boolean
    /**
     * Error states for input fields
     */
    isError: DefaultShortGitOpsType
    validatedTime: string
    validationError: GitOpsConfig[]
    // TODO: Should be VALIDATION_STATUS, but can't change as of now due to service default to '', connect with @vivek
    validationStatus: string
    deleteRepoError: boolean
    /**
     * To show validation response of url of selected git provider
     * Like using http instead of https
     */
    isUrlValidationError: boolean
    // FIXME: Should be repoType from ../../config
    selectedRepoType: string
    validationSkipped: boolean
    allowCustomGitRepo: boolean
}

export interface GitOpsProps extends RouteComponentProps<{}> {
    handleChecklistUpdate: (string) => void
}

export interface UserGitRepoConfigurationProps {
    respondOnSuccess: (redirection?: boolean) => void
    appId: number
    reloadAppConfig?: () => void
}
export interface UserGitRepoProps {
    setRepoURL: (string) => void
    setSelectedRepoType: (string) => void
    repoURL: string
    selectedRepoType: string
    staleData?: boolean
    authMode: GitOpsAuthModeType
}

export interface BitbucketCloudAndServerToggleSectionPropsType {
    isBitbucketCloud: boolean
    setIsBitbucketCloud: (value: boolean) => void
}

export interface GitProviderTabProps {
    providerTab: GitProviderType
    /**
     * Acts as handleChange on radio tab
     */
    handleGitopsTab: (e) => void
    /**
     * Based on this would showCheck of previous selected on tab
     */
    lastActiveGitOp: undefined | GitOpsConfig
    /**
     * Value of current tab
     */
    provider: GitProvider
    /**
     * The name to be displayed on tab and would be using that in switch case of GitProviderTabIcons
     */
    gitops: string
    /**
     * If true would disable radio tab
     */
    saveLoading: boolean
    datatestid: string
}
