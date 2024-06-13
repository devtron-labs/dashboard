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
import { CustomNavItemsType } from '../app/details/appConfig/appConfig.type'
import { TLSConfigDTO, TLSConnectionDTO } from '../common/TLSConnectionForm/types'

export type GitOpsFieldKeyType =
    | 'host'
    | 'username'
    | 'token'
    | 'gitHubOrgId'
    | 'azureProjectName'
    | 'gitLabGroupId'
    | 'bitBucketWorkspaceId'
    | 'bitBucketProjectKey'
export type GitOpsOrganisationIdType =
    | 'gitHubOrgId'
    | 'gitLabGroupId'
    | 'azureProjectName'
    | 'bitBucketWorkspaceId'
    | 'bitBucketProjectKey'
export type GitProviderType = 'GITHUB' | 'GITLAB' | 'AZURE_DEVOPS' | 'BITBUCKET_CLOUD' | 'BITBUCKET_DC'

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

export enum GitProvider {
    GITLAB = 'GITLAB',
    GITHUB = 'GITHUB',
    AZURE_DEVOPS = 'AZURE_DEVOPS',
    BITBUCKET_CLOUD = 'BITBUCKET_CLOUD',
}

export interface GitOpsConfig extends TLSConfigDTO, Pick<TLSConnectionDTO, 'enableTLSVerification'> {
    id: number
    provider: GitProviderType
    host: string
    token: string
    username?: string
    active: boolean
    gitLabGroupId: string
    gitHubOrgId: string
    azureProjectName: string
    bitBucketWorkspaceId: string
    bitBucketProjectKey: string
}

export interface GitOpsState {
    view: string
    statusCode: number
    providerTab: GitProviderType
    gitList: GitOpsConfig[]
    form: GitOpsConfig
    isFormEdited: boolean
    lastActiveGitOp: undefined | GitOpsConfig
    saveLoading: boolean
    validateLoading: boolean
    isBitbucketCloud: boolean
    isError: {
        host: string
        username: string
        token: string
        gitHubOrgId: string
        gitLabGroupId: string
        azureProjectName: string
        bitBucketWorkspaceId: string
        bitBucketProjectKey: string
        keyData: string
        certData: string
        caData: string
    }
    validatedTime: string
    validationError: GitOpsConfig[]
    validationStatus: string
    deleteRepoError: boolean
    isUrlValidationError: boolean
    selectedRepoType: string
    validationSkipped: boolean
    allowCustomGitRepo: boolean
}

export interface GitOpsProps extends RouteComponentProps<{}> {
    handleChecklistUpdate: (string) => void
}

export interface UserGitRepoConfigurationProps {
    respondOnSuccess: (redirection?:boolean) => void
    appId: number
    reloadAppConfig?: () => void
}
export interface UserGitRepoProps {
    setRepoURL: (string) => void
    setSelectedRepoType: (string) => void
    repoURL: string
    selectedRepoType: string
    staleData?: boolean
}

export interface BitbucketCloudAndServerToggleSectionPropsType {
    isBitbucketCloud: boolean
    setIsBitbucketCloud: (value: boolean) => void
}
