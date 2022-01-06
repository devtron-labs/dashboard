import { get } from "../../../../../services/api";
import { AppDetails } from "../../appDetails.type";


export const getManifestResource = (ad: AppDetails, podName: string, nodeType: string) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === podName && node.kind.toLowerCase() === nodeType)[0]

    return get(`api/v1/applications/${ad.appName}-${ad.environmentName}/resource?version=${cn.version}&namespace=${ad.namespace}&group=${cn.group || ''}&kind=${cn.kind}&resourceName=${cn.name}`)
}

export const getEvent = (ad: AppDetails, nodeName: string, nodeType: string) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName && node.kind.toLowerCase() === nodeType)[0]
    return get(`api/${cn?.version}/applications/${ad.appName}-${ad.environmentName}/events?resourceNamespace=${ad.namespace}&resourceUID=${cn?.uid}&resourceName=${cn?.name}`)
}

export const getLogsURL = (ad, nodeName, Host, container) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0]
    let prefix = '';
    if (process.env.NODE_ENV === 'production') {
        prefix = `${location.protocol}//${location.host}`; // eslint-disable-line
    } else {
        prefix = `${location.protocol}//${location.host}`; // eslint-disable-line
    }
    return `${prefix}${Host}/api/v1/applications/${ad.appName}-${ad.environmentName}/pods/${nodeName}/logs?container=${container}&follow=true&namespace=${ad.namespace}&tailLines=500`
}

export const getTerminalData = (ad: AppDetails, nodeName: string, terminalType: string) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0]
    const _url = `api/${cn.version}/applications/pod/exec/session/${ad.appId}/${ad.environmentId}/${ad.namespace}/${ad.appName}-${ad.environmentName}/${terminalType}/${ad.appName}`
    
    console.log("getTerminalData", _url)
    return get(_url)
}
