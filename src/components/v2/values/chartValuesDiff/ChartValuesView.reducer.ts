import { ChartValuesType } from '../../../charts/charts.types'

export const initState = (
    selectedVersionFromParent: number,
    chartValuesFromParent: ChartValuesType,
    installedConfigFromParent: any,
) => {
    return {
        isLoading: true,
        openReadMe: false,
        openComparison: false,
        selectedProject: null,
        selectedEnvironment: null,
        selectedVersion: selectedVersionFromParent,
        selectedVersionUpdatePage: null,
        chartValues: chartValuesFromParent,
        repoChartValue: null,
        fetchingValuesYaml: false,
        modifiedValuesYaml: '',
        generatingManifest: false,
        generatedManifest: '',
        valuesEditorError: '',
        installedConfig: installedConfigFromParent,
        fetchingReadMe: false,
        fetchedReadMe: new Map<number, string>(),
        activeTab: 'yaml',
        isComparisonAvailable: true,
        isReadMeAvailable: true,
    }
}

export const chartValuesReducer = (state, action) => {
    switch (action.type) {
        case 'isLoading':
            return { ...state, isLoading: action.payload }
        case 'openReadMe':
            return { ...state, openReadMe: action.payload }
        case 'openComparison':
            return { ...state, openComparison: action.payload }
        case 'selectedProject':
            return { ...state, selectedProject: action.payload }
        case 'selectedEnvironment':
            return { ...state, selectedEnvironment: action.payload }
        case 'selectedVersion':
            return { ...state, selectedVersion: action.payload }
        case 'selectedVersionUpdatePage':
            return { ...state, selectedVersionUpdatePage: action.payload }
        case 'chartValues':
            return { ...state, chartValues: action.payload }
        case 'repoChartValue':
            return { ...state, repoChartValue: action.payload }
        case 'fetchingValuesYaml':
            return { ...state, fetchingValuesYaml: action.payload }
        case 'modifiedValuesYaml':
            return { ...state, modifiedValuesYaml: action.payload }
        case 'generatingManifest':
            return { ...state, generatingManifest: action.payload }
        case 'generatedManifest':
            return { ...state, generatedManifest: action.payload }
        case 'valuesEditorError':
            return { ...state, valuesEditorError: action.payload }
        case 'installedConfig':
            return { ...state, installedConfig: action.payload }
        case 'fetchingReadMe':
            return { ...state, fetchingReadMe: action.payload }
        case 'fetchedReadMe':
            return { ...state, fetchedReadMe: action.payload }
        case 'activeTab':
            return { ...state, activeTab: action.payload }
        case 'isComparisonAvailable':
            return { ...state, isComparisonAvailable: action.payload }
        case 'isReadMeAvailable':
            return { ...state, isReadMeAvailable: action.payload }
        case 'multipleOptions':
            return { ...state, ...action.payload }
        default:
            return state
    }
}
