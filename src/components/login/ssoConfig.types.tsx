import { RouteComponentProps } from "react-router-dom";

export interface SSOLogin {
    id: number;
    name: string;
    active: boolean;
}

export interface SSOLoginState {
    view: string;
    statusCode: number;
    saveLoading: boolean;
    sso: string; //lowercase
    lastActiveSSO: undefined | SSOLogin
    configMap: string;
    showToggling: boolean;
    ssoConfig: SSOConfigType;
    isError: {
        url: string;
    },
    invalidYaml: boolean;
}

export interface SSOConfigType {
    name?: string;
    id?: number;
    url?: string;
    config: {
        type: string;
        id: string;
        name: string;
        config: string; //YAML string
    },
    active?: boolean;
}

export interface SSOLoginProps extends RouteComponentProps<{}> {

}

export interface SSOLoginTabType {
    handleSSOClick: (e) => void;
    checked: boolean;
    lastActiveSSO: undefined | SSOLogin;
    value: string;
    SSOName: string
}

export const OIDCtype:string = "oidc"