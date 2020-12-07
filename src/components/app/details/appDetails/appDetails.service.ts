import { fetchAPI } from '../../../../services/hostGrafana';

export function isDatasourceConfigured(envName: string) {
    const root = process.env.REACT_APP_ORCHESTRATOR_ROOT.replace('/orchestrator', '');
    const URL = `${root}/grafana/api/datasources/id/Prometheus-${envName}`;
    return fetchAPI(URL, 'GET');
}

export function isDatasourceHealthy(datasourceId: number | string) {
    let timestamp = new Date();
    const root = process.env.REACT_APP_ORCHESTRATOR_ROOT.replace('/orchestrator', '');    
    const URL = `${root}/grafana/api/datasources/proxy/${datasourceId}/api/v1/query?query=1&time=${timestamp.getTime()}`;
    return fetchAPI(URL, 'GET');
}