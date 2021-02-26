import { RouteComponentProps } from 'react-router'

export type GitProviderType = "GITHUB" | "GITLAB";
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
    }
}

export interface GitOpsProps extends RouteComponentProps<{}> { }