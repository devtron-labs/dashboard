import { RouteComponentProps } from 'react-router';

export interface HostList{
    id: number,
    key: string;
    value: string,
    active: boolean,
}

export interface HostURLState {
    view: string;
    statusCode: number;
    isHostUrlSaved: boolean;
    value: string;
    saveLoading: boolean;
    hostStoreName: string;
    form: HostList
}

export interface HostURLProps extends RouteComponentProps<{}> { }