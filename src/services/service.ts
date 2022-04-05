import { get, post } from './api';
import { ACCESS_TYPE_MAP, Routes } from '../config';
import { sortCallback } from '../components/common/helpers/util';
import moment from 'moment';
import { ResponseType, CDPipelines, TeamList, AppListMin, ProjectFilteredApps, AppOtherEnvironment, LastExecutionResponseType, LastExecutionMinResponseType, APIOptions, ClusterEnvironmentDetailList, EnvironmentListHelmResponse, ClusterListResponse } from './service.types';
import { Chart } from '../components/charts/charts.types';
import { fetchWithFullRoute } from './fetchWithFullRoute';


export function getAppConfigStatus(appId: number): Promise<any> {
    const URL = `${Routes.APP_CONFIG_STATUS}?app-id=${appId}`;
    return get(URL);
}

export const getSourceConfig = (id: string) => {
    const URL = `${Routes.SOURCE_CONFIG_GET}/${id}`;
    return get(URL);
};

export function getCIConfig(appId: number) {
    const URL = `${Routes.CI_CONFIG_GET}/${appId}`;
    return get(URL);
}

export function getCDConfig(appId: number | string): Promise<CDPipelines> {
    const URL = `${Routes.CD_CONFIG}/${appId}`;
    return get(URL).then(response => response.result);
};

export const getGitProviderListAuth = (appId: string) => {
    const URL = `${Routes.APP}/${appId}/autocomplete/git`;
    return get(URL);
};

export const getTeamList = (): Promise<TeamList> => {
    const URL = `${Routes.PROJECT_LIST}`;
    return get(URL).then(response => {
        return {
            code: response.code,
            result: response.result || [],
        };
    });
};

export const getTeamListMin = (): Promise<TeamList> => {
    // ignore active field
    const URL = `${Routes.PROJECT_LIST_MIN}`;
    return get(URL).then(response => {
        let list = [];
        if (response && response.result && Array.isArray(response.result)) {
            list = response.result;
        }
        list = list.sort((a, b) => {
            return sortCallback('name', a, b);
        });
        return {
            code: response.code,
            result: list,
        };
    });
};

export const getUserTeams = (): Promise<any> => {
    const URL = `${Routes.TEAM_USER}`;
    return get(URL);
}

export function getAppListMin(teamId = null, options?): Promise<AppListMin> {
    let URL = `${Routes.APP_LIST_MIN}`;
    if (teamId) URL = `${URL}?teamId=${teamId}`
    return get(URL, options).then(response => {
        let list = response?.result || []
        list = list.sort((a, b) => {
            return sortCallback('name', a, b);
        });

        return {
            ...response,
            code: response.code,
            result: list,
        };
    });
}

export function getProjectFilteredApps(
    projectIds: number[] | string[],
    accessType?: string,
): Promise<ProjectFilteredApps> {
    const chartOnlyQueryParam = accessType === ACCESS_TYPE_MAP.HELM_APPS ? '&appType=DevtronChart' : '';
    return get(`app/min?teamIds=${projectIds.join(',')}${chartOnlyQueryParam}`);
}

export function getAvailableCharts(queryString?: string, options?: APIOptions): Promise<{ code: number, result: Chart[] }> {
    let url = `${Routes.CHART_AVAILABLE}/discover`;
    if (queryString) {
        url = `${url}${queryString}`
    }
    return get(url, options).then((response) => {
        return {
            ...response,
            result: response.result || [],
        }
    })
}

export function getEnvironmentListMin(isNamespaceReq = false): Promise<any> {
    let url = `${Routes.ENVIRONMENT_LIST_MIN}`;
    if (isNamespaceReq) {
        url = `${url}`;
    }
    return get(url);
}

export function getEnvironmentListMinPublic() {
    return get(`${Routes.ENVIRONMENT_LIST_MIN}?auth=false`);
}

export function getClusterListMin() {
    const URL = `${Routes.CLUSTER}/autocomplete`;
    return get(URL);
}

export function getDockerRegistryStatus(): Promise<ResponseType> {
    const URL = `${Routes.DOCKER_REGISTRY_CONFIG}/configure/status`;
    return get(URL);
}

export function getDockerRegistryList(): Promise<ResponseType> {
    const URL = `${Routes.DOCKER_REGISTRY_CONFIG}`;
    return get(URL);
}

export function getAppOtherEnvironment(appId): Promise<AppOtherEnvironment> {
    const URL = `${Routes.APP_OTHER_ENVIRONMENT}?app-id=${appId}`;
    return get(URL);
}

