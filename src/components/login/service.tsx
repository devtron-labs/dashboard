import { get, post } from '../../services/api';

export function  getLoginList():Promise<any> {
    const URL = `sso/list`;
    return get(URL)
}