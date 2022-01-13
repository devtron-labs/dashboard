import { Routes } from '../../../config/constants';
import { get, post, trash } from '../../../services/api';
import { AppDetails } from '../../app/types';
import { AppType } from './appDetails.type';

export const getInstalledChartDetail = (_appId: number, _envId: number) => {
    return get(`app-store/installed-app/detail?installed-app-id=${_appId}&env-id=${_envId}`);
};

export const getInstalledAppDetail = (_appId: number, _envId: number) => {
    return get(`app/detail?app-id=${_appId}&env-id=${_envId}`);
};

export const deleteResource = (nodeDetails, appDetails, envId) => {
    if (!nodeDetails.group) nodeDetails.group = '';
    if (appDetails.appType === AppType.EXTERNAL_HELM_CHART) {
        let data = {
            appIdentifier: {
                clusterId: appDetails.clusterId,
                namespace: nodeDetails.namespace,
                releaseName: appDetails.appName,
            },
            k8sRequest: {
                resourceIdentifier: {
                    groupVersionKind: {
                        Group: nodeDetails.group,
                        Version: nodeDetails.version,
                        Kind: nodeDetails.kind,
                    },
                    namespace: nodeDetails.namespace,
                    name: nodeDetails.name,
                }
            },
        };
        const URL = Routes.DELETE_RESOURCE;
        return post(URL, data);
    }
    const URL = `${Routes.APPLICATIONS}/${appDetails.appName}-${appDetails.env}/resource?name=${nodeDetails.name}&namespace=${nodeDetails.namespace}&resourceName=${nodeDetails.name}&version=${nodeDetails.version}&group=${nodeDetails.group}&kind=${nodeDetails.kind}&force=true&appId=${appDetails.appId}&envId=${envId}`;
    return trash(URL);
};

export const getAppOtherEnvironment = (appId) => {
    const URL = `${Routes.APP_OTHER_ENVIRONMENT}?app-id=${appId}`;
    return get(URL);
};
