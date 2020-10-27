import { RouteComponentProps } from 'react-router';
import { ServerError } from '../../modals/commonTypes';

export interface DevtronLoginState {
    code: number;
    errors: ServerError[];
    form: {
        username: string;
        password: string;
    };
    loading: boolean;
}

export interface DevtronLoginProps extends RouteComponentProps<{}>{}
