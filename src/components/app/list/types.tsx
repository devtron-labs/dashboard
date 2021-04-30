import { ServerError } from '../../../modals/commonTypes';
import { RouteComponentProps } from 'react-router-dom';
import { FilterOption } from '../../common/filter/types';
import { AppCheckList, ChartCheckList } from '../../checkList/checklist.type';

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

export interface SelectedExternalDropdown {
    label: string;
    value: string;
}

export interface ExternalListContainerState {
    view: string;
    code: number;
    loadingData: boolean;
    externalList: ExternalList[];
    filters: {
        namespace: FilterOption[];
        cluster: FilterOption[];
    },
    selectedNamespace: SelectedExternalDropdown[];
    searchQuery: string;
    searchApplied: boolean;
    selectedCluster: SelectedExternalDropdown[]
    externalQueryList: ExternalQueryList[],
    appliedCluster: SelectedExternalDropdown[];
    appliedNamespace: SelectedExternalDropdown[];
}

export interface ExternalListContainerProps extends RouteComponentProps<{}> {
}

export interface ExternalDefaultListProps extends RouteComponentProps<{}> {
    view: string;
    externalList: ExternalList[];
    filters: {
        namespace: FilterOption[];
        cluster: FilterOption[];
    }
    appliedNamespace: SelectedExternalDropdown[];
    appliedCluster: SelectedExternalDropdown[];
    removeFilter: (key: any, val: any) => void;
    removeAllFilters: () => void;
}

export interface ExternalSearchQueryListProps extends RouteComponentProps<{}> {
    view: string;
    externalQueryList: ExternalQueryList[];
    filters: {
        namespace: FilterOption[];
        cluster: FilterOption[];
    }
    appliedNamespace: SelectedExternalDropdown[];
    appliedCluster: SelectedExternalDropdown[];
}