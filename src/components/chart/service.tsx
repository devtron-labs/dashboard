import { Routes } from '../../config';
import { post, put, get } from '../../services/api';

export const getChartProviderList = () => {
    const URL = `${Routes.CHART_PROVIDER}`;
    return get(URL);
}

export const getChartProviderConfig = (id: number): Promise<any> => {
    const URL = `${Routes.CHART_PROVIDER}/${id}`;
    return get(URL);
}

export const updateChartProviderConfig = (request: any, id: number) => {
    const URL = `${Routes.CHART_PROVIDER}`;
    return put(URL, request);
}

export const saveChartProviderConfig = (request: any, id: any) => {
    const URL = `${Routes.CHART_PROVIDER}`;
    return post(URL, request);
}