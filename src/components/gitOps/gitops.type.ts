import { RouteComponentProps } from 'react-router'

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

export interface GitList {
    id: number,
    provider: "GITHUB" | "GITLAB";
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
    tab: string;
    gitList: GitList[];
    form: GitList
    saveLoading: boolean;
    isError: {
        username: string;
        token: string;
        gitHubOrgId: string;
        gitLabGroupId: string;
    }
}

export interface GitOpsProps extends RouteComponentProps<{}> { }