export function getEnvironmentConfigs(appId, envId) {
    return get(`${Routes.APP_CREATE_ENV_CONFIG_MAP}/${appId}/${envId}`);
}

export function getEnvironmentSecrets(appId, envId) {
    return get(`${Routes.APP_CREATE_ENV_SECRET}/${appId}/${envId}`);
}
//TODO:move to configmap and secret component
export function getConfigMapList(appId: string) {
    return get(`${Routes.APP_CREATE_CONFIG_MAP}/${appId}`);
}

export function getSecretList(appId: string) {
    return get(`${Routes.APP_CREATE_SECRET}/${appId}`);
}

export function getWorkflowList(appId) {
    const URL = `${Routes.WORKFLOW}/${appId}`;
    return get(URL);
}

export function stopStartApp(AppId, EnvironmentId, RequestType) {
    return post(`app/stop-start-app`, { AppId, EnvironmentId, RequestType });
}

export function validateToken() {
    return get(`devtron/auth/verify`, { preventAutoLogout: true });
}

function getLastExecution(queryString: number | string): Promise<ResponseType> {
    const URL = `security/scan/executionDetail?${queryString}`;
    return get(URL);
}

function parseLastExecutionResponse(response): LastExecutionResponseType {
    let vulnerabilities = response.result.vulnerabilities || [];
    let critical = vulnerabilities.filter((v) => v.severity === "critical").sort((a, b) => sortCallback('cveName', a, b));
    let moderate = vulnerabilities.filter((v) => v.severity === "moderate").sort((a, b) => sortCallback('cveName', a, b));
    let low = vulnerabilities.filter((v) => v.severity === "low").sort((a, b) => sortCallback('cveName', a, b));
    let groupedVulnerabilities = critical.concat(moderate, low);
    return {
        ...response,
        result: {
            ...response.result,
            scanExecutionId: response.result.ScanExecutionId,
            lastExecution: moment(response.result.executionTime).utc(false).format("ddd DD MMM YYYY HH:mm:ss"),
            objectType: response.result.objectType,
            severityCount: {
                critical: response.result?.severityCount?.high,
                moderate: response.result?.severityCount?.moderate,
                low: response.result?.severityCount?.low,
            },
            vulnerabilities: groupedVulnerabilities.map((cve) => {
                return {
                    name: cve.cveName,
                    severity: cve.severity,
                    package: cve.package,
                    version: cve.currentVersion,
                    fixedVersion: cve.fixedVersion,
                    policy: cve.permission,
                }
            }),
        }
    }
}

export function getLastExecutionById(scanExecutionId: number | string): Promise<LastExecutionResponseType> {
    const queryString = `executionId=${scanExecutionId}`;
    return getLastExecution(queryString).then((response) => {
        return parseLastExecutionResponse(response);
    })
}

export function getLastExecutionByAppAndEnv(appId: number | string, envId: number | string): Promise<LastExecutionResponseType> {
    const queryString = `envId=${envId}&appId=${appId}`;
    return getLastExecution(queryString).then((response) => {
        return parseLastExecutionResponse(response);
    })
}

export function getLastExecutionByImage(image: string): Promise<LastExecutionResponseType> {
    const queryString = `image=${image}`;
    return getLastExecution(queryString).then((response) => {
        return parseLastExecutionResponse(response);
    })
}

export function getLastExecutionByArtifactId(appId: string | number, artifact: string | number): Promise<LastExecutionResponseType> {
    const queryString = `artifactId=${artifact}&appId=${appId}`;
    return getLastExecution(queryString).then((response) => {
        return parseLastExecutionResponse(response);
    })
}

export function getLastExecutionByArtifactAppEnv(artifact: string | number, appId: number | string, envId: number | string): Promise<LastExecutionResponseType> {
    const queryString = `artifactId=${artifact}&appId=${appId}&envId=${envId}`;
    return getLastExecution(queryString).then((response) => {
        return parseLastExecutionResponse(response);
    })
}

export function getLastExecutionByImageScanDeploy(imageScanDeployInfoId: string | number, appId: number | string, envId: number | string): Promise<LastExecutionResponseType> {
    const queryString = `imageScanDeployInfoId=${imageScanDeployInfoId}&appId=${appId}&envId=${envId}`;
    return getLastExecution(queryString).then((response) => {
        return parseLastExecutionResponse(response);
    })
}

