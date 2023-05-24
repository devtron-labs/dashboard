import { request } from 'http';
import { Routes } from '../../config';
import { get, post, put, trash, ResponseType } from '@devtron-labs/devtron-fe-common-lib';
import { Route } from 'react-router-dom';

export function getClusterList(): Promise<any> {
    const URL = `${Routes.CLUSTER}`;
    return get(URL);
}

export function getCluster(id: number) {
    const URL = `${Routes.CLUSTER}?id=${id}`;
    return get(URL);
}

export function saveClusters(payload) {
    const URL = `${Routes.SAVECLUSTER}`;
    return post(URL, payload);
}

export function validateCluster(payload) {
    const URL = `${Routes.VALIDATE}`
    return post(URL, payload);
}

export function saveCluster(request) {
    const URL = `${Routes.CLUSTER}`;
    return post(URL, request);
}

export function updateCluster(request) {
    const URL = `${Routes.CLUSTER}`;
    return put(URL, request);
}

export function retryClusterInstall(id: number, payload): Promise<ResponseType> {
    const URL = `${Routes.CHART_AVAILABLE}/cluster-component/install/${id}`;
    return post(URL, payload);
}

export const getEnvironment = (id: number): Promise<any> => {
    const URL = `${Routes.ENVIRONMENT}?id=${id}`;
    return get(URL)
}

export const saveEnvironment = (request, id: number): Promise<any> => {
    const URL = `${Routes.ENVIRONMENT}`;
    return post(URL, request);
}

export const updateEnvironment = (request, id: number): Promise<any> => {
    const URL = `${Routes.ENVIRONMENT}`;
    return put(URL, request);
}

export const getEnvironmentList = (): Promise<any> => {
    const URL = `${Routes.ENVIRONMENT}`;
    return get(URL).then(response => response);
};

export function deleteCluster(request): Promise<any> {
    return trash(Routes.CLUSTER, request);
}

export function deleteEnvironment(request): Promise<any>{
    return trash(Routes.ENVIRONMENT, request);
}