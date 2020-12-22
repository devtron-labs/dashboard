import { Routes } from '../../config';
import { post, put, get } from '../../services/api';

export const getGitProviderList = () => {
    const URL = `${Routes.GIT_PROVIDER}`;
    return get(URL);
}