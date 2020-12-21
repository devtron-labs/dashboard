import { RouteComponentProps } from 'react-router';
import { ServerError } from '../../modals/commonTypes';

export interface SSOInterface{
    id: number;
    name: "";
    label: "";
    active: true
    }


export interface LoginFormState {
    code: number;
    continueUrl: string;
    loginList: SSOInterface[];
    errors: ServerError[];
    form: {
        username: string;
        password: string;
    };
    loading: boolean;
}

export interface LoginProps extends RouteComponentProps<{}> {}
