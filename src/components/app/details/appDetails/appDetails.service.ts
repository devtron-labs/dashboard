import { Routes } from '../../../../config'
import { ResponseType, get, trash } from '@devtron-labs/devtron-fe-common-lib'
import { fetchWithFullRoute } from '../../../../services/fetchWithFullRoute'
import { ClusterConnectionResponse, DeploymentStatusDetailsResponse, ModuleConfigResponse } from './appDetails.type'
import { AppType } from '../../../v2/appDetails/appDetails.type'

export function isDatasourceConfigured(envName: string) {
    const root = process.env.REACT_APP_ORCHESTRATOR_ROOT.replace('/orchestrator', '')
    const URL = `${root}/grafana/api/datasources/id/Prometheus-${envName}`
    return fetchWithFullRoute(URL, 'GET')
}

export function isDatasourceHealthy(datasourceId: number | string) {
    let timestamp = new Date()
    const root = process.env.REACT_APP_ORCHESTRATOR_ROOT.replace('/orchestrator', '')
    const URL = `${root}/grafana/api/datasources/proxy/${datasourceId}/api/v1/query?query=1&time=${timestamp.getTime()}`
    return fetchWithFullRoute(URL, 'GET')
}

export function getClusterConnectionStatus(envId: number): Promise<ClusterConnectionResponse> {
    const URL = `${Routes.CLUSTER_ENV_MAPPING}/${envId}/connection`
    return get(URL)
}
export function deleteArgoCDAppWithNonCascade(appType:string, appId:number, envId: number, force?: boolean) : Promise<ResponseType> {
    let URL :string 
    if (appType === AppType.DEVTRON_APP) {
        URL = `${Routes.NONCASCADE_DELETE_DEVTRON_APP}/${appId}/${envId}/non-cascade`
    } else if (appType === AppType.DEVTRON_HELM_CHART) {
        URL = `${Routes.NONCASCADE_DELETE_HELM_APP}/${appId}/non-cascade`
    }
    if (force) {
        URL = `${URL}?force=${force}`
    }
    return trash(URL)
}

export function getDeploymentStatusDetail(
    appId: string,
    envId: string,
    showTimeline: boolean,
    triggerId?: string,
    isHelmApps?: boolean,
    installedAppVersionHistoryId?: number, 
): Promise<DeploymentStatusDetailsResponse> {
    let appendUrl
    if (isHelmApps) {
        appendUrl = Routes.HELM_DEPLOYMENT_STATUS_TIMELINE_INSTALLED_APP
    } else {
            appendUrl = Routes.DEPLOYMENT_STATUS
        }
      return get(`${appendUrl}/${appId}/${envId}${`?showTimeline=${showTimeline}`}${triggerId ? `&wfrId=${triggerId}` : ``}${installedAppVersionHistoryId ? `&installedAppVersionHistoryId=${installedAppVersionHistoryId}` : ''}`)
}

export function getModuleConfigured(moduleName: string): Promise<ModuleConfigResponse> {
    return get(`${Routes.MODULE_CONFIGURED}?name=${moduleName}`)
}
