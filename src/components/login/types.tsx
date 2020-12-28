import { RouteComponentProps } from 'react-router';
import { ServerError } from '../../modals/commonTypes';


export interface SSOLogin {
    id: number;
    name: string;
    label: string;
    active: boolean;
}



export interface SSOLoginState{
    
    sso: string;
    configMap: string;
    showToggling: boolean
    loginList: SSOLogin[];
    configList: {
                switch: string;
                name: string;
                url:string;
                config:{
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
    };
}

export interface SSOLoginProps{
    close: () => void;
}