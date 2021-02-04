import { RouteComponentProps } from 'react-router'

export interface CustomGitOpsState{
   username: {
       value: string;
       error: string
   };
   password: {
    value: string;
    error: string
};
}

export interface GitOpsState{
    view: string;
    statusCode: number;
    githost: string;
    git: string;
    customGitOpsState: CustomGitOpsState;
}

export interface GitOpsProps extends RouteComponentProps<{}> { }