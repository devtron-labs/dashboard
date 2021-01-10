export interface SSOLogin {
    id: number;
    name: string;
    label: string;
    active: boolean;
}

export interface SSOLoginState {
    isLoading: boolean;
    saveLoading:boolean;
    sso: {
        id: string;
        name: string;
    },
    lastActiveSSO: string;
    configMap: string;
    showToggling: boolean;
    ssoConfig: SSOConfigType;
}

interface SSOConfigType {
    name?: string;
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