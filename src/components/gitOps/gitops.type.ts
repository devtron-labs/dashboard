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

import { RouteComponentProps } from 'react-router-dom'
import { TLSConfigDTO, TLSConnectionDTO } from '../common/TLSConnectionForm/types'
import { BaseGitOpsType, GitOpsAuthModeType } from '@devtron-labs/devtron-fe-common-lib'
import { GitProvider } from '@Components/common/GitTabs/constants'
import { GitProviderTabProps, GitProviderType } from '@Components/common/GitTabs/types'

export type GitOpsOrganisationIdType =
    | 'gitHubOrgId'
    | 'gitLabGroupId'
    | 'azureProjectName'
    | 'bitBucketWorkspaceId'
    | 'bitBucketProjectKey'

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

export interface GitOpsConfig
    extends TLSConfigDTO,
        Pick<
            TLSConnectionDTO,
            'enableTLSVerification' | 'isCADataPresent' | 'isTLSCertDataPresent' | 'isTLSKeyDataPresent'
        >,
        Pick<BaseGitOpsType, 'sshHost' | 'sshKey' | 'username' | 'token' | 'authMode'> {
    id: number
    provider: GitProviderType
    host: string
    active: boolean
    gitLabGroupId: string
    gitHubOrgId: string
    azureProjectName: string
    bitBucketWorkspaceId: string
    bitBucketProjectKey: string
    allowCustomRepository?: boolean
    isCADataClearedAfterInitialConfig: boolean
    isTLSCertDataClearedAfterInitialConfig: boolean
    isTLSKeyDataClearedAfterInitialConfig: boolean
}

export interface DefaultShortGitOpsType
    extends Pick<GitOpsConfig, 'caData' | 'tlsCertData' | 'tlsKeyData'>,
        Pick<BaseGitOpsType, 'sshHost' | 'sshKey' | 'token' | 'username' | 'authMode'> {
    host: string
    gitHubOrgId: string
    gitLabGroupId: string
    azureProjectName: string
    bitBucketWorkspaceId: string
    bitBucketProjectKey: string
}

export interface GitOpsFormErrorType extends Omit<DefaultShortGitOpsType, 'authMode'> {}

interface BitBucketDCDataStoreType {
    [GitOpsAuthModeType.PASSWORD]: Pick<BaseGitOpsType, 'username' | 'token'>
    [GitOpsAuthModeType.SSH_AND_PASSWORD]: Pick<BaseGitOpsType, 'username' | 'sshKey' | 'token'>
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
    providerTab: GitProvider
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
     * Can also contain BitBucket DC as provider
     */
    lastActiveGitOp: undefined | GitOpsConfig
    saveLoading: boolean
    validateLoading: boolean
    /**
     * To identify which radio tab is selected in case of bitbucket
     */
    isBitbucketCloud: boolean
    /**
     * Error states for input fields
     */
    isError: GitOpsFormErrorType
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
    /**
     * To show update confirmation dialog, in case of updating git provider details
     */
    showUpdateConfirmationDialog: boolean
    /**
     * Initial value of authMode for BitBucketDC and if fresh setup, then set that as PASSWORD
     */
    initialBitBucketDCAuthMode: GitOpsAuthModeType
    bitBucketDCDataStore: BitBucketDCDataStoreType
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

export interface GitProviderTabIconsProps extends Pick<GitProviderTabProps, 'provider'> {
    rootClassName?: string
}

export interface UpdateConfirmationDialogProps
    extends Pick<GitOpsState, 'lastActiveGitOp' | 'providerTab' | 'saveLoading'> {
    handleUpdate: () => void
    handleCancel: () => void
    /**
     * To render title provider for bitbucket
     */
    enableBitBucketSource: boolean
}
