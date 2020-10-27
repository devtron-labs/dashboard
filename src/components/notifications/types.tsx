import { RouteComponentProps } from 'react-router';
import { ServerError } from '../../modals/commonTypes';

export interface NotifierProps extends RouteComponentProps<{ id: string;}> {
   
}

export interface NotifierState {
    code: number;
    errors: ServerError[];
    successMessage: string | null;
    channel: string,
}

