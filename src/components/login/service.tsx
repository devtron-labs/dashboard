import { post, put, get } from '../../services/api';


export const updateSSOList = (request) => {
    const URL = `sso/create`;
    return post(URL, request);
}