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
          orgOrGroupId: string,
          id: number,
          provider: string,
          host: string,
          token:  string,
          username: string ,
          active: boolean,
        }
 

export interface GitOpsState{
    view: string;
    statusCode: number;
    githost: string;
    git: string;
    gitList: GitList[];
    customGitOpsState: CustomGitOpsState;
    showToggling: boolean;
    githostCom:{
        value: string;
        error:''
    }
}

export interface GitOpsProps extends RouteComponentProps<{}> { }