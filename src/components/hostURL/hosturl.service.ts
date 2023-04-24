import { post, put } from '@devtron-labs/devtron-fe-common-lib';
import { Routes } from '../../config';


export function saveHostURLConfiguration(request): Promise<any> {
    const URL = `${Routes.HOST_URL}/create`;
    return post(URL, request);
}

export function updateHostURLConfiguration(request): Promise<any> {
    const URL = `${Routes.HOST_URL}/update`;
    return put(URL, request);
}