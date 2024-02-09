import { post, put, get } from '@devtron-labs/devtron-fe-common-lib';
import { Routes } from '../../config';

export function loginAsAdmin(payload): Promise<any> {
    return post(Routes.LOGIN, payload);
}
