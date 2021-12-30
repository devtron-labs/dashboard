import {get, post, put, trash} from '../../services/api';
import {Routes} from '../../config';
import {ResponseType} from '../../services/service.types';
import {HelmApp} from '../app/list-new/AppListService';

export interface ReleaseInfoResponse extends ResponseType {
    result?: ReleaseInfo
}

export interface HelmAppDeploymentHistoryResponse extends ResponseType {
    result?: HelmAppDeploymentHistory
}

export interface ReleaseInfo {
    deployedAppDetail: HelmApp
    defaultValues: string,
    overrideValues: string,
    mergedValues: string,
    readme: string,
}

export interface HelmAppDeploymentHistory {
    deploymentHistory: HelmAppDeploymentDetail[]
}

export interface HelmAppDeploymentDetail {
    chartMetadata: ChartMetadata,
    manifest: string,
    dockerImages: string[],
    version: number,
    DeployedAt: DeployedAt
}

interface DeployedAt {
    seconds : number,
    nanos: number
}

interface ChartMetadata {
    chartName: string,
    chartVersion: string,
    home: string,
    sources: string[],
    description: string
}

export const getReleaseInfo = (appId: string): Promise<ReleaseInfoResponse> => {
    let url = `${Routes.HELM_RELEASE_INFO_API}?appId=${appId}`
    return get(url);
}

export const getDeploymentHistory = (appId: string): Promise<HelmAppDeploymentHistoryResponse> => {
    let url = `${Routes.HELM_RELEASE_DEPLOYMENT_HISTORY_API}?appId=${appId}`
    return get(url);
}
