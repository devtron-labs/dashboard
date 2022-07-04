import { ChartValuesType, ChartVersionType } from '../../../charts/charts.types'
import { ChartValuesViewAction, ChartValuesViewActionTypes, ChartValuesViewState } from './ChartValuesView.type'

export const initState = (
    selectedVersionFromParent: number,
    chartValuesFromParent: ChartValuesType,
    installedConfigFromParent: any,
    chartVersionsDataFromParent: ChartVersionType[],
): ChartValuesViewState => {
    return {
        isLoading: true,
        isLodingGUIForm: false,
        openReadMe: false,
        openComparison: false,
        isUpdateInProgress: false,
        isDeleteInProgress: false,
        showDeleteAppConfirmationDialog: false,
        showAppNotLinkedDialog: false,
        selectedProject: null,
        selectedEnvironment: null,
        selectedVersion: selectedVersionFromParent,
        selectedVersionUpdatePage: null,
        chartValues: chartValuesFromParent,
        repoChartValue: null,
        fetchingValuesYaml: false,
        modifiedValuesYaml: '',
        schemaJson: null,
        valuesYamlDocument: null,
        valuesYamlUpdated: true,
        generatingManifest: false,
        manifestGenerationKey: '',
        generatedManifest: '',
        valuesEditorError: '',
        installedConfig: installedConfigFromParent,
        fetchingReadMe: false,
        fetchedReadMe: new Map<number, string>(),
        activeTab: 'yaml',
        isComparisonAvailable: true,
        isReadMeAvailable: true,
        releaseInfo: null,
        installedAppInfo: null,
        chartVersionsData: chartVersionsDataFromParent || [],
        projects: [],
        environments: [],
        deploymentHistoryArr: [],
        forceDeleteData: {
            forceDelete: false,
            title: '',
            message: '',
        },
        errorResponseCode: 0,
        invalidAppName: false,
        invalidAppNameMessage: '',
        invalidaEnvironment: false,
        invalidProject: false,
    }
}

export const chartValuesReducer = (state: ChartValuesViewState, action: ChartValuesViewAction) => {
    switch (action.type) {
        case ChartValuesViewActionTypes.isLoading:
            return { ...state, isLoading: action.payload }
        case ChartValuesViewActionTypes.isLoadingGUIForm:
            return { ...state, isLoadingGUIForm: action.payload }
        case ChartValuesViewActionTypes.openReadMe:
            return { ...state, openReadMe: action.payload }
        case ChartValuesViewActionTypes.openComparison:
            return { ...state, openComparison: action.payload }
        case ChartValuesViewActionTypes.isUpdateInProgress:
            return { ...state, isUpdateInProgress: action.payload }
        case ChartValuesViewActionTypes.isDeleteInProgress:
            return { ...state, isDeleteInProgress: action.payload }
        case ChartValuesViewActionTypes.showDeleteAppConfirmationDialog:
            return { ...state, showDeleteAppConfirmationDialog: action.payload }
        case ChartValuesViewActionTypes.showAppNotLinkedDialog:
            return { ...state, showAppNotLinkedDialog: action.payload }
        case ChartValuesViewActionTypes.selectedProject:
            return { ...state, selectedProject: action.payload }
        case ChartValuesViewActionTypes.selectedEnvironment:
            return { ...state, selectedEnvironment: action.payload }
        case ChartValuesViewActionTypes.selectedVersion:
            return { ...state, selectedVersion: action.payload }
        case ChartValuesViewActionTypes.selectedVersionUpdatePage:
            return { ...state, selectedVersionUpdatePage: action.payload }
        case ChartValuesViewActionTypes.chartValues:
            return { ...state, chartValues: action.payload }
        case ChartValuesViewActionTypes.repoChartValue:
            return { ...state, repoChartValue: action.payload }
        case ChartValuesViewActionTypes.fetchingValuesYaml:
            return { ...state, fetchingValuesYaml: action.payload }
        case ChartValuesViewActionTypes.modifiedValuesYaml:
            return { ...state, modifiedValuesYaml: action.payload }
        case ChartValuesViewActionTypes.schemaJson:
            return { ...state, schemaJson: action.payload }
        case ChartValuesViewActionTypes.valuesYamlDocument:
            return { ...state, valuesYamlDocument: action.payload }
        case ChartValuesViewActionTypes.valuesYamlUpdated:
            return { ...state, valuesYamlUpdated: action.payload }
        case ChartValuesViewActionTypes.generatingManifest:
            return { ...state, generatingManifest: action.payload }
        case ChartValuesViewActionTypes.manifestGenerationKey:
            return { ...state, manifestGenerationKey: action.payload }
        case ChartValuesViewActionTypes.generatedManifest:
            return { ...state, generatedManifest: action.payload }
        case ChartValuesViewActionTypes.valuesEditorError:
            return { ...state, valuesEditorError: action.payload }
        case ChartValuesViewActionTypes.installedConfig:
            return { ...state, installedConfig: action.payload }
        case ChartValuesViewActionTypes.fetchingReadMe:
            return { ...state, fetchingReadMe: action.payload }
        case ChartValuesViewActionTypes.fetchedReadMe:
            return { ...state, fetchedReadMe: action.payload }
        case ChartValuesViewActionTypes.activeTab:
            return { ...state, activeTab: action.payload }
        case ChartValuesViewActionTypes.isComparisonAvailable:
            return { ...state, isComparisonAvailable: action.payload }
        case ChartValuesViewActionTypes.isReadMeAvailable:
            return { ...state, isReadMeAvailable: action.payload }
        case ChartValuesViewActionTypes.releaseInfo:
            return { ...state, releaseInfo: action.payload }
        case ChartValuesViewActionTypes.installedAppInfo:
            return { ...state, installedAppInfo: action.payload }
        case ChartValuesViewActionTypes.chartVersionsData:
            return { ...state, chartVersionsData: action.payload }
        case ChartValuesViewActionTypes.projects:
            return { ...state, projects: action.payload }
        case ChartValuesViewActionTypes.environments:
            return { ...state, environments: action.payload }
        case ChartValuesViewActionTypes.forceDeleteData:
            return { ...state, forceDeleteData: action.payload }
        case ChartValuesViewActionTypes.errorResponseCode:
            return { ...state, errorResponseCode: action.payload }
        case ChartValuesViewActionTypes.invalidAppName:
            return { ...state, invalidAppName: action.payload }
        case ChartValuesViewActionTypes.invalidAppNameMessage:
            return { ...state, invalidAppNameMessage: action.payload }
        case ChartValuesViewActionTypes.invalidaEnvironment:
            return { ...state, invalidaEnvironment: action.payload }
        case ChartValuesViewActionTypes.invalidProject:
            return { ...state, invalidProject: action.payload }
        case ChartValuesViewActionTypes.deploymentHistoryArr:
            return { ...state, deploymentHistoryArr: action.payload }
        case ChartValuesViewActionTypes.multipleOptions:
            return { ...state, ...action.payload }
        default:
            return state
    }
}
