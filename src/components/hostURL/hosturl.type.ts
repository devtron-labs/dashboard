import { RouteComponentProps } from 'react-router';

export interface HostURLState{
    value: string;
    saveLoading: boolean;
}

export interface HostURLProps extends RouteComponentProps<{}> { }