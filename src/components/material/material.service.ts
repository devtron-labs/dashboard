import { post, put, trash } from '@devtron-labs/devtron-fe-common-lib';
import { Routes } from '../../config';

export function createMaterial(request) {
    const URL = `${Routes.GIT_MATERIAL}`;
    return post(URL, request);
}

export function updateMaterial(request) {
    const URL = `${Routes.GIT_MATERIAL}`;
    return put(URL, request);
}

export function deleteMaterial(request): Promise<any> {
    return trash(`${Routes.GIT_MATERIAL}/delete`, request);
}
