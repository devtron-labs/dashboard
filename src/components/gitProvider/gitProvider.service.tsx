import { Routes } from '../../config';
import { post, put, get, trash } from '../../services/api';

export const getGitProviderConfig = (id: number): Promise<any> => {
    const URL = `${Routes.GIT_PROVIDER}/${id}`;
    return get(URL);
};

export const updateGitProviderConfig = (request: any, id: number) => {
    const URL = `${Routes.GIT_PROVIDER}`;
    return put(URL, request);
};

export const saveGitProviderConfig = (request: any, id: any) => {
    const URL = `${Routes.GIT_PROVIDER}`;
    return post(URL, request);
};

export function getGitHost(id: number | string): Promise<any> {
    const URL = `${Routes.GIT_HOST}/${id}`;
    return get(URL);
}

export function saveGitHost(payload): Promise<any> {
    const URL = `${Routes.GIT_HOST}`;
    return post(URL, payload);
}

export function deleteGitProvider(request): Promise<any> {
    return trash(`${Routes.GIT_PROVIDER}`, request);
}
