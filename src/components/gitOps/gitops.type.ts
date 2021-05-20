import { RouteComponentProps } from 'react-router'
export type GitOpsFieldKeyType = "host" | "username" | "token" | "gitHubOrgId" | "azureOrgId" | "gitLabGroupId";
export type GitProviderType = "GITHUB" | "GITLAB" | "AZURE_DEVOPS";

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
    azureOrgId: string;
}


export interface GitOpsState {
    view: string;
    statusCode: number;
    tab: GitProviderType;
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
        azureOrgId: string;
    }
}

export interface GitOpsProps extends RouteComponentProps<{}> { }