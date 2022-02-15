import { RouteComponentProps } from 'react-router';
import { HostURLConfig } from '../../services/service.types';

export interface HostURLConfigState {
    view: string;
    statusCode: number;
    saveLoading: boolean;
    form: HostURLConfig;
    isHostUrlValid: boolean;
}

export interface HostURLConfigProps extends RouteComponentProps<{}> {
    refreshGlobalConfig: () => void;
    handleChecklistUpdate: (hostUrl) => void;
}