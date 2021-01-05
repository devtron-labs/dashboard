import { post, put, get } from '../../services/api';

export const getSSOList = () => {
    const URL = `/sso/1`;
    return get(URL);
}
export const createSSOList = (request) => {
    const URL = `sso/create`;
    return post(URL, request);
}
export const updateSSOList = (request) => {
    const URL = `sso/update`;
    return put(URL, request);
}