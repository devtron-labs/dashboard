import { URLS } from '../../../../config';
import { get } from '../../../../services/api';
import { fetchWithFullRoute } from '../../../../services/fetchWithFullRoute';
import { DeploymentStatusDetailsResponse } from './appDetails.type';

export function isDatasourceConfigured(envName: string) {
    const root = process.env.REACT_APP_ORCHESTRATOR_ROOT.replace('/orchestrator', '');
    const URL = `${root}/grafana/api/datasources/id/Prometheus-${envName}`;
    return fetchWithFullRoute(URL, 'GET');
}

export function isDatasourceHealthy(datasourceId: number | string) {
    let timestamp = new Date();
    const root = process.env.REACT_APP_ORCHESTRATOR_ROOT.replace('/orchestrator', '');
    const URL = `${root}/grafana/api/datasources/proxy/${datasourceId}/api/v1/query?query=1&time=${timestamp.getTime()}`;
    return fetchWithFullRoute(URL, 'GET');
}

export function getDeploymentStatusDetail(appId: string, envId: string, triggerId?: string): Promise<DeploymentStatusDetailsResponse> {
  return get(`${URLS.DEPLOYMENT_STATUS}/${appId}/${envId}${triggerId ? '?wfrId=' + triggerId : ''}`)
}