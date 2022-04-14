import { RouteComponentProps } from "react-router-dom";
import { SERVER_MODE_TYPE } from "../../config";

export const POLLING_INTERVAL = 30000;

export const AuthenticationType = {
    BASIC: "BASIC",
    ANONYMOUS: "ANONYMOUS",
    IAM: 'IAM'
}

export enum ClusterComponentStatus {
    WF_UNKNOWN = 'WF_UNKNOWN',
    REQUEST_ACCEPTED = 'REQUEST_ACCEPTED',
    ENQUEUED = 'ENQUEUED',
    QUE_ERROR = 'QUE_ERROR',
    DEQUE_ERROR = 'DEQUE_ERROR',
    TRIGGER_ERROR = 'TRIGGER_ERROR',
    DEPLOY_SUCCESS = 'DEPLOY_SUCCESS',
    DEPLOY_INIT = 'DEPLOY_INIT',
    GIT_ERROR = 'GIT_ERROR',
    GIT_SUCCESS = 'GIT_SUCCESS',
    ACD_ERROR = 'ACD_ERROR',
    ACD_SUCCESS = 'ACD_SUCCESS',
}

export type ClusterComponentStatusType = keyof typeof ClusterComponentStatus;

export type ClusterInstallStage = -1 | 0 | 1 | 2 | 3;

export interface ClusterComponentType {
    name: string;
    appId: number;
    installedAppId: number;
    envId: number;
    envName: string;
    status: ClusterComponentStatusType;
}

export interface ClusterComponentModalProps {
    agentInstallationStage: ClusterInstallStage;
    components: ClusterComponentType[] | null;
    environmentName: string;
    redirectToChartDeployment: (appId, envId) => void;
    callRetryClusterInstall: () => void;
    close: (event) => void;
}

export interface ClusterInstallStatusProps {
    agentInstallationStage: ClusterInstallStage;
    envName: string | undefined;
    onClick: (...args) => void;
}


export interface ClusterListProps extends RouteComponentProps<{}> {
    serverMode: SERVER_MODE_TYPE
    // view: string;
    // clusters: {
    //     id: number;
    //     active: boolean;
    //     cluster_name: string;
    //     agentInstallationStage: ClusterInstallStage;
    //     defaultClusterComponent: any[] | null;
    //     prometheus_url: string;
    //     environments: any[];
    //     server_url: string;
    // }[];
    // clusterEnvMap: any;
}
