import { RouteComponentProps } from 'react-router';

export interface HostURLConfig {
    id: number,
    key: string;
    value: string,
    active: boolean,
}

export interface HostURLConfigState {
    view: string;
    statusCode: number;
    isHostUrlSaved: boolean;
    saveLoading: boolean;
    form: HostURLConfig;
    isHostUrlValid: boolean;
}

export interface HostURLConfigProps extends RouteComponentProps<{}> { }