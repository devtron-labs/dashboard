import { Routes } from '../../config';
import { post, get, trash } from '../../services/api';

export const getChartProviderConfig = (id: number): Promise<any> => {
    const URL = `${Routes.CHART_REPO}/${Routes.CHART_LIST_SUBPATH}/${id}`;
    return get(URL);
}

export const updateChartProviderConfig = (request: any, id: number) => {
    const URL = `${Routes.CHART_REPO}/update`;
    return post(URL, request);
}

export const saveChartProviderConfig = (request: any, id: any) => {
    const URL = `${Routes.CHART_REPO}/create`;
    return post(URL, request);
}

export const validateChartRepoConfiguration = (request: any):Promise<any> => {
    const URL = `${Routes.CHART_REPO}/validate`;
    return post(URL, request);
}

export const reSyncChartRepo = ():Promise<any> => {
    const URL = `${Routes.CHART_REPO}/${Routes.CHART_RESYNC}`;
    return post(URL, undefined);
}

export function deleteChartRepo(request){
    return trash(`${Routes.CHART_REPO}`, request);
}