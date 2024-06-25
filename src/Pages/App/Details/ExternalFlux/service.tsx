import { get } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../../../config'

export const getExternalFluxCDAppDetails = (clusterId, namespace, appName, isKustomization) => {
    const appId = `${clusterId}|${namespace}|${appName}|${isKustomization}`
    const url = `${Routes.FLUX_APPS}/app?appId=${appId}`
    return get(url)
}
