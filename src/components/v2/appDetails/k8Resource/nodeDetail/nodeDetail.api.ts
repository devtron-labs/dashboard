import { get } from "../../../../../services/api";
import { AppDetails } from "../../appDetails.type";


export const getManifestResource = (ad: AppDetails, nodeName: string) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0]
    //TODO: fix group
    return get(`api/${cn.version}/applications/${ad.appName}-${ad.environmentName}/resource?version=${cn.version}&namespace=${ad.namespace}&group=&kind=${cn.kind}&resourceName=${cn.name}`)
}

export const getEvent = (ad: AppDetails, nodeName: string) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0]
    return get(`api/${cn.version}/applications/${ad.appName}-${ad.environmentName}/events?resourceNamespace=${ad.namespace}&resourceUID=${cn.uid}&resourceName=${cn.name}`)
}

export const getLogsURLs = (ad, nodeName, Host) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0]
    let prefix = '';
    if (process.env.NODE_ENV === 'production') {
        prefix = `${location.protocol}//${location.host}`; // eslint-disable-line
    } else {
        prefix = `${location.protocol}//${location.host}`; // eslint-disable-line
    }
    return [`${prefix}${Host}/api/v1/applications/${ad.appName}-${ad.environmentName}/pods/${nodeName}/logs?container=${ad.appName}&follow=true&namespace=${ad.namespace}&tailLines=500`]
}