import {get, post, put, trash} from '../../services/api';
import {Routes} from '../../config';
import {ResponseType} from '../../services/service.types';
import {HelmApp} from '../app/list-new/AppListService';

export interface ReleaseInfoResponse extends ResponseType {
    result?: ReleaseInfo
}

export interface ReleaseInfo {
    deployedAppDetail: HelmApp
    defaultValues: string,
    overrideValues: string,
    mergedValues: string,
    readme: string,
}

export const getReleaseInfo = (appId: string): Promise<ReleaseInfoResponse> => {
    let url = `${Routes.HELM_RELEASE_INFO_API}?appId=${appId}`
    return get(url);
}
