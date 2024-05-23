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

export type GitProviderType =
    | 'GITHUB'
    | 'GITLAB'
    | 'AZURE_DEVOPS'
    | 'BITBUCKET_CLOUD'
    | 'BITBUCKET_DC'
    | GitProvider.AWS_CODE_COMMIT

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
    isError: {
        host: string
        username: string
        token: string
        gitHubOrgId: string
        gitLabGroupId: string
        azureProjectName: string
        bitBucketWorkspaceId: string
        bitBucketProjectKey: string
        sshHost: string
        sshKey: string
    }
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
