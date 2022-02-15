import { get, post, put, trash } from '../../services/api';
import { Routes } from '../../config';
import { handleUTCTime, sortCallback } from '../common';
import { ChartValuesType, ChartGroup } from './charts.types';

interface RootObject {
    code: number;
    status: string;
    result?: any;
}
export function getChartVersionsMin(chartId: number | string) {
    return get(`app-store/discover/application/${chartId}/version/autocomplete`)
}

export function getChartVersionDetails(versionId) {
    return get(`app-store/discover/application/${versionId}`)
}

export function getChartVersionDetails2(versionId) {
    return get(`app-store/application/version/${versionId}`)
}

export function getInstalledAppDetail(installedAppId, envId) {
    return get(`app-store/installed-app/detail?installed-app-id=${installedAppId}&env-id=${envId}`)
}

export function installChart(request) {
    return post(`app-store/application/install`, request);
}

export function updateChart(request) {
    return put(`app-store/application/update`, request)
}

export function deleteInstalledChart(installedAppId, force?: boolean) {
    let URL
    if (force) {
        URL = `app-store/application/delete/${installedAppId}?force=${force}`
    }
    else {
        URL = `app-store/application/delete/${installedAppId}`
    }
    return trash(URL)
}

export function getChartValuesTemplateList(chartId: number | string): Promise<any> {
    const URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES_LIST_TEMPLATE}/${chartId}`;
    return get(URL);
}

export function getChartValuesCategorizedList(chartId: number | string, installedAppVersionId = null): Promise<any> {
    let URL;
    if (installedAppVersionId) {
        URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES_LIST_CATEGORIZED}/${chartId}?installedAppVersionId=${installedAppVersionId}`;
    }
    else {
        URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES_LIST_CATEGORIZED}/${chartId}`;
    }
    return get(URL);
}

export function getChartValuesCategorizedListParsed(chartId: number | string, installedAppVersionId = null): Promise<{ code: number, result: ChartValuesType[] }> {
    return getChartValuesCategorizedList(chartId, installedAppVersionId).then((response) => {
        let list = response.result.values || [];
        let savedCharts = list.find(chartList => chartList.kind === 'TEMPLATE');
        let deployedCharts = list.find(chartList => chartList.kind === 'DEPLOYED');
        let defaultCharts = list.find(chartList => chartList.kind === 'DEFAULT');
        let existingCharts = list.find(chartList => chartList.kind === 'EXISTING')
        let savedChartValues = savedCharts && savedCharts.values ? savedCharts.values : [];
        let deployedChartValues = deployedCharts && deployedCharts.values ? deployedCharts.values : [];
        let defaultChartValues = defaultCharts && defaultCharts.values ? defaultCharts.values : [];
        let existingChartValues = existingCharts && existingCharts.values ? existingCharts.values : [];

        savedChartValues = savedChartValues.map(chart => { return { ...chart, kind: 'TEMPLATE' } });
        savedChartValues.sort((a, b) => { return -1 * sortCallback('chartVersion', a, b) });

        deployedChartValues = deployedChartValues.map(chart => { return { ...chart, kind: 'DEPLOYED' } });
        deployedChartValues.sort((a, b) => { return -1 * sortCallback('chartVersion', a, b) });

        defaultChartValues = defaultChartValues.map(chart => { return { ...chart, kind: 'DEFAULT' } });
        defaultChartValues.sort((a, b) => { return -1 * sortCallback('chartVersion', a, b); });

        existingChartValues = existingChartValues.map(chart => { return { ...chart, kind: 'EXISTING' } });
        existingChartValues.sort((a, b) => { return -1 * sortCallback('chartVersion', a, b) });

        let chartValuesList = defaultChartValues.concat(deployedChartValues, savedChartValues, existingChartValues);
        return {
            ...response,
            result: chartValuesList,
        }
    })
}

export function getChartValues(versionId: number | string, kind: 'DEFAULT' | 'TEMPLATE' | 'DEPLOYED' | 'EXISTING'): Promise<any> {
    const URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES}?referenceId=${versionId}&kind=${kind}`;
    return get(URL);
}

interface ChartValuesCreate {
    appStoreVersionId: number;
    name: string;
    values: string;
}

export function createChartValues(request: ChartValuesCreate) {
    const URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES}`;
    return post(URL, request);
}

export function updateChartValues(request) {
    const URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES}`;
    return put(URL, request);
}

export function deleteChartValues(chartId: number): Promise<any> {
    const URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES}/${chartId}`;
    return trash(URL);
}

export function getInstalledCharts(queryString: string) {
    let url = `${Routes.CHART_INSTALLED}`
    if (queryString) {
        url = `${url}${queryString}`
    }
    return get(url).then(response => {
        return {
            ...response,
            result: Array.isArray(response.result) ? response.result.map((chart) => {
                return {
                    ...chart,
                    deployedAt: chart.deployedAt ? handleUTCTime(chart.deployedAt, true) : '',
                }
            }) : []
        }
    })
}

export function saveChartGroup(requestBody) {
    const URL = `${Routes.CHART_GROUP}/`;
    return post(URL, requestBody);
}

export function updateChartGroup(requestBody: ChartGroup) {
    const URL = `${Routes.CHART_GROUP}/`;
    return put(URL, requestBody);
}

export function getChartGroups(): Promise<{ code: number, result: { groups: ChartGroup[] } }> {
    const URL = `${Routes.CHART_GROUP_LIST}`;
    return get(URL).then((response) => {
        let groups = response?.result?.groups || [];
        groups.sort((a, b) => sortCallback("name", a, b));
        return {
            ...response,
            result: {
                groups: groups.map((grp) => {
                    return {
                        ...grp,
                        chartGroupEntries: grp.chartGroupEntries || []
                    }
                })
            }
        }
    })
}

export function getChartGroupDetail(chartGroupId: string | number) {
    return get(`${Routes.CHART_GROUP}/${chartGroupId}`)
}

export function updateChartGroupEntries(payload) {
    return put(`${Routes.CHART_GROUP}/entries`, payload)
}

export function getReadme(appStoreApplicationVersionId: number) {
    return get(`app-store/discover/application/readme/${appStoreApplicationVersionId}`)
}


export function getChartGroupInstallationDetails(chartGroupId: number | string) {
    return get(`${Routes.CHART_GROUP}/installation-detail/${chartGroupId}`);
}

export interface DeployableCharts {
    appName: string;
    environmentId: number;
    appStoreVersion: number;
    valuesOverrideYaml?: string;
    referenceValueId: number;
    referenceValueKind: 'DEFAULT' | 'TEMPLATE' | 'DEPLOYED' | 'EXISTING';
    chartGroupEntryId?: number;
}

export function deployChartGroup(projectId: number, charts: DeployableCharts[], chartGroupId?: number) {
    // chartGroupId empty when normal deployment
    return post(`app-store/group/install`, { projectId, chartGroupId, charts })
}



interface appName {
    name: string;
    exists?: boolean;
    suggestedName?: string;
}

interface AppNameValidated extends RootObject {
    result?: appName[]
}

export function validateAppNames(payload: appName[]): Promise<AppNameValidated> {
    return post(`app-store/application/exists`, payload)
}

export function getChartsByKeyword(input: string) {
    return get(`app-store/discover/search?chartName=${input}`);
}
