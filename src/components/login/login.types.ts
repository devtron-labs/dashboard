import { RouteComponentProps } from 'react-router';
import { ServerError } from '../../modals/commonTypes';

export interface SSOConfig {
    id: number;
    name: string;
    label: string;
    active: boolean;
}

export interface LoginFormState {
    code: number;
    continueUrl: string;
    loginList: SSOConfig[];
    errors: ServerError[];
    form: {
        username: string;
        password: string;
    };
    loading: boolean;
}

export interface LoginProps extends RouteComponentProps<{}> { }
