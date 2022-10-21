import React, { useState, useEffect, useContext } from 'react'
import { ChartGroupExports, ChartGroupState, ChartGroupEntry } from './charts.types'
import {
    getChartVersionsMin,
    validateAppNames,
    getChartValuesCategorizedList,
    getChartValues,
    getChartGroupDetail,
    createChartValues as createChartValuesService,
} from './charts.service'
import { getChartRepoList, getAvailableCharts, getTeamList, getEnvironmentListMin, isGitOpsModuleInstalledAndConfigured } from '../../services/service'
import { mapByKey, showError, sortOptionsByLabel } from '../common'
import { toast } from 'react-toastify'
import { getChartGroups } from './charts.service'
import { mainContext } from '../common/navigation/NavigationRoutes'
import { SERVER_MODE } from '../../config'

function getSelectedInstances(charts) {
    return charts.reduce((agg, curr, idx) => {
        agg[curr.id] = agg[curr.id] || []
        agg[curr.id].push(idx)
        return agg
    }, {})
}

export default function useChartGroup(chartGroupId = null): ChartGroupExports {
    const { serverMode } = useContext(mainContext)

    const initialState = {
        chartGroups: [],
        chartRepos: [],
        charts: [],
        name: '',
        description: '',
        availableCharts: new Map(),
        selectedInstances: {},
        configureChartIndex: null,
        projects: [],
        environments: [],
        advanceVisited: false,
        loading: true,
        chartGroupDetailsLoading: false,
        noGitOpsConfigAvailable: false
    }
    const [state, setState] = useState<ChartGroupState>(initialState)
   
    useEffect(() => {
        async function populateCharts() {
            try {
                await Promise.allSettled([
                    getChartRepoList(),
                    serverMode == SERVER_MODE.FULL ? getChartGroups() : { value:{ status: "fulfilled",result: undefined} },
                    getAvailableCharts(`?includeDeprecated=1`),
                    getTeamList(),
                    getEnvironmentListMin(),
                    isGitOpsModuleInstalledAndConfigured(),
                ]).then((responses: { status: string; value?: any; reason?: any }[]) => {
                    const [
                        chartRepoList,
                        chartGroup,
                        availableCharts,
                        projects,
                        environments,
                        gitOpsModuleInstalledAndConfigured,
                    ] = responses.map((response) => response?.value?.result || [])
                  
                    let chartRepos = chartRepoList
                        .map((chartRepo) => {
                            return {
                                value: chartRepo.id,
                                label: chartRepo.name,
                            }
                        })
                        .sort(sortOptionsByLabel)
                    setState((state) => ({
                        ...state,
                        loading: false,
                        chartRepos,
                        chartGroups: chartGroup?.groups || [],
                        availableCharts: mapByKey(availableCharts, 'id'),
                        projects,
                        environments,
                        noGitOpsConfigAvailable:
                            gitOpsModuleInstalledAndConfigured.isInstalled &&
                            !gitOpsModuleInstalledAndConfigured.isConfigured,
                    }))
                })
            } catch (err) {
                showError(err)
                setState((state) => ({ ...state, loading: false }))
            } finally {
                setState((state) => ({ ...state, loading: false }))
            }
        }

        populateCharts()
    }, [])

    //TODO: use response
    async function reloadState() {
        //causes whole state to reset
        await getChartGroupDetails()
    }

    async function getChartGroupDetails() {
        try {
            setState({
                ...initialState,
                availableCharts: state.availableCharts,
                projects: state.projects,
                environments: state.environments
            })
            const {
                result: { name, description, chartGroupEntries },
            } = await getChartGroupDetail(chartGroupId)
            const tempCharts: ChartGroupEntry[] =
                chartGroupEntries?.map((chartGroup) => {
                    const {
                        id,
                        appStoreApplicationVersionId,
                        appStoreValuesVersionId,
                        chartMetaData,
                        appStoreValuesVersionName,
                        referenceType,
                        appStoreValuesChartVersion,
                    } = chartGroup
                    return {
                        id: chartMetaData.appStoreId,
                        installedId: id,
                        appStoreValuesVersionId,
                        appStoreApplicationVersionId,
                        appStoreValuesVersionName: appStoreValuesVersionName,
                        //TODO: must be in chart metadata
                        appStoreApplicationVersion: chartMetaData.appStoreApplicationVersion,
                        appStoreValuesChartVersion: appStoreValuesChartVersion,
                        chartMetaData,
                        isEnabled: true,
                        kind: referenceType,
                        //TODO: part of chart metadata
                        name: { value: chartMetaData.chartName, error: '', suggestedName: '' },
                        availableChartVersions: [],
                        availableChartValues: [],
                        valuesYaml: '',
                        originalValuesYaml: '',
                        environment: {
                            id: 0,
                            name: '',
                        },
                        loading: false,
                        isUnsaved: false,
                    }
                }, []) || []
            setState((state) => ({ ...state, name, description, charts: tempCharts, loading: false }))
        } catch (err) {
            showError(err)
        } finally {
            setState((state) => ({ ...state, chartGroupDetailsLoading: false }))
        }
    }

    useEffect(() => {
        if (!chartGroupId) return
        getChartGroupDetails()
    }, [chartGroupId])

    useEffect(() => {
        setState((state) => ({ ...state, selectedInstances: getSelectedInstances(state.charts) }))
    }, [state.charts])

    async function applyFilterOnCharts(queryString: string): Promise<any> {
        try {
            const { result: availableCharts } = await getAvailableCharts(queryString)
            setState((state) => ({ ...state, availableCharts: mapByKey(availableCharts, 'id') }))
        } catch (err) {
            showError(err)
        } finally {
            setState((state) => ({ ...state, loading: false }))
        }
    }

    async function getChartVersionsAndValues(chartId: number, index: number): Promise<void> {
        try {
            const { result: chartVerionList } = await getChartVersionsMin(chartId)
            const {
                result: { values: chartValuesList },
            } = await getChartValuesCategorizedList(chartId)
            const tempCharts = [...state.charts]
            tempCharts[index].availableChartVersions = chartVerionList
            tempCharts[index].availableChartValues = chartValuesList
            setState((state) => ({ ...state, charts: tempCharts }))
        } catch (err) {
            showError(err)
        }
    }
    
    async function validateData() {
        try {
            const nameRegexp = new RegExp(`^[a-z]+[a-z0-9\-\?]*[a-z0-9]+$`)
            let validated = true
            let tempCharts = state.charts.map((chart) => {
                if (!chart.isEnabled) {
                    // dont consider disabled charts
                    return chart
                }
                if (!nameRegexp.test(chart.name.value) || !chart?.environment?.id) {
                    validated = false
                }
                return {
                    ...chart,
                    name: {
                        value: chart.name.value,
                        error: nameRegexp.test(chart.name.value)
                            ? ''
                            : 'name must follow `^[a-z]+[a-z0-9-?]*[a-z0-9]+$` pattern',
                    },
                    environment: {
                        ...chart.environment,
                        error: chart?.environment?.id ? '' : 'Environment is mandatory',
                    },
                }
            })
            if (!validated) {
                setState((state) => ({ ...state, charts: tempCharts }))
                return validated
            }
            const names = state.charts.map((chart) => ({ name: chart.name.value }))
            const { result } = await validateAppNames(names)
            tempCharts = state.charts.map((chart, index) => {
                if (!chart.isEnabled) {
                    return chart
                }
                if (result[index].exists) {
                    validated = false
                }
                return {
                    ...chart,
                    environment: { ...chart.environment, error: '' },
                    name: {
                        value: chart.name.value,
                        error: result[index].exists ? 'App name already taken' : '',
                        suggestedName: result[index].exists ? result[index].suggestedName : '',
                    },
                }
            })
            setState((state) => ({ ...state, charts: tempCharts }))
            return validated
        } catch (err) {
            console.error(err)
            toast.warn('App names could not be validated. You may try to install anyway.')
        }
    }

    async function fetchChartValues(chartId, index): Promise<void> {
        try {
            const {
                result: { values: availableChartValues },
            } = await getChartValuesCategorizedList(chartId)
            const tempCharts = [...state.charts]
            tempCharts[index].availableChartValues = availableChartValues
            setState((state) => ({ ...state, charts: tempCharts }))
        } catch (err) {
            showError(err)
        }
    }

    function selectChart(chartId: number): void {
        const tempCharts = [...state.charts]
        if (Array.isArray(state.selectedInstances[chartId]) && state.selectedInstances[chartId].length > 0) {
            subtractChart(chartId)
        } else {
            addChart(chartId)
        }
        setState((state) => ({ ...state, charts: tempCharts }))
    }

    function setCharts(charts) {
        setState((state) => ({ ...state, charts }))
    }

    function addChart(chartId: number): void {
        const tempCharts = [...state.charts]
        const chartValue = state.availableCharts.get(chartId)
        const { name: chartName, chart_name: chartRepoName, icon, version, appStoreApplicationVersionId } = chartValue
        tempCharts.push({
            chartMetaData: { chartName, chartRepoName, icon, chartId },
            id: chartId,
            loading: false,
            appStoreValuesVersionId: appStoreApplicationVersionId,
            kind: 'DEFAULT',
            appStoreApplicationVersionId: appStoreApplicationVersionId,
            appStoreValuesChartVersion: version,
            isEnabled: true,
            environment: {},
            //TODO: must be in chart metadata
            appStoreApplicationVersion: version,
            //TODO: part of chart metadata
            name: { value: chartName, error: '', suggestedName: '' },
            isUnsaved: false,
            appStoreValuesVersionName: 'Default',
            installedId: undefined,
            availableChartVersions: [],
            availableChartValues: [],
            valuesYaml: '',
            originalValuesYaml: '',
        })
        setState((state) => ({ ...state, charts: tempCharts }))
    }

    function subtractChart(chartId: number): void {
        const tempCharts = [...state.charts]
        if (Array.isArray(state.selectedInstances[chartId]) && state.selectedInstances[chartId].length > 0) {
            // unselect
            const { length, [length - 1]: last } = state.selectedInstances[chartId]
            tempCharts.splice(last, 1)
        }
        setState((state) => ({ ...state, charts: tempCharts }))
    }

    function handleValuesYaml(index: number, valuesYaml: string) {
        const tempCharts = [...state.charts]
        tempCharts[index].valuesYaml = valuesYaml
        setState((state) => ({ ...state, charts: tempCharts }))
    }

    function discardValuesYamlChanges(index: number): void {
        const tempCharts = [...state.charts]
        tempCharts[index].valuesYaml = tempCharts[index].originalValuesYaml
        setState((state) => ({ ...state, charts: tempCharts }))
    }

    function removeChart(index: number, removeAll?: boolean): void {
        let tempCharts = [...state.charts]
        if (removeAll) {
            tempCharts.length = 0
        } else {
            tempCharts.splice(index, 1)
            if (state.configureChartIndex === index) {
                const chartIndex =
                    state.configureChartIndex === tempCharts.length && tempCharts.length > 0 ? index - 1 : index
                configureChart(chartIndex, tempCharts)
            }
        }

        const tempChartIndex =
            tempCharts.length === 0
                ? null
                : index >= state.configureChartIndex && state.configureChartIndex !== tempCharts.length
                ? state.configureChartIndex
                : state.configureChartIndex - 1

        setState((state) => ({
            ...state,
            charts: tempCharts,
            configureChartIndex: tempChartIndex,
            advanceVisited: tempCharts.length === 0 ? false : state.advanceVisited,
        }))
    }

    function toggleChart(index: number): void {
        const tempCharts = [...state.charts]
        tempCharts[index].isEnabled = !tempCharts[index].isEnabled
        //set default values
        tempCharts[index].isUnsaved = false
        tempCharts[index].name.error = ''
        tempCharts[index].environment.error = ''
        setState((state) => ({ ...state, charts: tempCharts }))
    }

    async function configureChart(index: number, _currentCharts?: ChartGroupEntry[]) {
        if (!state.charts[index]?.isEnabled) {
            toast.warn('Please enable first to configure chart')
            return
        }
        setState((state) => ({ ...state, configureChartIndex: index, advanceVisited: true }))
        const { valuesYaml } = state.charts[index]
        if (valuesYaml && !_currentCharts?.length) {
            return
        }
        const tempCharts = !_currentCharts?.length ? [...state.charts] : _currentCharts
        try {
            tempCharts[index].loading = true
            setState((state) => ({ ...state, charts: tempCharts }))
            if (tempCharts[index].appStoreValuesVersionId) {
                const { result: chartVersionDetails } = await getChartValues(
                    tempCharts[index].appStoreValuesVersionId,
                    tempCharts[index].kind || 'TEMPLATE',
                )
                tempCharts[index] = {
                    ...tempCharts[index],
                    originalValuesYaml: chartVersionDetails.values,
                    valuesYaml: chartVersionDetails.values,
                    loading: false,
                }
            } else {
                const { result: chartVersionDetails } = await getChartValues(
                    tempCharts[index].appStoreApplicationVersionId,
                    tempCharts[index].kind,
                )
                tempCharts[index] = {
                    ...tempCharts[index],
                    originalValuesYaml: chartVersionDetails.values,
                    valuesYaml: chartVersionDetails.values,
                    loading: false,
                }
            }
        } catch (err) {
            tempCharts[index].loading = false
        } finally {
            setState((state) => ({ ...state, charts: tempCharts }))
        }
    }

    async function handleChartVersionChange(index: number, versionId: number) {
        const tempCharts = [...state.charts]
        tempCharts[index].appStoreApplicationVersionId = versionId
        tempCharts[index].isUnsaved = true
        setState((state) => ({ ...state, charts: tempCharts }))
        if (tempCharts[index].kind === 'DEFAULT') {
            handleChartValueChange(index, tempCharts[index].kind, tempCharts[index].appStoreApplicationVersionId)
        }
    }

    async function handleChartValueChange(
        index: number,
        kind: 'DEPLOYED' | 'DEFAULT' | 'TEMPLATE' | 'EXISTING',
        valuesId: number,
    ) {
        const tempCharts = [...state.charts]
        tempCharts[index].loading = true
        tempCharts[index].isUnsaved = true
        try {
            setState((state) => ({ ...state, charts: tempCharts }))
            const { result: chartVersionDetails } = await getChartValues(valuesId, kind)
            tempCharts[index] = {
                ...tempCharts[index],
                kind,
                appStoreValuesVersionId: valuesId,
                originalValuesYaml: chartVersionDetails.values,
                valuesYaml: chartVersionDetails.values,
                loading: false,
            }
            setState((state) => ({ ...state, charts: tempCharts }))
        } catch (err) {
            showError(err)
            tempCharts[index].loading = false
            setState((state) => ({ ...state, charts: tempCharts }))
        }
    }

    function handleEnvironmentChange(index: number, envId: number): void {
        const tempCharts = [...state.charts]
        tempCharts[index].environment = { id: envId, error: '' }
        setState((state) => ({ ...state, charts: tempCharts }))
    }

    function handleEnvironmentChangeOfAllCharts(envId: number): void {
        const tempCharts = [...state.charts]
        for (let i = 0; i < tempCharts.length; i++) {
            tempCharts[i].environment = { id: envId, error: '' }
        }
        setState((state) => ({ ...state, charts: tempCharts }))
    }

    function handleNameChange(index: number, appName: string): void {
        const tempCharts = [...state.charts]
        tempCharts[index].name = { value: appName, error: '' }
        setState((state) => ({ ...state, charts: tempCharts }))
    }
    //TODO: function name must be a verb
    function chartListing() {
        setState((state) => ({ ...state, configureChartIndex: null, advanceVisited: false }))
    }

    function clearUnsaved() {
        let tempCharts = [...state.charts]
        tempCharts = tempCharts.map((chart) => {
            return {
                ...chart,
                isUnsaved: false,
            }
        })
        setState((state) => ({ ...state, charts: tempCharts }))
    }

    async function createChartValues(index: number, name: string) {
        const { valuesYaml, appStoreApplicationVersionId, id: chartId } = state.charts[index]
        try {
            const {
                result: { id, appStoreVersionId, name: newName, values: newValues },
            } = await createChartValuesService({
                appStoreVersionId: appStoreApplicationVersionId,
                values: valuesYaml,
                name,
            })
            await fetchChartValues(chartId, index)
            const tempCharts = [...state.charts]
            tempCharts[index] = { ...tempCharts[index], kind: 'TEMPLATE', appStoreValuesVersionId: id }
            setState((state) => ({ ...state, charts: tempCharts }))
        } catch (err) {
            showError(err)
        }
    }

    async function updateChartGroupNameAndDescription(name: string, description) {
        return setState((state) => ({ ...state, name, description }))
    }

    return {
        state,
        // getChartVersions,
        applyFilterOnCharts,
        fetchChartValues,
        getChartVersionsAndValues,
        selectChart,
        addChart,
        subtractChart,
        handleValuesYaml,
        removeChart,
        toggleChart,
        configureChart,
        handleChartValueChange,
        handleChartVersionChange,
        handleEnvironmentChange,
        handleEnvironmentChangeOfAllCharts,
        handleNameChange,
        chartListing,
        createChartValues,
        validateData,
        discardValuesYamlChanges,
        updateChartGroupEntriesFromResponse: clearUnsaved,
        updateChartGroupNameAndDescription,
        reloadState,
        setCharts,
    }
}
