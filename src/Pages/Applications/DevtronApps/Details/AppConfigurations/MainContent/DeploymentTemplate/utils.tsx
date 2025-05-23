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

import YAML from 'yaml'

import {
    applyCompareDiffOnUneditedDocument,
    CONFIG_HEADER_TAB_VALUES,
    ConfigHeaderTabType,
    DeploymentTemplateConfigState,
    DryRunEditorMode,
    getGuiSchemaFromChartName,
    OverrideMergeStrategyType,
    ResponseType,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { DEFAULT_MERGE_STRATEGY } from '../constants'
import { CompareConfigViewProps, EnvOverrideEditorCommonStateType } from '../types'
import { CHART_NAME_TO_DOC_SEGMENT, PROTECT_BASE_DEPLOYMENT_TEMPLATE_IDENTIFIER_DTO } from './constants'
import {
    BaseDeploymentTemplateParsedDraftDTO,
    ConfigEditorStatesType,
    DeploymentTemplateEditorDataStateType,
    DeploymentTemplateStateType,
    DeploymentTemplateURLConfigType,
    GetCompareFromEditorConfigParams,
    GetCurrentEditorPayloadForScopedVariablesProps,
    GetCurrentEditorStateProps,
    GetDryRunViewEditorStateProps,
    GetLockedDiffModalDocumentsParamsType,
    GetLockedDiffModalDocumentsReturnType,
    HandleInitializeDraftDataProps,
    OverriddenBaseDeploymentTemplateParsedDraftDTO,
    UpdateBaseDTPayloadType,
    UpdateEnvironmentDTPayloadType,
} from './types'

const removeLockedKeysFromYaml = importComponentFromFELibrary('removeLockedKeysFromYaml', null, 'function')
const reapplyRemovedLockedKeysToYaml = importComponentFromFELibrary('reapplyRemovedLockedKeysToYaml', null, 'function')

/**
 * This method will compare and calculate the diffs between @unedited and @edited
 * documents and apply these diffs onto the @unedited document and return this new document
 * @param {string} unedited - The unedited document onto which we want to patch the changes from @edited
 * @param {string} edited - The edited document whose changes we want to patch onto @unedited
 */
export const applyCompareDiffOfTempFormDataOnOriginalData = (
    unedited: string,
    edited: string,
    updateTempFormData?: (data: string) => void,
) => {
    const updated = applyCompareDiffOnUneditedDocument(YAML.parse(unedited), YAML.parse(edited))
    updateTempFormData?.(YAMLStringify(updated, { simpleKeys: true }))
    return updated
}

export const addGUISchemaIfAbsent = (response: ResponseType, chartName: string) => {
    if (response?.result && !response.result.guiSchema) {
        return {
            ...response,
            result: {
                ...response.result,
                guiSchema: JSON.stringify(getGuiSchemaFromChartName(chartName)),
            },
        }
    }
    return response
}

export const getEditorTemplateAndLockedKeys = (
    template: string,
    lockedConfigKeys: string[],
): Pick<DeploymentTemplateEditorDataStateType, 'editorTemplate' | 'removedPatches'> => {
    const removedPatches: DeploymentTemplateEditorDataStateType['removedPatches'] = []

    if (!removeLockedKeysFromYaml || !lockedConfigKeys.length || !template) {
        return { editorTemplate: template, removedPatches }
    }

    try {
        const clonedLockedConfigKeys = structuredClone(lockedConfigKeys)
        const { document, addOperations } = removeLockedKeysFromYaml(template, clonedLockedConfigKeys)
        if (addOperations.length) {
            removedPatches.push(...addOperations)
        }

        const updatedTemplate = YAMLStringify(document, {
            simpleKeys: true,
        })
        return { editorTemplate: updatedTemplate, removedPatches }
    } catch {
        return { editorTemplate: template, removedPatches: [] }
    }
}

export const getCurrentTemplateWithLockedKeys = ({
    currentEditorTemplateData,
    wasGuiOrHideLockedKeysEdited,
}: Pick<
    DeploymentTemplateStateType,
    ConfigEditorStatesType.CURRENT_EDITOR | 'wasGuiOrHideLockedKeysEdited'
>): string => {
    const removedPatches = structuredClone(currentEditorTemplateData.removedPatches || [])

    if (!removedPatches.length || !reapplyRemovedLockedKeysToYaml) {
        return currentEditorTemplateData.editorTemplate
    }

    try {
        const originalDocument = currentEditorTemplateData.originalTemplate
        const parsedDocument = YAML.parse(currentEditorTemplateData.editorTemplate)

        const updatedEditorObject = reapplyRemovedLockedKeysToYaml(parsedDocument, removedPatches)

        if (wasGuiOrHideLockedKeysEdited) {
            // TODO: Sync regarding this originalDocument theory when we have no override should we check for mergedTemplateObject
            return YAMLStringify(applyCompareDiffOnUneditedDocument(originalDocument, updatedEditorObject), {
                simpleKeys: true,
            })
        }
        return YAMLStringify(updatedEditorObject, { simpleKeys: true })
    } catch {
        // Do nothing
    }

    return currentEditorTemplateData.editorTemplate
}

export const getLockedDiffModalDocuments = ({
    isApprovalView,
    state,
}: GetLockedDiffModalDocumentsParamsType): GetLockedDiffModalDocumentsReturnType => ({
    // In case previous override is not available we should send empty object which would be automatically handled since while parsing response we parse originalTemplate as empty object in that case
    unedited: state.publishedTemplateData.originalTemplate,
    edited:
        (isApprovalView
            ? state.draftTemplateData.originalTemplate
            : YAML.parse(
                  getCurrentTemplateWithLockedKeys({
                      currentEditorTemplateData: state.currentEditorTemplateData,
                      wasGuiOrHideLockedKeysEdited: state.wasGuiOrHideLockedKeysEdited,
                  }),
              )) ?? {},
})

export const getDeploymentTemplateResourceName = (environmentName: string): string => {
    if (environmentName) {
        return `${environmentName}-DeploymentTemplateOverride`
    }

    return PROTECT_BASE_DEPLOYMENT_TEMPLATE_IDENTIFIER_DTO
}

export const getAreTemplateChangesPresent = (state: DeploymentTemplateStateType): boolean => {
    const { currentEditorTemplateData, wasGuiOrHideLockedKeysEdited } = state

    if (!currentEditorTemplateData) {
        return false
    }

    if (currentEditorTemplateData.parsingError) {
        return true
    }

    const finalEditorValue = getCurrentTemplateWithLockedKeys({
        currentEditorTemplateData,
        wasGuiOrHideLockedKeysEdited,
    })

    const isEditorTemplateChanged = finalEditorValue !== currentEditorTemplateData.originalTemplateState.editorTemplate

    const isChartRefIdChanged =
        currentEditorTemplateData.selectedChartRefId !==
        currentEditorTemplateData.originalTemplateState.selectedChartRefId

    const areApplicationMetricsChanged =
        currentEditorTemplateData.isAppMetricsEnabled !==
        currentEditorTemplateData.originalTemplateState.isAppMetricsEnabled

    const isOverriddenStatusChanged =
        currentEditorTemplateData.isOverridden !== currentEditorTemplateData.originalTemplateState.isOverridden

    const isOverrideStrategyChanged =
        currentEditorTemplateData.mergeStrategy !== currentEditorTemplateData.originalTemplateState.mergeStrategy

    if (
        isEditorTemplateChanged ||
        isChartRefIdChanged ||
        areApplicationMetricsChanged ||
        isOverriddenStatusChanged ||
        isOverrideStrategyChanged
    ) {
        return true
    }

    return false
}

const getDryRunViewEditorState = ({
    state,
    isPublishedConfigPresent,
    isDeleteOverrideDraft,
}: GetDryRunViewEditorStateProps): DeploymentTemplateConfigState | DeploymentTemplateEditorDataStateType | null => {
    const {
        dryRunEditorMode,
        draftTemplateData,
        publishedTemplateData,
        currentEditorTemplateData,
        baseDeploymentTemplateData,
    } = state

    if (!draftTemplateData?.latestDraft) {
        return isPublishedConfigPresent || currentEditorTemplateData?.isOverridden
            ? currentEditorTemplateData
            : baseDeploymentTemplateData
    }

    if (dryRunEditorMode === DryRunEditorMode.PUBLISHED_VALUES) {
        return isPublishedConfigPresent ? publishedTemplateData : null
    }

    if (isDeleteOverrideDraft) {
        return baseDeploymentTemplateData
    }

    if (dryRunEditorMode === DryRunEditorMode.APPROVAL_PENDING) {
        return draftTemplateData
    }

    return currentEditorTemplateData
}

/**
 * Returns template state based on the current view in case of single editor and RHS editor value in case of compare view
 */
export const getCurrentEditorState = ({
    state,
    isPublishedConfigPresent,
    isDryRunView,
    isDeleteOverrideDraft,
    isInheritedView,
    isPublishedValuesView,
    showApprovalPendingEditorInCompareView,
}: GetCurrentEditorStateProps): ReturnType<typeof getDryRunViewEditorState> => {
    const { draftTemplateData, publishedTemplateData, currentEditorTemplateData, baseDeploymentTemplateData } = state

    if (isDryRunView) {
        return getDryRunViewEditorState({
            state,
            isPublishedConfigPresent,
            isDeleteOverrideDraft,
        })
    }

    if (isInheritedView) {
        return baseDeploymentTemplateData
    }

    if (isPublishedValuesView) {
        return isPublishedConfigPresent ? publishedTemplateData : null
    }

    if (showApprovalPendingEditorInCompareView) {
        return isDeleteOverrideDraft ? baseDeploymentTemplateData : draftTemplateData
    }

    /*  
        In case of compare view if we have delete override we don't show select at all so if isDeleteOverrideDraft is true, we would be
        showing the empty state
    */
    if (isDeleteOverrideDraft) {
        return null
    }

    return currentEditorTemplateData
}

/**
 * This method returns the editor value (un-resolved and with locked keys) based on the current view (In case of single editor) and RHS editor value (In case of compare view)
 */
export const getCurrentEditorPayloadForScopedVariables = ({
    state,
    isPublishedConfigPresent,
    isDryRunView,
    isDeleteOverrideDraft,
    isInheritedView,
    isPublishedValuesView,
    showApprovalPendingEditorInCompareView,
    shouldUseMergedTemplate,
}: GetCurrentEditorPayloadForScopedVariablesProps): string => {
    const { hideLockedKeys, wasGuiOrHideLockedKeysEdited } = state

    const currentEditorState = getCurrentEditorState({
        state,
        isPublishedConfigPresent,
        isDryRunView,
        isDeleteOverrideDraft,
        isInheritedView,
        isPublishedValuesView,
        showApprovalPendingEditorInCompareView,
    })

    if (!currentEditorState) {
        return ''
    }

    if (shouldUseMergedTemplate) {
        return currentEditorState.mergedTemplate
    }

    if (hideLockedKeys && !!(currentEditorState as DeploymentTemplateEditorDataStateType).removedPatches?.length) {
        try {
            const templateWithLockedKeys = getCurrentTemplateWithLockedKeys({
                currentEditorTemplateData: currentEditorState as DeploymentTemplateEditorDataStateType,
                wasGuiOrHideLockedKeysEdited,
            })
            return templateWithLockedKeys
        } catch {
            // Do nothing
        }
    }

    return currentEditorState.editorTemplate
}

export const getEnvOverrideEditorCommonState = ({
    id,
    status,
    manualReviewed,
    active,
    namespace,
    lockedConfigKeys,
    mergeStrategy: mergeStrategyFromParams,
    envOverridePatchValues: envOverridePatchValuesFromParams,
    mergedTemplateObject: mergedTemplateObjectFromParams,
    isOverridden,
}: Pick<
    OverriddenBaseDeploymentTemplateParsedDraftDTO,
    'id' | 'status' | 'manualReviewed' | 'active' | 'namespace' | 'mergeStrategy' | 'envOverridePatchValues'
> &
    Pick<EnvOverrideEditorCommonStateType, 'isOverridden'> & {
        lockedConfigKeys: string[]
        mergedTemplateObject: OverriddenBaseDeploymentTemplateParsedDraftDTO['envOverrideValues']
    }): EnvOverrideEditorCommonStateType => {
    const mergeStrategy = mergeStrategyFromParams || DEFAULT_MERGE_STRATEGY
    const envOverridePatchValues = envOverridePatchValuesFromParams || {}
    const mergedTemplateObject = mergedTemplateObjectFromParams || {}

    const isMergeStrategyPatch = mergeStrategy === OverrideMergeStrategyType.PATCH
    const originalTemplateObjectBasedOnStrategy = isMergeStrategyPatch ? envOverridePatchValues : mergedTemplateObject
    const originalTemplateObject = isOverridden ? originalTemplateObjectBasedOnStrategy : {}

    const stringifiedTemplate = YAMLStringify(originalTemplateObject, { simpleKeys: true })
    const { editorTemplate: editorTemplateWithoutLockedKeys } = getEditorTemplateAndLockedKeys(
        stringifiedTemplate,
        lockedConfigKeys,
    )

    const stringifiedFinalTemplate = YAMLStringify(mergedTemplateObject, { simpleKeys: true })

    return {
        originalTemplate: originalTemplateObject,
        editorTemplate: !Object.keys(originalTemplateObject).length ? '' : stringifiedTemplate,
        editorTemplateWithoutLockedKeys,
        environmentConfig: {
            id,
            status,
            manualReviewed,
            active,
            namespace,
        },
        mergeStrategy,
        mergedTemplate: stringifiedFinalTemplate,
        mergedTemplateObject,
        mergedTemplateWithoutLockedKeys: getEditorTemplateAndLockedKeys(stringifiedFinalTemplate, lockedConfigKeys)
            .editorTemplate,
        isLoadingMergedTemplate: false,
        mergedTemplateError: null,
        isOverridden,
    }
}

export const handleInitializeDraftData = ({
    latestDraft,
    guiSchema,
    chartRefsData,
    lockedConfigKeys,
    envId,
}: HandleInitializeDraftDataProps): DeploymentTemplateStateType['draftTemplateData'] => {
    if (!envId) {
        const {
            valuesOverride,
            id,
            refChartTemplate,
            refChartTemplateVersion,
            isAppMetricsEnabled,
            chartRefId,
            readme,
            schema,
        } = JSON.parse(latestDraft.data) as BaseDeploymentTemplateParsedDraftDTO

        const stringifiedTemplate = YAMLStringify(valuesOverride, { simpleKeys: true })
        const { editorTemplate: editorTemplateWithoutLockedKeys } = getEditorTemplateAndLockedKeys(
            stringifiedTemplate,
            lockedConfigKeys,
        )

        const response: DeploymentTemplateStateType['draftTemplateData'] = {
            originalTemplate: valuesOverride,
            schema,
            readme,
            guiSchema,
            isAppMetricsEnabled,
            chartConfig: { id, refChartTemplate, refChartTemplateVersion, chartRefId, readme },
            editorTemplate: stringifiedTemplate,
            latestDraft,
            selectedChartRefId: chartRefId,
            selectedChart: chartRefsData.charts.find((chart) => chart.id === chartRefId),
            editorTemplateWithoutLockedKeys,

            mergedTemplate: stringifiedTemplate,
            mergedTemplateObject: valuesOverride,
            mergedTemplateWithoutLockedKeys: editorTemplateWithoutLockedKeys,
            isLoadingMergedTemplate: false,
            mergedTemplateError: null,
        }

        return response
    }

    const {
        id,
        status,
        manualReviewed,
        active,
        namespace,
        envOverrideValues,
        mergeStrategy,
        envOverridePatchValues,

        isDraftOverriden,
        isAppMetricsEnabled,
        chartRefId,
        readme,
        schema,
    } = JSON.parse(latestDraft.data) as OverriddenBaseDeploymentTemplateParsedDraftDTO

    const response: DeploymentTemplateStateType['draftTemplateData'] = {
        ...getEnvOverrideEditorCommonState({
            id,
            status,
            manualReviewed,
            active,
            namespace,
            mergedTemplateObject: envOverrideValues,
            mergeStrategy,
            envOverridePatchValues,
            lockedConfigKeys,
            isOverridden: isDraftOverriden,
        }),

        schema,
        readme,
        guiSchema,
        isAppMetricsEnabled,
        latestDraft,
        selectedChartRefId: chartRefId,
        selectedChart: chartRefsData.charts.find((chart) => chart.id === chartRefId),
    }

    return response
}

export const getUpdateBaseDeploymentTemplatePayload = ({
    state,
    appId,
    skipReadmeAndSchema,
    isExpressEdit,
    resourceName,
}: {
    state: DeploymentTemplateStateType
    appId: number
    skipReadmeAndSchema: boolean
    isExpressEdit: boolean
    resourceName: string
}): UpdateBaseDTPayloadType => {
    const {
        currentEditorTemplateData,
        wasGuiOrHideLockedKeysEdited,
        lockedDiffModalState: { showLockedTemplateDiffModal },
    } = state

    const editorTemplate = getCurrentTemplateWithLockedKeys({
        currentEditorTemplateData,
        wasGuiOrHideLockedKeysEdited,
    })
    const editorTemplateObject: Record<string, string> = YAML.parse(editorTemplate)

    return {
        ...(currentEditorTemplateData.chartConfig.chartRefId === currentEditorTemplateData.selectedChart.id
            ? currentEditorTemplateData.chartConfig
            : {}),

        appId: +appId,
        chartRefId: currentEditorTemplateData.selectedChart.id,
        // NOTE: Ideally backend should not ask for this :/
        defaultAppOverride: currentEditorTemplateData.originalTemplate,
        isAppMetricsEnabled: currentEditorTemplateData.isAppMetricsEnabled,
        saveEligibleChanges: showLockedTemplateDiffModal,
        valuesOverride: editorTemplateObject,

        ...(!skipReadmeAndSchema
            ? {
                  id: currentEditorTemplateData.chartConfig.id,
                  readme: currentEditorTemplateData.readme,
                  schema: currentEditorTemplateData.schema,
              }
            : {}),

        isExpressEdit,
        resourceName,
    }
}

export const getDeleteProtectedOverridePayload = (
    state: DeploymentTemplateStateType,
    envId: number,
    skipReadmeAndSchema: boolean,
    resourceName: string,
): UpdateEnvironmentDTPayloadType => {
    const { baseDeploymentTemplateData, chartDetails, currentEditorTemplateData } = state

    return {
        environmentId: +envId,
        mergeStrategy: OverrideMergeStrategyType.PATCH,
        envOverrideValues: {},
        chartRefId: chartDetails.globalChartDetails.id,
        IsOverride: false,
        isAppMetricsEnabled: baseDeploymentTemplateData.isAppMetricsEnabled,
        saveEligibleChanges: false,
        ...(currentEditorTemplateData.environmentConfig.id > 0
            ? {
                  id: currentEditorTemplateData.environmentConfig.id,
                  status: currentEditorTemplateData.environmentConfig.status,
                  manualReviewed: true,
                  active: currentEditorTemplateData.environmentConfig.active,
                  namespace: currentEditorTemplateData.environmentConfig.namespace,
              }
            : {}),
        ...(!skipReadmeAndSchema
            ? {
                  id: currentEditorTemplateData.environmentConfig.id,
                  globalConfig: baseDeploymentTemplateData.originalTemplate,
                  isDraftOverriden: false,
                  readme: baseDeploymentTemplateData.readme,
                  schema: baseDeploymentTemplateData.schema,
              }
            : {}),
        resourceName,
    }
}

export const getUpdateEnvironmentDTPayload = (
    state: DeploymentTemplateStateType,
    envId: number,
    skipReadmeAndSchema: boolean,
    isExpressEdit: boolean,
    resourceName: string,
): UpdateEnvironmentDTPayloadType => {
    const {
        currentEditorTemplateData,
        lockedDiffModalState: { showLockedTemplateDiffModal },
        baseDeploymentTemplateData,
        wasGuiOrHideLockedKeysEdited,
    } = state

    const editorTemplate = getCurrentTemplateWithLockedKeys({
        currentEditorTemplateData,
        wasGuiOrHideLockedKeysEdited,
    })
    const editorTemplateObject: Record<string, string> = YAML.parse(editorTemplate)

    return {
        environmentId: +envId,
        chartRefId: currentEditorTemplateData.selectedChartRefId,
        // Since this is for published here it will always be overridden
        IsOverride: true,
        isAppMetricsEnabled: currentEditorTemplateData.isAppMetricsEnabled,
        saveEligibleChanges: showLockedTemplateDiffModal,

        ...(currentEditorTemplateData.environmentConfig.id > 0
            ? {
                  id: currentEditorTemplateData.environmentConfig.id,
                  status: currentEditorTemplateData.environmentConfig.status,
                  manualReviewed: true,
                  active: currentEditorTemplateData.environmentConfig.active,
                  namespace: currentEditorTemplateData.environmentConfig.namespace,
              }
            : {}),

        // This is the data which we suppose to send for draft we are creating
        ...(!skipReadmeAndSchema
            ? {
                  id: currentEditorTemplateData.environmentConfig.id,
                  globalConfig: baseDeploymentTemplateData.originalTemplate,
                  isDraftOverriden: currentEditorTemplateData.isOverridden,
                  readme: currentEditorTemplateData.readme,
                  schema: currentEditorTemplateData.schema,
              }
            : {}),

        mergeStrategy: currentEditorTemplateData.mergeStrategy,
        envOverrideValues: editorTemplateObject,
        isExpressEdit,
        resourceName,
    }
}

export const getCompareFromEditorConfig = ({
    envId,
    isDeleteOverrideDraft,
    isPublishedConfigPresent,
    showApprovalPendingEditorInCompareView,
    state,
}: GetCompareFromEditorConfigParams): Pick<CompareConfigViewProps, 'currentEditorConfig' | 'publishedEditorConfig'> => {
    const { draftTemplateData, currentEditorTemplateData, publishedTemplateData, baseDeploymentTemplateData } = state

    const userSelectionState = showApprovalPendingEditorInCompareView ? draftTemplateData : currentEditorTemplateData
    const currentEditorTemplateState = isDeleteOverrideDraft ? baseDeploymentTemplateData : userSelectionState

    const currentEditorConfig: CompareConfigViewProps['currentEditorConfig'] = {
        ...(envId &&
            isDeleteOverrideDraft && {
                isOverride: {
                    displayName: 'Configuration',
                    value: 'Inherit from base',
                },
            }),
        chartName: {
            displayName: 'Chart',
            value: currentEditorTemplateState?.selectedChart?.name,
        },
        chartVersion: {
            displayName: 'Version',
            value: currentEditorTemplateState?.selectedChart?.version,
        },
        ...(!!envId &&
            !isDeleteOverrideDraft && {
                mergeStrategy: {
                    displayName: 'Merge strategy',
                    value: currentEditorTemplateState?.mergeStrategy,
                },
            }),
        ...(!!window._env_.APPLICATION_METRICS_ENABLED && {
            applicationMetrics: {
                displayName: 'Application metrics',
                value: currentEditorTemplateState?.isAppMetricsEnabled ? 'Enabled' : 'Disabled',
            },
        }),
    }

    const publishedEditorConfig: CompareConfigViewProps['publishedEditorConfig'] = isPublishedConfigPresent
        ? {
              ...(!!envId &&
                  isDeleteOverrideDraft && {
                      isOverride: {
                          displayName: 'Configuration',
                          value: 'Overridden',
                      },
                  }),
              chartName: {
                  displayName: 'Chart',
                  value: publishedTemplateData?.selectedChart?.name,
              },
              chartVersion: {
                  displayName: 'Version',
                  value: publishedTemplateData?.selectedChart?.version,
              },
              ...(!!envId && {
                  mergeStrategy: {
                      displayName: 'Merge strategy',
                      value: publishedTemplateData?.mergeStrategy,
                  },
              }),
              ...(!!window._env_.APPLICATION_METRICS_ENABLED && {
                  applicationMetrics: {
                      displayName: 'Application metrics',
                      value: publishedTemplateData?.isAppMetricsEnabled ? 'Enabled' : 'Disabled',
                  },
              }),
          }
        : {}

    return {
        currentEditorConfig,
        publishedEditorConfig,
    }
}

export const parseDeploymentTemplateParams =
    (envId: string) =>
    (searchParams: URLSearchParams): DeploymentTemplateURLConfigType => {
        const urlConfigHeaderTab = searchParams.get('headerTab') as ConfigHeaderTabType

        if (!urlConfigHeaderTab) {
            return {
                headerTab: null,
            }
        }

        const validConfigHeaderTabList = envId
            ? CONFIG_HEADER_TAB_VALUES.OVERRIDE
            : CONFIG_HEADER_TAB_VALUES.BASE_DEPLOYMENT_TEMPLATE

        const isURLConfigHeaderTabValid = validConfigHeaderTabList.includes(urlConfigHeaderTab)

        return {
            headerTab: isURLConfigHeaderTabValid ? urlConfigHeaderTab : null,
        }
    }

export const getEditorSchemaURIFromChartNameAndVersion = (chartName: string, version: string): string => {
    if (!version || !chartName || !CHART_NAME_TO_DOC_SEGMENT[chartName]) {
        return null
    }

    return `https://github.com/devtron-labs/devtron/tree/main/scripts/devtron-reference-helm-charts/${CHART_NAME_TO_DOC_SEGMENT[chartName]}-chart_${version.replace(/\./g, '-')}/schema.json`
}

const getIsEditorStrategyPatch = (
    editorState: DeploymentTemplateConfigState | DeploymentTemplateEditorDataStateType,
): boolean => editorState?.isOverridden && editorState?.mergeStrategy === OverrideMergeStrategyType.PATCH

export const getEditorStatesWithPatchStrategy = (state: DeploymentTemplateStateType): ConfigEditorStatesType[] =>
    Object.values(ConfigEditorStatesType)
        .map((editorState) => {
            if (getIsEditorStrategyPatch(state[editorState])) {
                return editorState
            }

            return null
        })
        .filter(Boolean)
