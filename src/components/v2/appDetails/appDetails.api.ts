import { Routes } from '../../../config/constants';
import { get, post, trash } from '../../../services/api';
import { AppDetails } from '../../app/types';
import { AppType } from './appDetails.type';
import { getAppId } from '../appDetails/k8Resource/nodeDetail/nodeDetail.api';

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
            appId: getAppId(appDetails.clusterId, appDetails.namespace, appDetails.appName),
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
    const URL = `${Routes.APPLICATIONS}/${appDetails.appName}-${appDetails.environmentName}/resource?name=${nodeDetails.name}&namespace=${nodeDetails.namespace}&resourceName=${nodeDetails.name}&version=${nodeDetails.version}&group=${nodeDetails.group}&kind=${nodeDetails.kind}&force=true&appId=${appDetails.appId}&envId=${envId}`;
    return trash(URL);
};

export const getAppOtherEnvironment = (appId) => {
    const URL = `${Routes.APP_OTHER_ENVIRONMENT}?app-id=${appId}`;
    return get(URL);
};
