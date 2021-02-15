import { post, put, get } from '../../services/api';
import { Routes } from '../../config';

export function getHostURLList(): Promise<any> {
    const URL = `${Routes.HOST_URL}/active`;
    return get(URL)
}

export function createHostURLList(request): Promise<any> {
    const URL = `${Routes.HOST_URL}/create`;
    return post(URL, request);
}

export function updateHostURLList(request): Promise<any> {
    const URL = `${Routes.HOST_URL}/update`;
    return put(URL, request);
}