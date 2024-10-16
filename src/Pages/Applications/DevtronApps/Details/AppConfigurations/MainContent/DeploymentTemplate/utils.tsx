import {
    applyCompareDiffOnUneditedDocument,
    DryRunEditorMode,
    getGuiSchemaFromChartName,
    ResponseType,
    YAMLStringify,
    logExceptionToSentry,
    DeploymentTemplateConfigState,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import YAML from 'yaml'
import {
    DeploymentTemplateEditorDataStateType,
    DeploymentTemplateStateType,
    GetCompareFromEditorConfigParams,
    GetCurrentEditorPayloadForScopedVariablesProps,
    GetCurrentEditorStateProps,
    GetDryRunViewEditorStateProps,
    GetLockConfigEligibleAndIneligibleChangesType,
    GetRawEditorValueForDryRunModeProps,
    HandleInitializeDraftDataProps,
    UpdateBaseDTPayloadType,
    UpdateEnvironmentDTPayloadType,
} from './types'
import { PROTECT_BASE_DEPLOYMENT_TEMPLATE_IDENTIFIER_DTO } from './constants'
import { DEFAULT_MERGE_STRATEGY } from '../constants'
import { CompareConfigViewProps } from '../types'

const removeLockedKeysFromYaml = importComponentFromFELibrary('removeLockedKeysFromYaml', null, 'function')
const reapplyRemovedLockedKeysToYaml = importComponentFromFELibrary('reapplyRemovedLockedKeysToYaml', null, 'function')
const getLockConfigEligibleAndIneligibleChanges: GetLockConfigEligibleAndIneligibleChangesType =
    importComponentFromFELibrary('getLockConfigEligibleAndIneligibleChanges', null, 'function')

export const makeObjectFromJsonPathArray = (index: number, paths: string[]) => {
    if (index >= paths.length) {
        return {
            'ui:widget': 'hidden',
        }
    }
    if (paths[index] === '$') {
        return makeObjectFromJsonPathArray(index + 1, paths)
    }
    const key = paths[index]
    const isKeyNumber = !Number.isNaN(Number(key))
    if (isKeyNumber) {
        return { items: makeObjectFromJsonPathArray(index + 1, paths) }
    }
    return { [key]: makeObjectFromJsonPathArray(index + 1, paths) }
}

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

    if (!removeLockedKeysFromYaml || !lockedConfigKeys.length) {
        return { editorTemplate: template, removedPatches }
    }

    try {
        const { document, addOperations } = removeLockedKeysFromYaml(template, lockedConfigKeys)
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
}: Pick<DeploymentTemplateStateType, 'currentEditorTemplateData' | 'wasGuiOrHideLockedKeysEdited'>): string => {
    const removedPatches = structuredClone(currentEditorTemplateData.removedPatches || [])

    if (!removedPatches.length || !reapplyRemovedLockedKeysToYaml) {
        return currentEditorTemplateData.editorTemplate
    }

    try {
        const originalDocument = currentEditorTemplateData.originalTemplate
        const parsedDocument = YAML.parse(currentEditorTemplateData.editorTemplate)

        const updatedEditorObject = reapplyRemovedLockedKeysToYaml(parsedDocument, removedPatches)

        if (wasGuiOrHideLockedKeysEdited) {
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

export const getLockedDiffModalDocuments = (isApprovalView: boolean, state: DeploymentTemplateStateType) => ({
    unedited: state.publishedTemplateData.originalTemplate,
    edited: isApprovalView
        ? state.draftTemplateData.originalTemplate
        : YAML.parse(
              getCurrentTemplateWithLockedKeys({
                  currentEditorTemplateData: state.currentEditorTemplateData,
                  wasGuiOrHideLockedKeysEdited: state.wasGuiOrHideLockedKeysEdited,
              }),
          ),
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

    // Question: In case of removed patches are not present we return currentEditorTemplateData.editorTemplate so should we make if-else of hideLockedKeys or is current implementation fine?
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

    if (isEditorTemplateChanged || isChartRefIdChanged || areApplicationMetricsChanged || isOverriddenStatusChanged) {
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
        return currentEditorTemplateData
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
 * This method returns the editor value (un-resolved and with locked keys) in case of dry run mode
 */
export const getRawEditorValueForDryRunMode = ({
    state,
    isPublishedConfigPresent,
    isDryRunView,
    isDeleteOverrideDraft,
}: GetRawEditorValueForDryRunModeProps): string => {
    if (!isDryRunView) {
        logExceptionToSentry(new Error('getRawEditorValueForDryRunMode called in non dry run mode'))
        return ''
    }

    // We don't have to worry about hideLockedKeys since, we are always showing locked keys in dry run mode
    return (
        getCurrentEditorState({
            state,
            isPublishedConfigPresent,
            isDeleteOverrideDraft,
            isDryRunView: true,
            isInheritedView: false,
            isPublishedValuesView: false,
            showApprovalPendingEditorInCompareView: false,
        })?.editorTemplate || ''
    )
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
        } = JSON.parse(latestDraft.data)

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
        }

        return response
    }

    const {
        envOverrideValues,
        id,
        isDraftOverriden,
        isAppMetricsEnabled,
        chartRefId,
        status,
        manualReviewed,
        active,
        namespace,
        readme,
        schema,
    } = JSON.parse(latestDraft.data)
    const stringifiedTemplate = YAMLStringify(envOverrideValues, { simpleKeys: true })
    const { editorTemplate: editorTemplateWithoutLockedKeys } = getEditorTemplateAndLockedKeys(
        stringifiedTemplate,
        lockedConfigKeys,
    )
    const response: DeploymentTemplateStateType['draftTemplateData'] = {
        originalTemplate: envOverrideValues,
        schema,
        readme,
        guiSchema,
        isAppMetricsEnabled,
        editorTemplate: stringifiedTemplate,
        latestDraft,
        selectedChartRefId: chartRefId,
        selectedChart: chartRefsData.charts.find((chart) => chart.id === chartRefId),
        editorTemplateWithoutLockedKeys,
        isOverridden: isDraftOverriden,
        environmentConfig: {
            id,
            status,
            manualReviewed,
            active,
            namespace,
        },
        mergeStrategy: DEFAULT_MERGE_STRATEGY,
    }

    return response
}

export const getUpdateBaseDeploymentTemplatePayload = (
    state: DeploymentTemplateStateType,
    appId: number,
    skipReadmeAndSchema: boolean,
): UpdateBaseDTPayloadType => {
    const {
        currentEditorTemplateData,
        wasGuiOrHideLockedKeysEdited,
        lockedDiffModalState: { showLockedTemplateDiffModal },
        lockedConfigKeysWithLockType,
    } = state

    const editorTemplate = getCurrentTemplateWithLockedKeys({
        currentEditorTemplateData,
        wasGuiOrHideLockedKeysEdited,
    })
    const editorTemplateObject: Record<string, string> = YAML.parse(editorTemplate)

    const baseRequestData = {
        ...(currentEditorTemplateData.chartConfig.chartRefId === currentEditorTemplateData.selectedChart.id
            ? currentEditorTemplateData.chartConfig
            : {}),

        appId: +appId,
        chartRefId: currentEditorTemplateData.selectedChart.id,
        // NOTE: Ideally backend should not ask for this :/
        defaultAppOverride: currentEditorTemplateData.originalTemplate,
        isAppMetricsEnabled: currentEditorTemplateData.isAppMetricsEnabled,
        saveEligibleChanges: showLockedTemplateDiffModal,

        ...(!skipReadmeAndSchema
            ? {
                  id: currentEditorTemplateData.chartConfig.id,
                  readme: currentEditorTemplateData.readme,
                  schema: currentEditorTemplateData.schema,
              }
            : {}),
    }

    if (showLockedTemplateDiffModal && getLockConfigEligibleAndIneligibleChanges) {
        // Question: In case of draft edit should we do this or approval as unedited?
        const { eligibleChanges } = getLockConfigEligibleAndIneligibleChanges({
            documents: getLockedDiffModalDocuments(false, state),
            lockedConfigKeysWithLockType,
        })

        return {
            ...baseRequestData,
            valuesOverride: eligibleChanges,
        }
    }

    return {
        ...baseRequestData,
        valuesOverride: editorTemplateObject,
    }
}

export const getDeleteProtectedOverridePayload = (
    state: DeploymentTemplateStateType,
    envId: number,
    skipReadmeAndSchema: boolean,
): UpdateEnvironmentDTPayloadType => {
    const { baseDeploymentTemplateData, chartDetails, currentEditorTemplateData } = state

    return {
        environmentId: +envId,
        envOverrideValues: baseDeploymentTemplateData.originalTemplate,
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
    }
}

export const getUpdateEnvironmentDTPayload = (
    state: DeploymentTemplateStateType,
    envId: number,
    skipReadmeAndSchema: boolean,
): UpdateEnvironmentDTPayloadType => {
    const {
        currentEditorTemplateData,
        lockedDiffModalState: { showLockedTemplateDiffModal },
        baseDeploymentTemplateData,
        lockedConfigKeysWithLockType,
        wasGuiOrHideLockedKeysEdited,
    } = state

    const editorTemplate = getCurrentTemplateWithLockedKeys({
        currentEditorTemplateData,
        wasGuiOrHideLockedKeysEdited,
    })
    const editorTemplateObject: Record<string, string> = YAML.parse(editorTemplate)

    const baseObject = {
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
    }

    if (showLockedTemplateDiffModal && getLockConfigEligibleAndIneligibleChanges) {
        const { eligibleChanges } = getLockConfigEligibleAndIneligibleChanges({
            documents: getLockedDiffModalDocuments(false, state),
            lockedConfigKeysWithLockType,
        })

        return {
            ...baseObject,
            envOverrideValues: eligibleChanges,
        }
    }

    return {
        ...baseObject,
        envOverrideValues: editorTemplateObject,
    }
}

export const getCompareFromEditorConfig = ({
    envId,
    isDeleteOverrideDraft,
    isPublishedConfigPresent,
    showApprovalPendingEditorInCompareView,
    state,
}: GetCompareFromEditorConfigParams): Pick<CompareConfigViewProps, 'currentEditorConfig' | 'publishedEditorConfig'> => {
    const { draftTemplateData, currentEditorTemplateData, publishedTemplateData } = state

    const templateState = showApprovalPendingEditorInCompareView ? draftTemplateData : currentEditorTemplateData

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
            value: templateState?.selectedChart?.name,
        },
        chartVersion: {
            displayName: 'Version',
            value: templateState?.selectedChart?.version,
        },
        ...(!!envId && {
            mergeStrategy: {
                displayName: 'Merge strategy',
                value: templateState?.mergeStrategy,
            },
        }),
        ...(!!window._env_.APPLICATION_METRICS_ENABLED && {
            applicationMetrics: {
                displayName: 'Application metrics',
                value: templateState?.isAppMetricsEnabled ? 'Enabled' : 'Disabled',
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
