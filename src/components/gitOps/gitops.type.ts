import { RouteComponentProps } from 'react-router'
import { CustomNavItemsType } from '../app/details/appConfig/appConfig.type'

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

export interface GitOpsConfig {
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
