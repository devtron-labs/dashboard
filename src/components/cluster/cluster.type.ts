import { RouteComponentProps } from "react-router-dom";

export const POLLING_INTERVAL = 30000;

export const AuthenticationType = {
    BASIC: "BASIC",
    ANONYMOUS: "ANONYMOUS"
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


export interface ClusterListProps extends RouteComponentProps<{}> {

}

export default interface Config {
    bearer_token: string;
}

export interface Cluster {
    id?: number;
    cluster_name: string;
    prometheus_url: string;
    server_url: string;
    userName: string;
    password: string;
    bearer_token: string;
    tlsClientKey: string;
    tlsClientCert: string;
    authType: string;
    active: boolean;
}

export interface ClusterFormState {
    saveLoading: boolean;
    isFormLoading: boolean;
    form: Cluster;
    isError: {
        cluster_name: { name: string; }[];
        bearer_token: { name: string; }[];
        prometheus_url: { name: string; }[];
        server_url: { name: string; }[];
        userName: { name: string; }[];
        password: { name: string; }[];
        tlsClientKey: { name: string; }[];
        tlsClientCert: { name: string; }[];
    };
}

export interface ClusterFormProps extends RouteComponentProps<{}> { }

export interface EnvironmentValue {
    environment_name: string;
    namespace: string;
    isProduction: string;
    prometheus_endpoint: string;
    cluster_id: number;
}

export interface isError {
    environment_name: string;
    namespace: string;
}

export interface EnvironmentState {
    id: number;
    loading: boolean;
    isError: isError;
    form: EnvironmentValue;
    environment: [];
    isclosed: boolean;
    saveLoading: boolean;
}

export interface EnvironmentProps extends RouteComponentProps<{}> {
    environment_name: string;
    namespace: string;
    id: number;
    cluster_id: number;
    handleClose: boolean;
    prometheus_endpoint: string;
    isProduction: boolean;
    isNamespaceMandatory: boolean;
    ignore: boolean;
    ignoreError: string;
    close: () => void;
}