export function getLastExecutionMinByAppAndEnv(appId: number | string, envId: number | string): Promise<LastExecutionMinResponseType> {
    const URL = `security/scan/executionDetail/min?appId=${appId}&envId=${envId}`;
    return get(URL).then((response) => {
        return {
            code: response.code,
            status: response.status,
            result: {
                lastExecution: moment(response.result.executionTime).utc(false).format("ddd DD MMM YYYY HH:mm:ss"),
                imageScanDeployInfoId: response.result.imageScanDeployInfoId,
                severityCount: {
                    critical: response.result.severityCount.high,
                    moderate: response.result.severityCount.moderate,
                    low: response.result.severityCount.low,
                },
            }
        }
    })
}

export function getChartRepoList(): Promise<ResponseType> {
    const URL = `${Routes.CHART_REPO}/${Routes.CHART_LIST_SUBPATH}`;
    return get(URL);
}

export function getHostURLConfiguration(): Promise<ResponseType> {
    const URL = `${Routes.HOST_URL}?key=url`;
    return get(URL);
}

export function isGitopsConfigured(): Promise<ResponseType> {
    const URL = `${Routes.GITOPS_CONFIGURED}`;
    return get(URL);
}

export function getChartReferences(appId: number): Promise<ResponseType> {
    const URL = `${Routes.CHART_REFERENCES_MIN}/${appId}`;
    return get(URL);
}

export function getAppChartRef(appId: number): Promise<ResponseType> {
    return getChartReferences(appId).then((response) => {
        const { result: { chartRefs, latestAppChartRef } } = response;
        let selectedChartId = latestAppChartRef;
        let chart = chartRefs.find(chart => selectedChartId === chart.id);
        return {
            code: response.code,
            status: response.status,
            result: chart
        }
    })
}

export function getChartReferencesForAppAndEnv(appId: number, envId: number): Promise<ResponseType> {
    const URL = `${Routes.CHART_REFERENCES_MIN}/${appId}/${envId}`;
    return get(URL);
}

export function getAppChartRefForAppAndEnv(appId: number, envId: number): Promise<ResponseType> {
    return getChartReferencesForAppAndEnv(appId, envId).then((response) => {
        const { result: { chartRefs, latestEnvChartRef, latestAppChartRef } } = response;
        let selectedChartId = latestEnvChartRef || latestAppChartRef;
        let chart = chartRefs?.find(chart => selectedChartId === chart.id);
        return {
            code: response.code,
            status: response.status,
            result: chart
        }
    })
}

export function getAppCheckList(): Promise<any> {
    const URL = `${Routes.APP_CHECKLIST}`;
    return get(URL);
}

export const getGitProviderList = () => {
    const URL = `${Routes.GIT_PROVIDER}`;
    return get(URL);
}

export function getGitHostList(): Promise<any> {
    const URL = `${Routes.GIT_HOST}`;
    return get(URL);
}

export const getGitProviderConfig = (id: number): Promise<any> => {
    const URL = `${Routes.GIT_PROVIDER}/${id}`;
    return get(URL);
}

export const getGitHostConfig = (id: number): Promise<any> => {
    const URL = `${Routes.GIT_HOST}/${id}`;
    return get(URL);
}

export function getWebhookEvents(gitHostId: string | number) {
    const URL = `git/host/${gitHostId}/event`;
    return get(URL);
}

export function getWebhookEventsForEventId(eventId: string | number) {
    const URL = `git/host/event/${eventId}`;
    return get(URL);
}

export function getWebhookDataMetaConfig(gitProviderId: string | number) {
    const URL = `git/host/webhook-meta-config/${gitProviderId}`;
    return get(URL);
}

export function getEnvironmentListHelmApps(): Promise<EnvironmentListHelmResponse> {
    return get(Routes.ENVIRONMENT_LIST_MIN_HELM_PROJECTS);
}

export function getClusterNamespaceMapping(): Promise<ClusterEnvironmentDetailList> {
    let url = `${Routes.CLUSTER_ENV_MAPPING}`;
    return get(url);
}

export function getVersionConfig() {
    const URL = `${Routes.APP_VERSION}`;
    return get(URL);
}

export function getClusterListMinWithoutAuth() : Promise<ClusterListResponse> {
    const URL = `${Routes.CLUSTER}/autocomplete?auth=false`;
    return get(URL);
}

export function getNamespaceListMin(clusterIdsCsv : string) : Promise<EnvironmentListHelmResponse> {
    const URL = `${Routes.NAMESPACE}/autocomplete?ids=${clusterIdsCsv}`;
    return get(URL);
}

export function dashboardAccessed() {
  const URL = `${Routes.DASHBOARD_ACCESSED}`;
  return get(URL);
}

export function dashboardLoggedIn() {
  const URL = `${Routes.DASHBOARD_LOGGEDIN}`;
  return get(URL);
}