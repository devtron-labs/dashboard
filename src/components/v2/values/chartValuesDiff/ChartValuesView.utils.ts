import { ChartValuesType } from '../../../charts/charts.types'

export const initSelectedOptionsData = (selectedVersionFromParent: number, chartValuesFromParent: ChartValuesType) => {
    return {
        selectedProject: null,
        selectedEnvironment: null,
        selectedVersion: selectedVersionFromParent,
        selectedVersionUpdatePage: null,
        chartValues: chartValuesFromParent,
        repoChartValue: null,
    }
}

export const selectedOptionsDataReducer = (state, action) => {
    switch (action.type) {
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
        case 'multipleOptions':
            return { ...state, ...action.payload }
        default:
            return state
    }
}

export const initValuesAndManifestYamlData = {
    fetchingValuesYaml: false,
    modifiedValuesYaml: '',
    generatingManifest: false,
    generatedManifest: '',
    valuesEditorError: '',
}

export const valuesAndManifestYamlDataReducer = (state, action) => {
    switch (action.type) {
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
        case 'multipleOptions':
            return { ...state, ...action.payload }
        default:
            return state
    }
}
