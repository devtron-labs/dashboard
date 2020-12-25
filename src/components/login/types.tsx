import { RouteComponentProps } from 'react-router';
import { ServerError } from '../../modals/commonTypes';


export interface LoginFormState {
    code: number;
    errors: ServerError[];
}

export interface LoginProps extends RouteComponentProps<{}> {
}

export interface SSOLoginState{
    loading: boolean;
    sso: string;
    showWarningCard: boolean
}
export interface SSOLoginProps extends RouteComponentProps<{}>{}