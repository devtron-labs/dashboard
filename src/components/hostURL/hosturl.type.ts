import { RouteComponentProps } from 'react-router';

export interface HostList{
    id: number,
    url: string,
    active: boolean,
}

export interface HostURLState {
    view: string;
    statusCode: number;
    hostList: HostList[];
    value: string;
    saveLoading: boolean;
    hostStoreName: string;
    form: HostList
}

export interface HostURLProps extends RouteComponentProps<{}> { }