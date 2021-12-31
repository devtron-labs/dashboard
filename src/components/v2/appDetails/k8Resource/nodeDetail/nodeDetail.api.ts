import { get } from "../../../../../services/api";
import AppDetail from "../../../../app/details/appDetails/AppDetails";
import { AppDetails } from "../../appDetails.type";
import IndexStore from "../../index.store";


export const getManifestResource = (ad: AppDetails, nodeName: string) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0]
    const ed = IndexStore.getiNodesByKind(cn?.kind)[0]

    let group ;
    if (!group){ 
        group = '';
    }else{
        group = cn.group
    }
    return get(`api/v1/applications/${ad.appName}-${ad.environmentName}/resource?version=${cn.version}&namespace=${ad.namespace}&group=${cn.group || ''}&kind=${cn.kind}&resourceName=${cn.name}`)
}

export const getEvent = (ad: AppDetails, nodeName: string) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0]
    return get(`api/${cn.version}/applications/${ad.appName}-${ad.environmentName}/events?resourceNamespace=${ad.namespace}&resourceUID=${cn.uid}&resourceName=${cn.name}`)
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
