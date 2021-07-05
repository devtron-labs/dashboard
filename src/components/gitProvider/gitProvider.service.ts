import { Routes } from '../../config';
import { post, put, get } from '../../services/api';

export function getGitProviderConfig(id: number): Promise<any> {
    const URL = `${Routes.GIT_PROVIDER}/${id}`;
    return get(URL);
}

export function updateGitProviderConfig(request: any, id: number) {
    const URL = `${Routes.GIT_PROVIDER}`;
    return put(URL, request);
}

export function saveGitProviderConfig(payload: any, id: any) {
    const URL = `${Routes.GIT_PROVIDER}`;
    return post(URL, payload);
}

export function getGitHostList(): Promise<any> {
    const URL = `${Routes.GIT_HOST}`;
    // return get(URL);
    return new Promise((resolve, reject) => {
        resolve({
            result: [
                { "id": 1, "name": "Github", "active": true, "webhookUrl": "", "webhookSecret": "" },
                { "id": 2, "name": "Bitbucket Cloud", "active": true, "webhookUrl": "", "webhookSecret": "" }
            ]
        })
    })
}

export function getGitHost(id: number | string): Promise<any> {
    const URL = `${Routes.GIT_HOST}/${id}`;
    return get(URL);
}

export function saveGitHost(payload): Promise<any> {
    const URL = `${Routes.GIT_HOST}`;
    // return post(URL, payload);
    return new Promise((resolve, reject) => {
        resolve({
            result: {
                "id": 3,
                "name": "Github",
                "active": true,
                "webhookUrl": "",
                "webhookSecret": ""
            }
        })
    })
}