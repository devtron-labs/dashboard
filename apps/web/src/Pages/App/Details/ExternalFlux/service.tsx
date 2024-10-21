import { get, getUrlWithSearchParams } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../../../config'

export const getExternalFluxCDAppDetails = (clusterId, namespace, appName, isKustomization) => {
    const appId = `${clusterId}|${namespace}|${appName}|${isKustomization}`
    const baseurl = `${Routes.FLUX_APPS}/${Routes.APP}`
    const params = {
        appId,
    }
    const url = getUrlWithSearchParams(baseurl, params)
    return get(url)
}
