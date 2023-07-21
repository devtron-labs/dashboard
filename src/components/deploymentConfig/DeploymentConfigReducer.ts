import { DeploymentConfigStateAction, DeploymentConfigStateActionTypes, DeploymentConfigStateType } from './types'

export const initDeploymentConfigState: DeploymentConfigStateType = {
    charts: [],
    chartsMetadata: {},
    selectedChartRefId: 0,
    selectedChart: null,
    template: '',
    schema: null,
    loading: false,
    chartConfig: null,
    isAppMetricsEnabled: false,
    tempFormData: '',
    chartConfigLoading: false,
    showConfirmation: false,
    showReadme: false,
    openComparison: false,
    selectedTabIndex: 1,
    readme: '',
    fetchedValues: {},
    yamlMode: true,
    isBasicLocked: false,
    isBasicLockedInBase: false,
    currentEditorView: '',
    basicFieldValues: null,
    basicFieldValuesErrorObj: null,
    data: null,
    duplicate: null,
    dialog: false,
    latestAppChartRef: null,
    latestChartRef: null,
    showSaveChangsModal: false,
    isConfigProtectionEnabled: false,
    allDrafts: [],
    latestDraft: null,
    activityHistory: [],
    showComments: false,
}

export const deploymentConfigReducer = (state: DeploymentConfigStateType, action?: DeploymentConfigStateAction) => {
    switch (action.type) {
        case DeploymentConfigStateActionTypes.loading:
            return { ...state, loading: action.payload }
        case DeploymentConfigStateActionTypes.charts:
            return { ...state, charts: action.payload }
        case DeploymentConfigStateActionTypes.chartsMetadata:
            return { ...state, chartsMetadata: action.payload }
        case DeploymentConfigStateActionTypes.selectedChartRefId:
            return { ...state, selectedChartRefId: action.payload }
        case DeploymentConfigStateActionTypes.selectedChart:
            return { ...state, selectedChart: action.payload }
        case DeploymentConfigStateActionTypes.template:
            return { ...state, template: action.payload }
        case DeploymentConfigStateActionTypes.schemas:
            return { ...state, schemas: action.payload }
        case DeploymentConfigStateActionTypes.chartConfig:
            return { ...state, chartConfig: action.payload }
        case DeploymentConfigStateActionTypes.isAppMetricsEnabled:
            return { ...state, isAppMetricsEnabled: action.payload }
        case DeploymentConfigStateActionTypes.tempFormData:
            return { ...state, tempFormData: action.payload }
        case DeploymentConfigStateActionTypes.chartConfigLoading:
            return { ...state, chartConfigLoading: action.payload }
        case DeploymentConfigStateActionTypes.showConfirmation:
            return { ...state, showConfirmation: action.payload }
        case DeploymentConfigStateActionTypes.showReadme:
            return { ...state, showReadme: action.payload }
        case DeploymentConfigStateActionTypes.openComparison:
            return { ...state, openComparison: action.payload }
        case DeploymentConfigStateActionTypes.selectedTabIndex:
            return { ...state, selectedTabIndex: action.payload }
        case DeploymentConfigStateActionTypes.readme:
            return { ...state, readme: action.payload }
        case DeploymentConfigStateActionTypes.fetchedValues:
            return { ...state, fetchedValues: action.payload }
        case DeploymentConfigStateActionTypes.yamlMode:
            return { ...state, yamlMode: action.payload }
        case DeploymentConfigStateActionTypes.isBasicLocked:
            return { ...state, isBasicLocked: action.payload }
        case DeploymentConfigStateActionTypes.currentEditorView:
            return { ...state, currentEditorView: action.payload }
        case DeploymentConfigStateActionTypes.basicFieldValues:
            return { ...state, basicFieldValues: action.payload }
        case DeploymentConfigStateActionTypes.basicFieldValuesErrorObj:
            return { ...state, basicFieldValuesErrorObj: action.payload }
        case DeploymentConfigStateActionTypes.duplicate:
            return { ...state, duplicate: action.payload }
        case DeploymentConfigStateActionTypes.appMetrics:
            return {
                ...state,
                data: {
                    ...state.data,
                    appMetrics: action.payload,
                },
            }
        case DeploymentConfigStateActionTypes.data:
            return { ...state, data: action.payload }
        case DeploymentConfigStateActionTypes.toggleDialog:
            return { ...state, dialog: !state.dialog }
        case DeploymentConfigStateActionTypes.reset:
            return { ...initDeploymentConfigState }
        case DeploymentConfigStateActionTypes.toggleSaveChangesModal:
            return { ...state, showSaveChangsModal: !state.showSaveChangsModal }
        case DeploymentConfigStateActionTypes.allDrafts:
            return { ...state, allDrafts: action.payload }
        case DeploymentConfigStateActionTypes.toggleDraftComments:
            return { ...state, showComments: !state.showComments }
        case DeploymentConfigStateActionTypes.multipleOptions:
            return { ...state, ...action.payload }
        default:
            return state
    }
}
