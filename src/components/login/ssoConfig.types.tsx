export interface SSOLogin {
    id: number;
    name: string;
    // label: string;
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

export interface SSOLoginProps {
    close: () => void;
}