import { Routes } from '../../config';
import { get, post } from '../../services/api';

export function saveCIConfig(request) {
    const URL = `${Routes.CI_CONFIG_GET}`;
    return post(URL, request)
}

export function updateCIConfig(request) {
    let URL = `${Routes.CI_CONFIG_UPDATE}`;
    return post(URL, request);
}

export function getDockerRegistryMinAuth(appId) {
    const URL = `${Routes.APP}/${appId}/autocomplete/docker`;
    return get(URL)
}


