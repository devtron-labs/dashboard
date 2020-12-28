import { RouteComponentProps } from 'react-router';
import { ServerError } from '../../modals/commonTypes';


export interface SSOLogin {
    id: number;
    name: string;
    label: string;
    active: boolean;
}

export interface SSOConfig{
    type: string;
    id: string;
    name: string;
    config: {
        issuer: string;
        clientID: string;
        clientSecret: string;
        redirectURI: string;
        hostedDomains: [];
    }
}

export interface SSOLoginState{
    sso: string;
    showWarningCard: boolean
    loginList: SSOLogin[];
    configList: SSOConfig[];
    searchQuery: string;
}

export interface SSOLoginProps{
    close: () => void;
}