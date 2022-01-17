import { Routes } from '../../../../../config';
import { get, post, put } from '../../../../../services/api';
import { AppDetails, AppType } from '../../appDetails.type';

const getAppId = (clusterId: number, namespace: string, appName: string) => {
    return `${clusterId}|${namespace}|${appName}`;
};

export const getManifestResource = (ad: AppDetails, podName: string, nodeType: string) => {
    if (ad.appType === AppType.EXTERNAL_HELM_CHART) {
        return getManifestResourceHelmApps(ad, podName, nodeType);
    }
    const cn = ad.resourceTree.nodes.filter((node) => node.name === podName && node.kind.toLowerCase() === nodeType)[0];

    return get(
        `api/v1/applications/${ad.appName}-${ad.environmentName}/resource?version=${cn.version}&namespace=${
            ad.namespace
        }&group=${cn.group || ''}&kind=${cn.kind}&resourceName=${cn.name}`,
    );
};

export const getDesiredManifestResource = (appDetails: AppDetails, podName: string, nodeType: string) => {
    const selectedResource = appDetails.resourceTree.nodes.filter(
        (data) => data.name === podName && data.kind.toLowerCase() === nodeType,
    )[0];
    const requestData = {
        appId: getAppId(appDetails.clusterId, selectedResource.namespace, appDetails.appName),
        resource: {
            Group: selectedResource.group ? selectedResource.group : '',
            Version: selectedResource.version ? selectedResource.version : 'v1',
            Kind: selectedResource.kind,
            namespace: selectedResource.namespace,
            name: selectedResource.name,
        },
    };
    return post(Routes.DESIRED_MANIFEST, requestData);
};

export const getEvent = (ad: AppDetails, nodeName: string, nodeType: string) => {
    if (ad.appType === AppType.EXTERNAL_HELM_CHART) {
        return getEventHelmApps(ad, nodeName, nodeType);
    }
    const cn = ad.resourceTree.nodes.filter(
        (node) => node.name === nodeName && node.kind.toLowerCase() === nodeType,
    )[0];
    return get(
        `api/${cn.version}/applications/${ad.appName}-${ad.environmentName}/events?resourceNamespace=${ad.namespace}&resourceUID=${cn.uid}&resourceName=${cn.name}`,
    );
};

function createBody(appDetails: AppDetails, nodeName: string, nodeType: string, updatedManifest?: string) {
    const selectedResource = appDetails.resourceTree.nodes.filter(
        (data) => data.name === nodeName && data.kind.toLowerCase() === nodeType,
    )[0];
    let requestBody = {
        appId: getAppId(appDetails.clusterId, selectedResource.namespace, appDetails.appName),
        k8sRequest: {
            resourceIdentifier: {
                groupVersionKind: {
                    Group: selectedResource.group ? selectedResource.group : '',
                    Version: selectedResource.version ? selectedResource.version : 'v1',
                    Kind: selectedResource.kind,
                },
                namespace: selectedResource.namespace,
                name: selectedResource.name,
            },
            // podLogsRequest: {
            //     containerName: 'envoy',
            // },
        },
    };
    if (updatedManifest) {
        requestBody.k8sRequest['patch'] = updatedManifest;
    }
    return requestBody;
}

function getManifestResourceHelmApps(ad: AppDetails, nodeName: string, nodeType: string) {
    const requestData = createBody(ad, nodeName, nodeType);
    return post(Routes.MANIFEST, requestData);
}

export const updateManifestResourceHelmApps = (
    ad: AppDetails,
    nodeName: string,
    nodeType: string,
    updatedManifest: string,
) => {
    const requestData = createBody(ad, nodeName, nodeType, updatedManifest);
    return put(Routes.MANIFEST, requestData);
};

function getEventHelmApps(ad: AppDetails, nodeName: string, nodeType: string) {
    const requestData = createBody(ad, nodeName, nodeType);
    return post(Routes.EVENTS, requestData);
}

export const getLogsURL = (ad, nodeName, Host, container) => {
    //const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0];
    let prefix = '';
    if (process.env.NODE_ENV === 'production') {
        prefix = `${location.protocol}//${location.host}`; // eslint-disable-line
    } else {
        prefix = `${location.protocol}//${location.host}`; // eslint-disable-line
    }
    if (ad.appType === AppType.EXTERNAL_HELM_CHART) {
        return `${prefix}${Host}/${Routes.LOGS}/${nodeName}?containerName=${container}&appId=${getAppId(
            ad.clusterId,
            ad.namespace,
            ad.appName
        )}&follow=true&tailLines=500`;
    }
    return `${prefix}${Host}/api/v1/applications/${ad.appName}-${ad.environmentName}/pods/${nodeName}/logs?container=${container}&follow=true&namespace=${ad.namespace}&tailLines=500`;
};

export const getTerminalData = (ad: AppDetails, nodeName: string, terminalType: string) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0];
    const _url = `api/${cn.version}/applications/pod/exec/session/${ad.appId}/${ad.environmentId}/${ad.namespace}/${ad.appName}-${ad.environmentName}/${terminalType}/${ad.appName}`;

    console.log('getTerminalData', _url);
    return get(_url);
};

export const createResource = (ad: AppDetails, podName: string, nodeType: string) => {
    const requestData = createBody(ad, podName, nodeType);
    return post(Routes.CREATE_RESOURCE, requestData);
};
