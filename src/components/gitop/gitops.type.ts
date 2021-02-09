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

export interface GitList{
          id: number,
          provider: string,
          host: string,
          token:  string,
          username?: string ,
          active: boolean,
          gitLabGroupId: string,
          gitHubOrgId: string,

        }
 

export interface GitOpsState{
    view: string;
    statusCode: number;
    githost: string;
    gitList: GitList[];
    form:GitList
    saveLoading:boolean,
}

export interface GitOpsProps extends RouteComponentProps<{}> { }