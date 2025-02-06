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

import { DeploymentAppTypes, doesJSONConformToSchema07 } from '@devtron-labs/devtron-fe-common-lib'
import { ChartValuesType, ChartVersionType } from '../../../charts/charts.types'
import { ChartValuesViewAction, ChartValuesViewActionTypes, ChartValuesViewState } from './ChartValuesView.type'

export const initState = (
    selectedVersionFromParent: number,
    chartValuesFromParent: ChartValuesType,
    installedConfigFromParent: any,
    chartVersionsDataFromParent: ChartVersionType[],
    deploymentAppType: DeploymentAppTypes,
): ChartValuesViewState => {
    return {
        isLoading: true,
        isLodingGUIForm: false,
        openReadMe: false,
        openComparison: false,
        isUpdateInProgress: false,
        isDeleteInProgress: false,
        showDeleteAppConfirmationDialog: false,
        showRepoSelector: false,
        showConnectToChartTippy: false,
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
        installedConfig: {
            ...installedConfigFromParent,
            valuesSchemaJson: doesJSONConformToSchema07(installedConfigFromParent.valuesSchemaJson).isValid
                ? installedConfigFromParent.valuesSchemaJson
                : '',
        },
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
        nonCascadeDeleteData: {
            nonCascade: false,
            clusterName: '',
        },
        errorResponseCode: 0,
        invalidAppName: false,
        invalidAppNameMessage: '',
        invalidValueName: false,
        invalidValueNameMessage: '',
        invalidaEnvironment: false,
        invalidProject: false,
        formValidationError: {},
        showNoGitOpsWarning: false,
        deploymentAppType: deploymentAppType ?? (window._env_.HIDE_GITOPS_OR_HELM_OPTION ? '' : DeploymentAppTypes.HELM),
        gitRepoURL: '',
        authMode: null,
        initialChartVersionValues: {
            chartVersionId: selectedVersionFromParent,
            chartValuesId: chartValuesFromParent?.id,
        },
        isManifestScanEnabled: installedConfigFromParent?.isManifestScanEnabled ?? false,
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
        case ChartValuesViewActionTypes.showRepoSelector:
            return { ...state, showRepoSelector: action.payload }
        case ChartValuesViewActionTypes.showConnectToChartTippy:
            return { ...state, showConnectToChartTippy: action.payload }
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
        case ChartValuesViewActionTypes.nonCascadeDeleteData:
            return { ...state, nonCascadeDeleteData: action.payload }
        case ChartValuesViewActionTypes.errorResponseCode:
            return { ...state, errorResponseCode: action.payload }
        case ChartValuesViewActionTypes.invalidValueName:
            return { ...state, invalidValueName: action.payload }
        case ChartValuesViewActionTypes.invalidValueNameMessage:
            return { ...state, invalidValueNameMessage: action.payload }
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
        case ChartValuesViewActionTypes.formValidationError:
            return { ...state, formValidationError: action.payload }
        case ChartValuesViewActionTypes.multipleOptions:
            return { ...state, ...action.payload }
        case ChartValuesViewActionTypes.showNoGitOpsWarning:
            return { ...state, showNoGitOpsWarning: action.payload }
        case ChartValuesViewActionTypes.selectedDeploymentApp:
            return { ...state, deploymentAppType: action.payload }
        case ChartValuesViewActionTypes.setGitRepoURL:
            return { ...state, gitRepoURL: action.payload }
        case ChartValuesViewActionTypes.setIsManifestScanEnabled:
            return { ...state, isManifestScanEnabled: action.payload }
        case ChartValuesViewActionTypes.updateGitOpsConfiguration:
            return {
                ...state,
                showNoGitOpsWarning: action.payload.showNoGitOpsWarning,
                authMode: action.payload.authMode,
            }
        default:
            return state
    }
}
