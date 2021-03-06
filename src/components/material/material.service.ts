import { post, put } from '../../services/api';
import { Routes } from '../../config';

export function createMaterial(request) {
    const URL = `${Routes.GIT_MATERIAL}`;
    return post(URL, request);
}

export function updateMaterial(request) {
    const URL = `${Routes.GIT_MATERIAL}`;
    return put(URL, request);
}