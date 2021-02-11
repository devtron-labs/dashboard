import { RouteComponentProps } from 'react-router';

export interface HostURLState{
    
    view: string;
    statusCode: number;
    value: string;
    saveLoading: boolean;
}

export interface HostURLProps extends RouteComponentProps<{}> { }