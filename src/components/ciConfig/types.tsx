import { RouteComponentProps } from 'react-router';
import { ServerError } from '../../modals/commonTypes';
import { WorkflowType } from '../app/details/triggerView/types';

export interface ArgsFieldSetProps {
    args: { key: string, value: string }[];
    addMoreArgs: () => void;
    removeArgs: (index: number) => void;
    saveArgs: (event: React.ChangeEvent, key: string, index: number) => void;
}

export interface DockerRegistry {
    id: string;
    registryUrl: string;
    isDefault: boolean;
}

export interface CIConfigState {
    registryOptions: Array<DockerRegistry>;

    buttonLabel: string;
    code: number;
    errors: ServerError[],
    successMessage: string | null;

    view: string;
    configStatus: number;
    sourceConfigData: {
        appName: string,
        material: {id:number, name:string, checkoutPath: string}[];
    };
    form: {
        id: number;
        appId: number | null;
        checkoutPath: string;
        dockerFilePath: string;
        args: Array<{ key: string, value: string }>;
        dockerRegistry: string;
        dockerRepository: string;
        dockerfile: string;
    },
    version: string;
    isUnsaved:boolean;
    showDialog: boolean;
}


export interface CIConfigRouterProps {
    appId: string;
    history: any;
}

export interface CIConfigProps extends RouteComponentProps<CIConfigRouterProps> {
    respondOnSuccess?: () => void;
}

export interface ProcessedWorkflowsType {
    processing: boolean
    workflows: WorkflowType[]
}