import { Routes } from '../../config';
import { post, put, get } from '../../services/api';

export function getGitProviderList() {
    const URL = `${Routes.GIT_PROVIDER}`;
    return get(URL);
}

export function getGitProviderConfig(id: number): Promise<any> {
    const URL = `${Routes.GIT_PROVIDER}/${id}`;
    return get(URL);
}

export function updateGitProviderConfig(request: any, id: number) {
    const URL = `${Routes.GIT_PROVIDER}`;
    return put(URL, request);
}

export function saveGitProviderConfig(request: any, id: any) {
    const URL = `${Routes.GIT_PROVIDER}`;
    return post(URL, request);
}