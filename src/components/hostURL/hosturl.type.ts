import { RouteComponentProps } from 'react-router';

export interface HostURLState{
    
    view: string;
    statusCode: number;
    value: string;
    saveLoading: boolean;
    hostStoreName: string;
}

export interface HostURLProps extends RouteComponentProps<{}> { }