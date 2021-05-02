import { ServerError } from '../../../modals/commonTypes';
import { RouteComponentProps } from 'react-router-dom';
import { FilterOption } from '../../common/filter/types';
import { AppCheckList, ChartCheckList } from '../../checkList/checklist.type';

export interface ExternalListFilterOption {
    label: string;
    value: number;
}
export interface AppListState {
    code: number;
    view: string;
    errors: ServerError[];
    apps: App[];
    searchQuery: string;
    searchApplied: boolean;
    showCommandBar: boolean;
    filters: {
        environment: FilterOption[];
        status: FilterOption[];
        team: FilterOption[];
    },
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
    showExternalList: boolean;
    collapsedListTogglingModal: boolean;
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
    }[];
    ciArtifactId: number;
}

export interface AppListProps extends RouteComponentProps<{ route: string }> {

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

export interface ListContainerState {
    collapsed: boolean;
    code: number;
    view: string;
}

export interface ListContainerProps extends RouteComponentProps<{}> {
    closeModal: () => void;
}

export interface ExternalList {
    appname: string;
    environment: string;
    lastupdate: string;
}

export interface ExternalQueryList {
    appname: string;
    environment: string;
    queryMatch: string;
}

export interface ExternalListContainerState {
    view: string;
    code: number;
    externalList: ExternalList[];
    filters: {
        namespace: ExternalListFilterOption[];
        cluster: ExternalListFilterOption[];
    };
    namespaceHashmap: Map<string, any>;
    clusterHashmap: Map<string, any>;
    selectedNamespace: ExternalListFilterOption[];
    searchQuery: string;
    searchApplied: boolean;
    selectedCluster: ExternalListFilterOption[]
    externalQueryList: ExternalQueryList[],
    appliedCluster: ExternalListFilterOption[];
    appliedNamespace: ExternalListFilterOption[];
}

export interface ExternalListContainerProps extends RouteComponentProps<{}> {
}

export interface ExternalListViewProps extends RouteComponentProps<{}> {
    view: string;
    externalList: ExternalList[];
    filters: {
        namespace: ExternalListFilterOption[];
        cluster: ExternalListFilterOption[];
    }
    appliedNamespace: ExternalListFilterOption[];
    appliedCluster: ExternalListFilterOption[];
    removeFilter: (key: any, val: any) => void;
    removeAllFilters: () => void;
    code: number;
}

export interface ExternalSearchQueryListProps extends RouteComponentProps<{}> {
    view: string;
    externalQueryList: ExternalQueryList[];
    filters: {
        namespace: ExternalListFilterOption[];
        cluster: ExternalListFilterOption[];
    }
    appliedNamespace: ExternalListFilterOption[];
    appliedCluster: ExternalListFilterOption[];
}