import { RouteComponentProps } from 'react-router';
import { ServerError } from '../../modals/commonTypes';

export interface DevtronLoginState {
    continueUrl: string;
}

export interface DevtronLoginProps extends RouteComponentProps<{}>{}
