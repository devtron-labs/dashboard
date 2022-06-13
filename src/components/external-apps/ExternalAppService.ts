import {get, post, put, trash} from '../../services/api';
import {Routes} from '../../config';
import {ResponseType} from '../../services/service.types';
import {HelmApp, AppEnvironmentDetail} from '../app/list-new/AppListService';
import {ResourceTree} from '../v2/appDetails/appDetails.type';

export interface ReleaseInfoResponse extends ResponseType {
    result?: ReleaseAndInstalledAppInfo
}

export interface HelmAppDetailResponse extends ResponseType {
    result?: HelmAppDetailAndInstalledAppInfo
}

export interface UninstallReleaseResponse extends ResponseType {
    result?: ActionResponse
}

export interface UpdateReleaseResponse extends ResponseType {
    result?: ActionResponse
}

export interface HelmAppDetailAndInstalledAppInfo {
    appDetail : HelmAppDetail,
    installedAppInfo : InstalledAppInfo,
}

export interface ReleaseAndInstalledAppInfo {
    releaseInfo : ReleaseInfo,
    installedAppInfo : InstalledAppInfo,
}

export interface ReleaseInfo {
    deployedAppDetail: HelmApp
    defaultValues: string,
    overrideValues: string,
    mergedValues: string,
    readme: string,
}

export interface InstalledAppInfo {
    appId: number
    installedAppId: number
    installedAppVersionId: number
    environmentId: number
    environmentName: string
    appOfferingMode: string
    appStoreChartId: number
    appStoreChartName: string
    appStoreChartRepoName: string
    clusterId: number
}

export interface HelmAppDetail {
    applicationStatus: string,
    releaseStatus: HelmReleaseStatus,
    lastDeployed: DeployedAt,
    chartMetadata: ChartMetadata,
    resourceTreeResponse: ResourceTree,
    environmentDetails: AppEnvironmentDetail
}

export interface ActionResponse {
    success: boolean
}

export interface DeployedAt {
    seconds: number
    nanos: number
}

export interface ChartMetadata {
    chartName: string
    chartVersion: string
    home: string
    sources: string[]
    description: string
    notes?: string
}

interface HelmReleaseStatus {
    status: string,
    message: string,
    description: string
}

export interface UpdateAppReleaseWithoutLinkingRequest {
    appId: string
    valuesYaml: string
}

export interface LinkToChartStoreRequest {
    appId: string
    valuesYaml: string
    appStoreApplicationVersionId: number
    referenceValueId: number
    referenceValueKind: string
}

export interface UpdateAppReleaseRequest {
    id: string
    valuesOverrideYaml: string
    installedAppId: number
    appStoreVersion: number
    referenceValueId: number
    referenceValueKind: string
} 

export const getReleaseInfo = (appId: string): Promise<ReleaseInfoResponse> => {
    let url = `${Routes.HELM_RELEASE_INFO_API}?appId=${appId}`
    return get(url);
}

export const getAppDetail = (appId: string): Promise<HelmAppDetailResponse> => {
    let url = `${Routes.HELM_RELEASE_APP_DETAIL_API}?appId=${appId}`
    return get(url);
}

export const deleteApplicationRelease = (appId: string): Promise<UninstallReleaseResponse> => {
    let url = `${Routes.HELM_RELEASE_APP_DELETE_API}?appId=${appId}`
    return trash(url);
}

export const updateAppReleaseWithoutLinking = (requestPayload: UpdateAppReleaseWithoutLinkingRequest): Promise<UpdateReleaseResponse> => {
    return put(Routes.HELM_RELEASE_APP_UPDATE_WITHOUT_LINKING_API, requestPayload);
};

export const updateAppRelease = (requestPayload: UpdateAppReleaseRequest): Promise<any> => {
    return put(Routes.UPDATE_APP_API, requestPayload);
};

export const linkToChartStore = (request: LinkToChartStoreRequest): Promise<UpdateReleaseResponse> => {
    return put(Routes.HELM_LINK_TO_CHART_STORE_API, request);
};
