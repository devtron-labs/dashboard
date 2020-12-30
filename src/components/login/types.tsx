import { RouteComponentProps } from 'react-router';
import { ServerError } from '../../modals/commonTypes';

export interface SSOLogin {
    id: number;
    name: string;
    label: string;
    active: boolean;
}

export interface SSOLoginState {
    isLoading:boolean;
    sso: string;
    configMap: string;
    showToggling: boolean
    configList: SSOConfigType[];
}

interface SSOConfigType {
    name: string;
    url: string;
    config: string;
    // config: {
    //     type: string;
    //     id: string;
    //     name: string;
    //     config: {
    //         issuer: string;
    //         clientID: string;
    //         clientSecret: string;
    //         redirectURI: string;
    //         hostedDomains: any[];
    //     }
    // }
}

export interface SSOLoginProps {
    close: () => void;
}