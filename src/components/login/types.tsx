import { RouteComponentProps } from 'react-router';
import { ServerError } from '../../modals/commonTypes';


export interface LoginFormState {
    code: number;
    continueUrl: string;
    loginList: [];
    errors: ServerError[];
    form: {
        username: string;
        password: string;
    };
    loading: boolean;
}

export interface LoginProps extends RouteComponentProps<{}> {}
