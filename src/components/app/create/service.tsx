import {  post } from '@devtron-labs/devtron-fe-common-lib';
import { Routes } from '../../../config';

export function createApp(request) {
    const URL = `${Routes.APP}`;
    return post(URL, request);
}
