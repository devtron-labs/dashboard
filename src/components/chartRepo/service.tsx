import { Routes } from '../../config';
import { post, put, get } from '../../services/api';

export const getChartProviderList = () => {
    const URL = `${Routes.CHART_LIST}`;
    return get(URL);
}

export const getChartProviderConfig = (id: number): Promise<any> => {
    const URL = `${Routes.CHART_LIST}/${id}`;
    return get(URL);
}

export const updateChartProviderConfig = (request: any, id: number) => {
    const URL = `app-store/repo/update`;
    return post(URL, request);
}

export const saveChartProviderConfig = (request: any, id: any) => {
    const URL = `app-store/repo/create`;
    return post(URL, request);
}