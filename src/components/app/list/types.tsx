import { ServerError } from '../../../modals/commonTypes';
import { RouteComponentProps } from 'react-router';
import { AppCheckList, ChartCheckList } from '../../checkList/checklist.type';

export interface AppListState {
    code: number;
    view: string;
    errors: ServerError[];
    apps: App[];
    showCommandBar: boolean;
    sortRule: {
        key: string;
        order: string;
    },
    size: number;
    offset: number;
    pageSize: number;
    expandedRow: boolean;
    appData: App | null;
    isAppCreated: boolean;
    appStageCompleted: number;
    chartStageCompleted: number;
    appChecklist: AppCheckList;
    chartChecklist: ChartCheckList;
}

export interface App {
    id: number;
    name: string;
    environments: Array<Environment & { default: boolean }>;
    defaultEnv: Environment | null;
}

export interface Environment {
    id: number;
    name: string;
    status: string;
    lastDeployedTime: string;
    materialInfo: {
        author: string;
        branch: string;
        message: string;
        modifiedTime: string;
        revision: string;
        url: string;
        gitMaterialName: string;
        webhookData: string;
    }[];
    ciArtifactId: number;
    clusterName: string;
    namespace: string;
}

export interface AppListProps extends RouteComponentProps<{ route: string }> {
    payloadParsedFromUrl?: any;
    appCheckListRes? : any;
    serverMode? : string;
    clearAllFilters: () => void;
    sortApplicationList : (key: string) => void;
    updateLastDataSync : () => void;
}

export interface AppListResponse {
    appId: number
    appName: string
    environments: AppListEnvironmentResponse
}

export interface AppListEnvironmentResponse {
    appId: number
    appName: string
    environmentId: number
    environmentName: string
    deploymentCounter?: number
    instanceCounter?: number
    status?: string
    lastDeployedTime?: string
    namespace?: string
    prometheusEndpoint?: string
    default?: boolean
    lastSuccessDeploymentDetail?: DeploymentDetailContainerResponse
}

export interface DeploymentDetailContainerResponse {
    appId: number
    appName: string
    environmentId: number
    environmentName: string
    statusMessage?: string
    LastDeployedBy?: string
    status?: string
    lastDeployedTime?: string
    namespace?: string
    prometheusEndpoint?: string
    default?: boolean
    materialInfo?: any
    releaseVersion?: string
    dataSource?: string
    lastDeployedPipeline?: string
}


export const OrderBy = {
    ASC: 'ASC',
    DESC: 'DESC'
}

export const SortBy = {
    APP_NAME: "appNameSort",
    LAST_DEPLOYED: "lastDeployedSort",
    STATUS: "statusSort",
    ENVIRONMENT: "environmentSort",
}

