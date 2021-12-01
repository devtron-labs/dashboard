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

export const getLogs = (ad, nodeName) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0]
    // pods.map(pod => `${prefix}${Host}/api/v1/applications/${appDetails.appName}-${appDetails.environmentName}/pods/${pod}/logs?container=${containerName}&follow=true&namespace=${appDetails.namespace}&tailLines=500`);
    return get(`api/${cn.version}/applications/${ad.appName}-${ad.environmentName}/pods/kartik-29nov-1-demo1-dcd-6b7c5448f6-8nkfk/logs?container=kartik-29nov-1&follow=true&namespace=${ad.namespace}&tailLines=500`)
}