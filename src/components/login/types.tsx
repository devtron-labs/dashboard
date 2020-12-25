import { RouteComponentProps } from 'react-router';
import { ServerError } from '../../modals/commonTypes';


export interface SSOConfig {
    id: number;
    name: string;
    label: string;
    active: boolean;
}

export interface SSOLoginState{
    sso: string;
    showWarningCard: boolean
    loginList: SSOConfig[];
}

export interface SSOLoginProps extends RouteComponentProps<{}>{
    close: () => void;
}