import { Routes } from '../../../../config';
import { get, trash } from '../../../../services/api';

export const getGitProviderMin = () => {
    const URL = `${Routes.GIT_PROVIDER_MIN}`;
    return get(URL)
}

export const getGitProviderMinAuth = (appId) => {
    const URL = `${Routes.APP}/${appId}/autocomplete/git`;
    return get(URL)
}

export function deleteApp(appId: string) {
    const URL = `${Routes.APP}/${appId}`;
    return trash(URL);
}   
