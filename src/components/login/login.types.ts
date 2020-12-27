import { RouteComponentProps } from 'react-router';

export interface SSOConfig {
    id: number;
    name: string;
    label: string;
    active: boolean;
}

export interface LoginFormState {
    continueUrl: string;
    loginList: SSOConfig[];
    form: {
        username: string;
        password: string;
    };
    loading: boolean;
}

export interface LoginProps extends RouteComponentProps<{}> { }
