import { Routes } from '../../config';
import { get, post, put, trash } from '../../services/api';
import { ResponseType } from '../../services/service.types';

export function getClusterList(): Promise<any> {
    const URL = `${Routes.CLUSTER}`;
    return get(URL); 
    // return new Promise((resolve, reject) => {
    //     resolve(
    //         {
    //             "code": 200, "status": "OK",
    //             "result": [
    //                 { "id": 8, "cluster_name": "delhivery-fms-dev", "server_url": "https://api-fms-dev-k8s-local-6b60kb-1776569355.us-east-1.elb.amazonaws.com", "prometheus_url": "http://www.google.com", "active": true, "defaultClusterComponent": null, "agentInstallationStage": -1 },
    //                 { "id": 9, "cluster_name": "delhivery-fms-dev", "server_url": "https://api-fms-dev-k8s-local-6b60kb-1776569355.us-east-1.elb.amazonaws.com", "prometheus_url": "http://www.google.com", "active": true, "defaultClusterComponent": null, "agentInstallationStage": 0 },
    //                 { "id": 10, "cluster_name": "delhivery-fms-test", "server_url": "https://delhivery-fms-dev.devtron.info", "prometheus_url": "http://www.google.com", "active": true, "defaultClusterComponent": null, "agentInstallationStage": 1 },
    //                 { "id": 11, "cluster_name": "default_cluster", "server_url": "https://kubernetes.default.svc", "prometheus_url": "http://demo.devtron.info:32080/prometheus", "active": true, "defaultClusterComponent": null, "agentInstallationStage": 2 },
    //                 { "id": 16, "cluster_name": "uat", "server_url": "https://api.uat.devtron.info", "prometheus_url": "http://uat.devtron.info/prometheus", "active": true, "defaultClusterComponent": [{ "name": "aerospike", "appId": 142, "installedAppId": 52, "envId": 28, "envName": "uat-devtron", "status": "DEPLOY_SUCCESS" }], "agentInstallationStage": 3 }]
    //         }
    //     )
    // })
}

export function getCluster(id: number) {
    const URL = `${Routes.CLUSTER}?id=${id}`;
    return get(URL);
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
    const URL = `${Routes.CLUSTER}/delete`;
    return trash(URL, request);
}

export function deleteEnvironment(request): Promise<any>{
    const URL = `${Routes.ENVIRONMENT}/delete`;
    return post(URL, request); 
}