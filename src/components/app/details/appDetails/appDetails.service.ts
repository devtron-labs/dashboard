import { Routes } from '../../../../config'
import { get } from '@devtron-labs/devtron-fe-common-lib'
import { fetchWithFullRoute } from '../../../../services/fetchWithFullRoute'
import { DeploymentStatusDetailsResponse, ModuleConfigResponse } from './appDetails.type'

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

export function getDeploymentStatusDetail(
    appId: string,
    envId: string,
    triggerId?: string,
    isHelmApps?: boolean,
    installedAppVersionHistoryId?: number
): Promise<DeploymentStatusDetailsResponse> {
    let appendUrl
    if (isHelmApps) {
        appendUrl = Routes.HELM_DEPLOYMENT_STATUS_TIMELINE_INSTALLED_APP
    } else {
      appendUrl = Routes.DEPLOYMENT_STATUS
    }
      return get(`${appendUrl}/${appId}/${envId}${triggerId ? `?wfrId=${triggerId}` : ``}${installedAppVersionHistoryId ? `?installedAppVersionHistoryId=${installedAppVersionHistoryId}` : ''}`)
}

export function getModuleConfigured(moduleName: string): Promise<ModuleConfigResponse> {
    return get(`${Routes.MODULE_CONFIGURED}?name=${moduleName}`)
}
