import {  post } from '../../../services/api';
import { Routes } from '../../../config';

export function createApp(request) {
    const URL = `${Routes.APP}`;
    return post(URL, request);
}
