export interface SSOLogin {
    id: number;
    name: string;
    label: string;
    active: boolean;
}

export interface SSOLoginState {
    isLoading: boolean;
    saveLoading:boolean;
    sso: string;
    lastActiveSSO: string;
    configMap: string;
    showToggling: boolean;
    ssoConfig: SSOConfigType;
}

interface SSOConfigType {
    name: string;
    url: string;
    config: {
        type: string;
        id: string;
        name: string;
        config: string; //YAML string
    },
    active: boolean;
}

export interface SSOLoginProps {
    close: () => void;
}