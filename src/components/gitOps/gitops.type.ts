import { RouteComponentProps } from 'react-router'
export type GitOpsFieldKeyType = "host" | "username" | "token" | "gitHubOrgId" | "azureProjectName" | "gitLabGroupId"  | "bitBucketWorkspaceId" | "bitBucketProjectKey";
export type GitOpsOrganisationIdType = "gitHubOrgId" | "gitLabGroupId" | "azureProjectName" | "bitBucketWorkspaceId" | "bitBucketProjectKey";
export type GitProviderType = "GITHUB" | "GITLAB" | "AZURE_DEVOPS" | "BITBUCKET_CLOUD";

export interface CustomGitOpsState {
    username: {
        value: string;
        error: string
    };
    password: {
        value: string;
        error: string
    };
}


export interface GitOpsConfig {
    id: number,
    provider: GitProviderType;
    host: string,
    token: string,
    username?: string,
    active: boolean,
    gitLabGroupId: string,
    gitHubOrgId: string,
    azureProjectName: string;
    bitBucketWorkspaceId: string;
    bitBucketProjectKey: string;
}


export interface GitOpsState {
    view: string;
    statusCode: number;
    providerTab: GitProviderType;
    gitList: GitOpsConfig[];
    form: GitOpsConfig;
    isFormEdited: boolean;
    lastActiveGitOp: undefined | GitOpsConfig;
    saveLoading: boolean;
    isError: {
        host: string;
        username: string;
        token: string;
        gitHubOrgId: string;
        gitLabGroupId: string;
        azureProjectName: string;
        bitBucketWorkspaceId: string;
        bitBucketProjectKey: string;
    },
    validatedTime: string;
    validationError: GitOpsConfig[];
    validationStatus: string;
    deleteRepoError: boolean;
}

export interface GitOpsProps extends RouteComponentProps<{}> { 
    handleChecklistUpdate: (string) => void
}