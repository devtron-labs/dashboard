import { ChartValuesType, ChartVersionType } from '../../../charts/charts.types'
import { InstalledAppInfo, ReleaseInfo } from '../../../external-apps/ExternalAppService'
import { ChartDeploymentDetail } from '../../chartDeploymentHistory/chartDeploymentHistory.service'
import { ChartEnvironmentOptionType, ChartRepoOtions, ChartValuesOptionType } from './ChartValuesView.type'

export interface ChartValuesViewState {
    isLoading: boolean
    openReadMe: boolean
    openComparison: boolean
    isUpdateInProgress: boolean
    isDeleteInProgress: boolean
    showDeleteAppConfirmationDialog: boolean
    showAppNotLinkedDialog: boolean
    selectedProject: ChartValuesOptionType
    selectedEnvironment: ChartEnvironmentOptionType
    selectedVersion: number
    selectedVersionUpdatePage: ChartVersionType
    chartValues: ChartValuesType
    repoChartValue: ChartRepoOtions
    fetchingValuesYaml: boolean
    modifiedValuesYaml: string
    valuesYamlUpdated: boolean
    generatingManifest: boolean
    manifestGenerationKey: string
    generatedManifest: string
    valuesEditorError: string
    installedConfig: any
    fetchingReadMe: boolean
    fetchedReadMe: Map<number, string>
    activeTab: string
    isComparisonAvailable: boolean
    isReadMeAvailable: boolean
    releaseInfo: ReleaseInfo
    installedAppInfo: InstalledAppInfo
    chartVersionsData: ChartVersionType[]
    projects: ChartValuesOptionType[]
    environments: ChartEnvironmentOptionType[]
    deploymentHistoryArr: ChartDeploymentDetail[]
    forceDeleteData: {
        forceDelete: boolean
        title: string
        message: string
    }
    errorResponseCode: number
    invalidAppName: boolean
    invalidAppNameMessage: string
    invalidaEnvironment: boolean
    invalidProject: boolean
}
export interface ChartValuesViewAction {
    type: string
    payload: any
}

export const initState = (
    selectedVersionFromParent: number,
    chartValuesFromParent: ChartValuesType,
    installedConfigFromParent: any,
    chartVersionsDataFromParent: ChartVersionType[],
): ChartValuesViewState => {
    return {
        isLoading: true,
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
        case 'isLoading':
            return { ...state, isLoading: action.payload }
        case 'openReadMe':
            return { ...state, openReadMe: action.payload }
        case 'openComparison':
            return { ...state, openComparison: action.payload }
        case 'isUpdateInProgress':
            return { ...state, isUpdateInProgress: action.payload }
        case 'isDeleteInProgress':
            return { ...state, isDeleteInProgress: action.payload }
        case 'showDeleteAppConfirmationDialog':
            return { ...state, showDeleteAppConfirmationDialog: action.payload }
        case 'showAppNotLinkedDialog':
            return { ...state, showAppNotLinkedDialog: action.payload }
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
        case 'valuesYamlUpdated':
            return { ...state, valuesYamlUpdated: action.payload }
        case 'generatingManifest':
            return { ...state, generatingManifest: action.payload }
        case 'manifestGenerationKey':
            return { ...state, manifestGenerationKey: action.payload }
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
        case 'releaseInfo':
            return { ...state, releaseInfo: action.payload }
        case 'installedAppInfo':
            return { ...state, installedAppInfo: action.payload }
        case 'chartVersionsData':
            return { ...state, chartVersionsData: action.payload }
        case 'projects':
            return { ...state, projects: action.payload }
        case 'environments':
            return { ...state, environments: action.payload }
        case 'forceDeleteData':
            return { ...state, forceDeleteData: action.payload }
        case 'errorResponseCode':
            return { ...state, errorResponseCode: action.payload }
        case 'invalidAppName':
            return { ...state, invalidAppName: action.payload }
        case 'invalidAppNameMessage':
            return { ...state, invalidAppNameMessage: action.payload }
        case 'invalidaEnvironment':
            return { ...state, invalidaEnvironment: action.payload }
        case 'invalidProject':
            return { ...state, invalidProject: action.payload }
        case 'deploymentHistoryArr':
            return { ...state, deploymentHistoryArr: action.payload }
        case 'multipleOptions':
            return { ...state, ...action.payload }
        default:
            return state
    }
}
