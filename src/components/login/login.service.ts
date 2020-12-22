import { get, post } from '../../services/api';
import { FullRoutes } from '../../config';

export function getLoginList(): Promise<any> {
    const URL = `sso/list`;
    return get(URL)
}

export function loginAsAdmin(payload): Promise<any> {
    return post(FullRoutes.LOGIN, payload);
}