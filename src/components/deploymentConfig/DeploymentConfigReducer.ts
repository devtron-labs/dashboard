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

import { DeploymentConfigStateAction, DeploymentConfigStateActionTypes, DeploymentConfigStateWithDraft } from './types'

export const initDeploymentConfigState: DeploymentConfigStateWithDraft = {
    publishedState: null,
    charts: [],
    chartsMetadata: {},
    selectedChartRefId: 0,
    selectedChart: null,
    template: '',
    schema: null,
    guiSchema: null,
    loading: true,
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
    fetchedValuesManifest: {},
    yamlMode: false,
    data: null,
    duplicate: null,
    dialog: false,
    latestAppChartRef: null,
    latestChartRef: null,
    showSaveChangesModal: false,
    allDrafts: [],
    latestDraft: null,
    draftValues: '',
    showComments: false,
    showDeleteOverrideDraftModal: false,
    isOverride: false,
    showDraftOverriden: false,
    isDraftOverriden: false,
    unableToParseYaml: false,
    selectedCompareOption: null,
    isValues: true,
    loadingManifest: false,
    manifestDataRHS: '',
    manifestDataLHS: '',
    groupedOptionsData: [],
    manifestDataLHSOverride: '',
    manifestDataRHSOverride: '',
    loadingManifestOverride: false,
    isValuesOverride: true,
    groupedOptionsDataOverride: [],
    convertVariables: false,
    convertVariablesOverride: false,
    showLockedTemplateDiff: false,
    lockChangesLoading: false,
    wasGuiOrHideLockedKeysEdited: false,
}

export const deploymentConfigReducer = (
    state: DeploymentConfigStateWithDraft,
    action?: DeploymentConfigStateAction,
) => {
    switch (action.type) {
        case DeploymentConfigStateActionTypes.draftState:
            return { ...state, draftState: action.payload }
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
        case DeploymentConfigStateActionTypes.lockChangesLoading:
            return { ...state, lockChangesLoading: action.payload }
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
        case DeploymentConfigStateActionTypes.fetchedValuesManifest:
            return { ...state, fetchedValuesManifest: action.payload }
        case DeploymentConfigStateActionTypes.yamlMode:
            return { ...state, yamlMode: action.payload }
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
            return { ...initDeploymentConfigState, yamlMode: action.payload?.isSuperAdmin }
        case DeploymentConfigStateActionTypes.toggleSaveChangesModal:
            return { ...state, showSaveChangesModal: !state.showSaveChangesModal }
        case DeploymentConfigStateActionTypes.toggleShowLockedTemplateDiff:
            return { ...state, showLockedTemplateDiff: action.payload }
        case DeploymentConfigStateActionTypes.allDrafts:
            return { ...state, allDrafts: action.payload }
        case DeploymentConfigStateActionTypes.toggleDraftComments:
            return { ...state, showComments: !state.showComments }
        case DeploymentConfigStateActionTypes.toggleDeleteOverrideDraftModal:
            return { ...state, showDeleteOverrideDraftModal: !state.showDeleteOverrideDraftModal }
        case DeploymentConfigStateActionTypes.publishedState:
            return { ...state, publishedState: action.payload }
        case DeploymentConfigStateActionTypes.isDraftOverriden:
            return { ...state, isDraftOverriden: action.payload }
        case DeploymentConfigStateActionTypes.unableToParseYaml:
            return { ...state, unableToParseYaml: action.payload }
        case DeploymentConfigStateActionTypes.selectedCompareOption:
            return { ...state, selectedCompareOption: action.payload }
        case DeploymentConfigStateActionTypes.isValues:
            return { ...state, isValues: action.payload }
        case DeploymentConfigStateActionTypes.loadingManifest:
            return { ...state, loadingManifest: action.payload }
        case DeploymentConfigStateActionTypes.manifestDataRHS:
            return { ...state, manifestDataRHS: action.payload }
        case DeploymentConfigStateActionTypes.manifestDataLHS:
            return { ...state, manifestDataLHS: action.payload }
        case DeploymentConfigStateActionTypes.groupedOptionsData:
            return { ...state, groupedOptionsData: action.payload }
        case DeploymentConfigStateActionTypes.isValuesOverride:
            return { ...state, isValuesOverride: action.payload }
        case DeploymentConfigStateActionTypes.manifestDataLHSOverride:
            return { ...state, manifestDataLHSOverride: action.payload }
        case DeploymentConfigStateActionTypes.manifestDataRHSOverride:
            return { ...state, manifestDataRHSOverride: action.payload }
        case DeploymentConfigStateActionTypes.loadingManifestOverride:
            return { ...state, loadingManifestOverride: action.payload }
        case DeploymentConfigStateActionTypes.groupedOptionsDataOverride:
            return { ...state, groupedOptionsDataOverride: action.payload }
        case DeploymentConfigStateActionTypes.convertVariables:
            return { ...state, convertVariables: action.payload }
        case DeploymentConfigStateActionTypes.convertVariablesOverride:
            return { ...state, convertVariablesOverride: action.payload }
        case DeploymentConfigStateActionTypes.guiSchema:
            return { ...state, guiSchema: action.payload }
        case DeploymentConfigStateActionTypes.wasGuiOrHideLockedKeysEdited:
            return { ...state, wasGuiOrHideLockedKeysEdited: action.payload }
        case DeploymentConfigStateActionTypes.multipleOptions:
            return { ...state, ...action.payload }
        default:
            return state
    }
}
