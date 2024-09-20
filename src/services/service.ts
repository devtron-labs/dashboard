/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    get,
    post,
    ResponseType,
    APIOptions,
    sortCallback,
    TeamList,
    trash,
    LastExecutionResponseType,
    DATE_TIME_FORMAT_STRING,
    EnvironmentListHelmResponse,
    getSortedVulnerabilities,
    TemplateListDTO,
} from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'
import { ACCESS_TYPE_MAP, ModuleNameMap, Routes } from '../config'
import {
    CDPipelines,
    AppListMin,
    ProjectFilteredApps,
    AppOtherEnvironment,
    LastExecutionMinResponseType,
    ClusterEnvironmentDetailList,
    ClusterListResponse,
    LoginCountType,
    ConfigOverrideWorkflowDetailsResponse,
    AllWorkflows,
} from './service.types'
import { Chart } from '../components/charts/charts.types'
import { getModuleInfo } from '../components/v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../components/v2/devtronStackManager/DevtronStackManager.type'
import { LOGIN_COUNT } from '../components/onboardingGuide/onboarding.utils'
import { MinChartRefDTO } from './types'

export function getAppConfigStatus(appId: number, isJobView?: boolean): Promise<any> {
    return get(`${Routes.APP_CONFIG_STATUS}?app-id=${appId}${isJobView ? '&appType=2' : ''}`)
}

export const getSourceConfig = (id: string) => {
    const URL = `${Routes.SOURCE_CONFIG_GET}/${id}`
    return get(URL)
}

export function getCIConfig(appId: number) {
    const URL = `${Routes.CI_CONFIG_GET}/${appId}`
    return get(URL)
}

export function getConfigOverrideWorkflowDetails(appId: string): Promise<ConfigOverrideWorkflowDetailsResponse> {
    return get(`${Routes.CI_CONFIG_OVERRIDE_GET}/${appId}`)
}

export function getCDConfig(appId: number | string): Promise<CDPipelines> {
    const URL = `${Routes.CD_CONFIG}/${appId}`
    return get(URL).then((response) => response.result)
}

export const getGitProviderListAuth = (appId: string) => {
    const URL = `${Routes.APP}/${appId}/autocomplete/git`
    return get(URL)
}

export const getTeamList = (): Promise<TeamList> => {
    const URL = `${Routes.PROJECT_LIST}`
    return get(URL).then((response) => {
        return {
            code: response.code,
            status: response.status,
            result: response.result || [],
        }
    })
}

export function gitOpsConfigDevtron(payload): Promise<ResponseType> {
    return post(Routes.GITOPS_DEVTRON_APP, payload)
}

export function getGitOpsRepoConfig(appId: number): Promise<ResponseType> {
    const URL = `${Routes.GITOPS_DEVTRON_APP}/${appId}`
    return get(URL)
}

export const getUserTeams = (): Promise<any> => {
    const URL = `${Routes.TEAM_USER}`
    return get(URL)
}

export function getAppListMin(
    teamId = null,
    options?: APIOptions,
    appName?: string,
    isJobView?: boolean,
): Promise<AppListMin> {
    const queryString = new URLSearchParams()
    if (teamId) {
        queryString.set('teamId', teamId)
    }

    if (appName) {
        queryString.set('appName', appName)
    }

    if (isJobView) {
        queryString.set('appType', '2')
    }

    return get(`${Routes.APP_LIST_MIN}?${queryString.toString()}`, options).then((response) => {
        let list = response?.result || []
        list = list.sort((a, b) => {
            return sortCallback('name', a, b)
        })

        return {
            ...response,
            code: response.code,
            result: list,
        }
    })
}

export function getProjectFilteredApps(
    projectIds: number[] | string[],
    accessType?: string,
): Promise<ProjectFilteredApps> {
    const chartOnlyQueryParam = accessType === ACCESS_TYPE_MAP.HELM_APPS ? '&appType=DevtronChart' : ''
    return get(`app/min?teamIds=${projectIds.join(',')}${chartOnlyQueryParam}`)
}

export function getAvailableCharts(
    queryString?: string,
    pageOffset?: number,
    pageSize?: number,
    options?: APIOptions,
): Promise<{ code: number; result: Chart[] }> {
    let url = `${Routes.CHART_AVAILABLE}/discover/`

    if (pageOffset >= 0 && pageSize) {
        queryString = `${queryString || '?'}&offset=${pageOffset}&size=${pageSize}`
    }

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

export function getEnvironmentListMin(includeAllowedDeploymentTypes?: boolean): Promise<any> {
    const url = `${Routes.ENVIRONMENT_LIST_MIN}${includeAllowedDeploymentTypes ? '?showDeploymentOptions=true' : ''}`
    return get(url)
}

export function getAppFilters() {
    return get(`${Routes.APP_FILTER_LIST}?auth=false`)
}

/**
 * @deprecated Use getEnvironmentListMinPublic form common lib instead
 */
export function getEnvironmentListMinPublic(includeAllowedDeploymentTypes?: boolean) {
    return get(
        `${Routes.ENVIRONMENT_LIST_MIN}?auth=false${includeAllowedDeploymentTypes ? '&showDeploymentOptions=true' : ''}`,
    )
}

export function getDockerRegistryStatus(isStorageActionPush?: boolean): Promise<ResponseType> {
    const URL = `${Routes.DOCKER_REGISTRY_CONFIG}/configure/status${isStorageActionPush ? '?storageType=CHART&storageAction=PUSH' : ''}`
    return get(URL)
}

export function getDockerRegistryList(): Promise<ResponseType> {
    const URL = `${Routes.DOCKER_REGISTRY_CONFIG}`
    return get(URL)
}

export function getAppOtherEnvironmentMin(appId): Promise<AppOtherEnvironment> {
    const URL = `${Routes.APP_OTHER_ENVIRONMENT_MIN}?app-id=${appId}`
    return get(URL)
}

export function getJobOtherEnvironmentMin(appId): Promise<AppOtherEnvironment> {
    const URL = `${Routes.JOB_CONFIG_ENVIRONMENTS}/${appId}`
    return get(URL)
}

export function addJobEnvironment(data): Promise<ResponseType> {
    const URL = `${Routes.JOB_CONFIG_ENVIRONMENTS}`
    const payload = {
        envId: Number(data.envId),
        appId: Number(data.appId),
    }
    return post(URL, payload)
}

export function deleteJobEnvironment(data): Promise<ResponseType> {
    const URL = `${Routes.JOB_CONFIG_ENVIRONMENTS}`
    const payload = {
        envId: Number(data.envId),
        appId: Number(data.appId),
    }
    return trash(URL, payload)
}

export function getAppOtherEnvironment(appId): Promise<AppOtherEnvironment> {
    const URL = `${Routes.APP_OTHER_ENVIRONMENT}?app-id=${appId}`
    return get(URL)
}

export function getJobCIPipeline(jobId) {
    return get(`${Routes.JOB_CI_DETAIL}/${jobId}`)
}

export function getEnvironmentConfigs(appId, envId, option?) {
    return get(`${Routes.APP_CREATE_ENV_CONFIG_MAP}/${appId}/${envId}`, option)
}

export function getEnvironmentSecrets(appId, envId) {
    return get(`${Routes.APP_CREATE_ENV_SECRET}/${appId}/${envId}`)
}
export const getAllWorkflowsForAppNames = (appNames: string[], signal?: AbortSignal): Promise<AllWorkflows> => {
    return post(`${Routes.WORKFLOW}/all`, { appNames }, { signal })
}

export function getWorkflowList(appId, filteredEnvIds?: string) {
    let filteredEnvParams = ''
    if (filteredEnvIds) {
        filteredEnvParams = `?envIds=${filteredEnvIds}`
    }
    const URL = `${Routes.WORKFLOW}/${appId}${filteredEnvParams}`
    return get(URL)
}

export function getWorkflowViewList(appId, filteredEnvIds?: string) {
    let filteredEnvParams = ''
    if (filteredEnvIds) {
        filteredEnvParams = `?envIds=${filteredEnvIds}`
    }
    return get(`${Routes.WORKFLOW}/view/${appId}${filteredEnvParams}`)
}

export function stopStartApp(AppId, EnvironmentId, RequestType) {
    return post(`app/stop-start-app`, { AppId, EnvironmentId, RequestType })
}

export const validateToken = (): Promise<ResponseType<Record<'emailId' | 'isVerified' | 'isSuperAdmin', string>>> => {
    return get(`devtron/auth/verify/v2`, { preventAutoLogout: true })
}

function getLastExecution(queryString: number | string): Promise<ResponseType> {
    const URL = `security/scan/executionDetail?${queryString}`
    return get(URL)
}

function parseLastExecutionResponse(response): LastExecutionResponseType {
    const vulnerabilities = response.result.vulnerabilities || []
    const groupedVulnerabilities = getSortedVulnerabilities(vulnerabilities)
    return {
        ...response,
        result: {
            ...response.result,
            scanExecutionId: response.result.ScanExecutionId,
            lastExecution: response.result.executionTime,
            objectType: response.result.objectType,
            severityCount: {
                critical: response.result?.severityCount?.critical ?? 0,
                high: response.result?.severityCount?.high ?? 0,
                medium: response.result?.severityCount?.medium ?? 0,
                low: response.result?.severityCount?.low ?? 0,
                unknown: response.result?.severityCount?.unknown ?? 0,
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
            scanToolId: response.result.scanToolId,
        },
    }
}

export function getLastExecutionByImage(image: string): Promise<LastExecutionResponseType> {
    const queryString = `image=${image}`
    return getLastExecution(queryString).then((response) => {
        return parseLastExecutionResponse(response)
    })
}

export function getLastExecutionByArtifactId(
    appId: string | number,
    artifact: string | number,
): Promise<LastExecutionResponseType> {
    const queryString = `artifactId=${artifact}&appId=${appId}`
    return getLastExecution(queryString).then((response) => {
        return parseLastExecutionResponse(response)
    })
}

export function getLastExecutionByImageScanDeploy(
    imageScanDeployInfoId: string | number,
    appId: number | string,
    envId: number | string,
): Promise<LastExecutionResponseType> {
    const queryString = `imageScanDeployInfoId=${imageScanDeployInfoId}&appId=${appId}&envId=${envId}`
    return getLastExecution(queryString).then((response) => {
        return parseLastExecutionResponse(response)
    })
}

export function getLastExecutionMinByAppAndEnv(
    appId: number | string,
    envId: number | string,
): Promise<LastExecutionMinResponseType> {
    const URL = `security/scan/executionDetail/min?appId=${appId}&envId=${envId}`
    return get(URL).then((response) => {
        return {
            code: response.code,
            status: response.status,
            result: {
                lastExecution: moment(response.result.executionTime).utc(false).format(DATE_TIME_FORMAT_STRING),
                imageScanDeployInfoId: response.result.imageScanDeployInfoId,
                severityCount: {
                    critical: response.result.severityCount.critical,
                    high: response.result.severityCount.high,
                    medium: response.result.severityCount.medium,
                    low: response.result.severityCount.low,
                    unknown: response.result.severityCount.unknown,
                },
            },
        }
    })
}

export function getChartRepoList(): Promise<ResponseType> {
    const URL = `${Routes.CHART_REPO}/${Routes.CHART_LIST_SUBPATH}`
    return get(URL)
}

export function getChartRepoListMin(): Promise<ResponseType> {
    const URL = `${Routes.CHART_REPO}/${Routes.CHART_LIST_SUBPATH_MIN}`
    return get(URL)
}

export function getHostURLConfiguration(key: string = 'url'): Promise<ResponseType> {
    const URL = `${Routes.HOST_URL}?key=${key}`
    return get(URL)
}

export function isGitopsConfigured(): Promise<ResponseType> {
    const URL = `${Routes.GITOPS_CONFIGURED}`
    return get(URL)
}

export function isGitOpsModuleInstalledAndConfigured(): Promise<ResponseType> {
    return getModuleInfo(ModuleNameMap.ARGO_CD)
        .then((response) => {
            if (response.result?.status === ModuleStatus.INSTALLED) {
                return isGitopsConfigured()
            }
            return {
                code: 200,
                status: response.status,
                result: { isInstalled: false, isConfigured: false, noInstallationStatus: true },
            }
        })
        .then((response) => {
            if (response.result.noInstallationStatus) {
                delete response.result.noInstallationStatus
                return response
            }
            return {
                code: response.code,
                status: response.status,
                result: {
                    isInstalled: true,
                    isConfigured: response.result.exists,
                    allowCustomRepository: response.result.allowCustomRepository,
                    authMode: response.result.authMode,
                },
            }
        })
}

export function getChartReferences(appId: number, envId?: number): Promise<ResponseType<MinChartRefDTO>> {
    const baseURL = `${Routes.CHART_REFERENCES_MIN}/${appId}`
    return get(`${baseURL}${envId ? `/${envId}` : ''}`)
}

export function getChartReferencesForAppAndEnv(appId: number, envId?: number): Promise<ResponseType<MinChartRefDTO>> {
    let envParam = ''
    if (envId) {
        envParam = `/${envId}`
    }
    return get(`${Routes.CHART_REFERENCES_MIN}/${appId}${envParam}`)
}

export function getAppChartRefForAppAndEnv(appId: number, envId?: number): Promise<ResponseType> {
    return getChartReferencesForAppAndEnv(appId, envId).then((response) => {
        const {
            result: { chartRefs, latestEnvChartRef, latestAppChartRef },
        } = response
        const selectedChartId = latestEnvChartRef || latestAppChartRef
        const chart = chartRefs?.find((chart) => selectedChartId === chart.id)
        return {
            code: response.code,
            status: response.status,
            result: chart,
        }
    })
}

export function getAppCheckList(): Promise<any> {
    const URL = `${Routes.APP_CHECKLIST}`
    return get(URL)
}

export const getGitProviderList = () => {
    const URL = `${Routes.GIT_PROVIDER}`
    return get(URL)
}

export function getGitHostList(): Promise<any> {
    const URL = `${Routes.GIT_HOST}`
    return get(URL)
}

export const getGitProviderConfig = (id: number): Promise<any> => {
    const URL = `${Routes.GIT_PROVIDER}/${id}`
    return get(URL)
}

export const getGitHostConfig = (id: number): Promise<any> => {
    const URL = `${Routes.GIT_HOST}/${id}`
    return get(URL)
}

export function getWebhookEvents(gitHostId: string | number) {
    const URL = `git/host/${gitHostId}/event`
    return get(URL)
}

export function getWebhookDataMetaConfig(gitProviderId: string | number) {
    const URL = `git/host/webhook-meta-config/${gitProviderId}`
    return get(URL)
}

export function getEnvironmentListHelmApps(): Promise<EnvironmentListHelmResponse> {
    return get(Routes.ENVIRONMENT_LIST_MIN_HELM_PROJECTS)
}

export function getClusterNamespaceMapping(): Promise<ClusterEnvironmentDetailList> {
    const url = `${Routes.CLUSTER_ENV_MAPPING}`
    return get(url)
}

export function getClusterListMinWithoutAuth(): Promise<ClusterListResponse> {
    const URL = `${Routes.CLUSTER}/autocomplete?auth=false`
    return get(URL)
}

export function dashboardAccessed() {
    return get(Routes.DASHBOARD_ACCESSED)
}

export function dashboardLoggedIn() {
    return get(Routes.DASHBOARD_LOGGEDIN)
}

export function getLoginData(): Promise<LoginCountType> {
    return get(`${Routes.ATTRIBUTES_USER}/${Routes.GET}?key=${LOGIN_COUNT}`)
}

export function updateLoginCount(payload): Promise<LoginCountType> {
    return post(`${Routes.ATTRIBUTES_USER}/${Routes.UPDATE}`, payload)
}

export function updatePostHogEvent(payload): Promise<ResponseType> {
    return post(Routes.TELEMETRY_EVENT, payload)
}

export const validateContainerConfiguration = (request: any): Promise<any> => {
    const URL = `${Routes.DOCKER_REGISTRY_CONFIG}/validate`
    return post(URL, request)
}

export function getTemplateOptions(appId: number, envId: number): Promise<ResponseType<TemplateListDTO[]>> {
    return get(`${Routes.DEPLOYMENT_OPTIONS}?appId=${appId}&envId=${envId}`)
}
