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

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import YAML from 'yaml'
import { DeploymentTemplateProvider, Progressing, YAMLStringify, DeploymentConfigStateActionTypes, ConfigKeysWithLockType, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { compare as jsonpatchCompare, Operation } from 'fast-json-patch'
import { ReactComponent as WarningIcon } from '@Icons/ic-warning-y6.svg'
import { ReactComponent as InfoIcon } from '@Icons/ic-info-filled.svg'
import { FloatingVariablesSuggestions, importComponentFromFELibrary, useJsonYaml } from '../../common'
import { createDeploymentTemplate, updateDeploymentTemplate } from '../../../Pages/Shared/EnvironmentOverride/service'
import DeploymentTemplateOptionsTab from './DeploymentTemplateOptionsTab'
import DeploymentTemplateEditorView from './DeploymentTemplateEditorView'
import DeploymentConfigFormCTA from './DeploymentConfigFormCTA'
import { getIfLockedConfigProtected } from '../service'
import { DeleteOverrideDialog } from './DeploymentTemplateView.component'
import DeploymentTemplateReadOnlyEditorView from './DeploymentTemplateReadOnlyEditorView'
import DeploymentConfigToolbar from './DeploymentConfigToolbar'
import { handleConfigProtectionError } from '../DeploymentConfig.utils'
import { applyCompareDiffOfTempFormDataOnOriginalData } from '../utils'

const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar', DeploymentConfigToolbar)
const SaveChangesModal = importComponentFromFELibrary('SaveChangesModal')
const DeleteOverrideDraftModal = importComponentFromFELibrary('DeleteOverrideDraftModal')
const DeploymentTemplateLockedDiff = importComponentFromFELibrary('DeploymentTemplateLockedDiff')
const getLockedJSON = importComponentFromFELibrary('getLockedJSON', null, 'function')
const getUnlockedJSON = importComponentFromFELibrary('getUnlockedJSON', null, 'function')
const reapplyRemovedLockedKeysToYaml = importComponentFromFELibrary('reapplyRemovedLockedKeysToYaml', null, 'function')

export default function DeploymentTemplateOverrideForm({
    state,
    isConfigProtectionEnabled,
    environments,
    environmentName,
    reloadEnvironments,
    handleOverride,
    dispatch,
    initialise,
    handleAppMetrics,
    toggleDraftComments,
    isGrafanaModuleInstalled,
    isValuesOverride,
    setIsValuesOverride,
    groupedData,
    manifestDataRHS,
    manifestDataLHS,
    setManifestDataRHS,
    setManifestDataLHS,
    convertVariablesOverride,
    fetchEnvConfig,
}) {
    const [obj, , , error] = useJsonYaml(state.tempFormData, 4, 'yaml', true)
    const { appId, envId } = useParams<{ appId; envId }>()
    const readOnlyPublishedMode = state.selectedTabIndex === 1 && isConfigProtectionEnabled && !!state.latestDraft
    const [saveEligibleChangesCb, setSaveEligibleChangesCb] = useState(false)
    const [showLockedDiffForApproval, setShowLockedDiffForApproval] = useState(false)
    const [lockedConfigKeysWithLockType, setLockedConfigKeysWithLockType] = useState<ConfigKeysWithLockType>({
        config: [],
        allowed: false,
    })
    const [disableSaveEligibleChanges, setDisableSaveEligibleChanges] = useState(false)
    const [hideLockedKeys, setHideLockedKeys] = useState(false)
    const isGuiModeRef = useRef(state.yamlMode)
    const hideLockKeysToggled = useRef(false)
    const removedPatches = useRef<Array<Operation>>([])

    useEffect(() => {
        // Reset editor value on delete override action
        if (!state.duplicate && state.tempFormData) {
            editorOnChange('')
        }
    }, [state.duplicate])

    const handleUpdateRemovedPatches = (patches: Operation[]) => {
        removedPatches.current = patches
    }

    const handleSetHideLockedKeys = (value: boolean) => {
        if (!state.wasGuiOrHideLockedKeysEdited) {
            dispatch({ type: DeploymentConfigStateActionTypes.wasGuiOrHideLockedKeysEdited, payload: true })
        }
        // NOTE: since we are removing/patching for hide locked keys feature during the render
        // of EditorView, through getLockFilteredTemplate, we need to set the following ref to true
        // for hide logic to work. Therefore, whenever hideLockedKeys is changed we should update
        // the following ref to true. Internally getLockFilteredTemplate will set it to false.
        hideLockKeysToggled.current = true
        setHideLockedKeys(value)
    }

    const toggleSaveChangesModal = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleSaveChangesModal })
    }

    const toggleDeleteOverrideDraftModal = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleDeleteOverrideDraftModal })
    }

    const toggleYamlMode = (yamlMode: boolean) => {
        if (!state.yamlMode && yamlMode) {
            // NOTE: if we are on invalid yaml then this will fail thus wrapping it with try catch
            try {
                if (state.wasGuiOrHideLockedKeysEdited) {
                    applyCompareDiffOfTempFormDataOnOriginalData(
                        getCodeEditorValueForReadOnly(true),
                        getCodeEditorValue(false),
                        editorOnChange,
                    )
                }
            } catch {}
        }
        dispatch({
            type: DeploymentConfigStateActionTypes.yamlMode,
            payload: yamlMode,
        })
    }

    const setLoadingManifestOverride = (value: boolean) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.loadingManifestOverride,
            payload: value,
        })
    }

    const setConvertVariables = (value: boolean) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.convertVariablesOverride,
            payload: value,
        })
    }

    const prepareDataToSave = (includeInDraft?: boolean) => {
        // FIXME: duplicate is of type string while obj is of type object. Bad!!
        let valuesOverride = obj ?? state.duplicate

        const isValuesOverrideObject = typeof valuesOverride === 'object'
        const shouldReapplyRemovedLockedKeys = hideLockedKeys && isValuesOverrideObject

        if (shouldReapplyRemovedLockedKeys) {
            valuesOverride = reapplyRemovedLockedKeysToYaml(valuesOverride, removedPatches.current)
        }

        if (state.wasGuiOrHideLockedKeysEdited && isValuesOverrideObject) {
            valuesOverride = applyCompareDiffOfTempFormDataOnOriginalData(
                getCodeEditorValueForReadOnly(true),
                YAMLStringify(valuesOverride),
                // NOTE: if shouldReapplyRemovedLockedKeys is true we don't want to save these changes to state.tempFormData
                // thus sending in null; because in this case we are reapply only to make the payload for save
                shouldReapplyRemovedLockedKeys ? null : editorOnChange,
            )
        }

        if (state.showLockedTemplateDiff) {
            const edited = YAML.parse(state.tempFormData)
            const unedited = YAML.parse(getCodeEditorValueForReadOnly(true))
            const documentsNPatches = {
                edited,
                unedited,
                patches: jsonpatchCompare(unedited, edited),
            }
            if (!lockedConfigKeysWithLockType.allowed) {
                valuesOverride = getUnlockedJSON(documentsNPatches, lockedConfigKeysWithLockType.config)
            } else {
                valuesOverride = getLockedJSON(documentsNPatches, lockedConfigKeysWithLockType.config)
            }
        }
        const payload = {
            environmentId: +envId,
            envOverrideValues: valuesOverride,
            chartRefId: state.selectedChartRefId,
            IsOverride: true,
            isAppMetricsEnabled: state.latestDraft ? state.isAppMetricsEnabled : state.data.appMetrics,
            saveEligibleChanges: saveEligibleChangesCb,
            ...(state.data.environmentConfig.id > 0
                ? {
                      id: state.data.environmentConfig.id,
                      status: state.data.environmentConfig.status,
                      manualReviewed: true,
                      active: state.data.environmentConfig.active,
                      namespace: state.data.environmentConfig.namespace,
                  }
                : {}),
        }

        if (includeInDraft) {
            payload['id'] = state.data.environmentConfig.id
            payload['globalConfig'] = state.data.globalConfig
            payload['isDraftOverriden'] = state.isDraftOverriden
            payload['readme'] = state.readme
            payload['schema'] = state.schema
        }

        return payload
    }

    const closeLockedDiffDrawerWithChildModal = () => {
        state.showSaveChangesModal && toggleSaveChangesModal()
        handleLockedDiffDrawer(false)
        setSaveEligibleChangesCb(false)
    }

    const handleLockedDiffDrawer = (value) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.toggleShowLockedTemplateDiff,
            payload: value,
        })
    }

    const checkForSaveAsDraft = () => {
        if (!obj && state.yamlMode) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: error,
            })
        } else if (isConfigProtectionEnabled) {
            toggleSaveChangesModal()
        }
    }

    const handleSaveChanges = (e) => {
        e.preventDefault()
        handleSubmit(false)
    }

    const handleChangeCheckbox = () => {
        if (!saveEligibleChangesCb) {
            checkForSaveAsDraft()
        } else {
            state.showSaveChangesModal && toggleSaveChangesModal()
        }
        setSaveEligibleChangesCb(!saveEligibleChangesCb)
    }

    const checkForProtectedLockedChanges = async () => {
        const data = prepareDataToSaveDraft()
        const action = data['id'] > 0 ? 2 : 1
        const requestPayload = {
            appId: Number(appId),
            envId: Number(envId),
            action,
            data: JSON.stringify(data),
        }
        return await getIfLockedConfigProtected(requestPayload)
    }

    // TODO: derived state of saveEligibleChanges
    const handleSubmit = async (saveEligibleChanges: boolean = false) => {
        const api =
            state.data.environmentConfig && state.data.environmentConfig.id > 0
                ? updateDeploymentTemplate
                : createDeploymentTemplate

        try {
            if (saveEligibleChanges) {
                dispatch({ type: DeploymentConfigStateActionTypes.loading, payload: true })
            } else {
                // loading state for checking locked changes
                dispatch({ type: DeploymentConfigStateActionTypes.lockChangesLoading, payload: true })
            }
            const payload = prepareDataToSave(false)
            const deploymentTemplateResp = isConfigProtectionEnabled
                ? await checkForProtectedLockedChanges()
                : await api(+appId, +envId, payload)
            if (deploymentTemplateResp.result.isLockConfigError && !saveEligibleChanges) {
                // checking if any locked changes and opening drawer to show eligible and locked ones
                setDisableSaveEligibleChanges(deploymentTemplateResp.result?.disableSaveEligibleChanges)
                handleLockedDiffDrawer(true)
                return
            }
            if (isConfigProtectionEnabled) {
                toggleSaveChangesModal()
                return
            }

            const data = obj || state.duplicate
            if (data) {
                editorOnChange(YAMLStringify(data))
            } else {
                dispatch({
                    type: DeploymentConfigStateActionTypes.tempFormData,
                    payload: YAMLStringify(deploymentTemplateResp.result.envOverrideValues),
                })
            }
            ToastManager.showToast({
                variant: ToastVariantType.success,
                title:
                    state.data.environmentConfig && state.data.environmentConfig.id > 0
                        ? 'Updated override'
                        : 'Overridden',
                description: 'Changes will be reflected after next deployment.',
            })
            // Resetting the fetchedValues and fetchedValuesManifest caches to avoid showing the old data
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: { fetchedValues: {}, fetchedValuesManifest: {} },
            })
            initialise(null, false, true)
            fetchEnvConfig(envId)
        } catch (err) {
            handleConfigProtectionError(2, err, dispatch, reloadEnvironments)
        } finally {
            if (saveEligibleChanges) {
                // closing drawer if selected save eligible changes
                handleLockedDiffDrawer(false)
            }
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: {
                    loading: false,
                    lockChangesLoading: false,
                },
            })
        }
    }

    const changeEditorMode = (): void => {
        hideLockKeysToggled.current = true
        toggleYamlMode(!state.yamlMode)
    }

    const isCompareAndApprovalState =
        state.selectedTabIndex === 2 && !state.showReadme && state.latestDraft?.draftState === 4

    const editorOnChange = (str: string): void => {
        if (isCompareAndApprovalState) {
            return
        }

        if (isValuesOverride && !convertVariablesOverride) {
            dispatch({
                type: DeploymentConfigStateActionTypes.tempFormData,
                payload: str,
            })
        }
        try {
            // Unset unableToParseYaml flag when yaml is successfully parsed
            const _ = YAML.parse(str)
            dispatch({
                type: DeploymentConfigStateActionTypes.unableToParseYaml,
                payload: false,
            })
        } catch (error) {
            // Set unableToParseYaml flag when yaml is malformed
            if (!isValuesOverride) {
                return
            } // Don't set unableToParseYaml flag when in manifest view
            dispatch({
                type: DeploymentConfigStateActionTypes.unableToParseYaml,
                payload: true,
            })
        }
    }

    const handleReadMeClick = () => {
        if (!state.showReadme && state.unableToParseYaml) {
            return
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: {
                showReadme: !state.showReadme,
                openComparison: state.showReadme && state.selectedTabIndex === 2,
            },
        })
        hideLockKeysToggled.current = true
    }

    const handleComparisonClick = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: { openComparison: !state.openComparison, showReadme: false },
        })
    }

    const handleTabSelection = (index: number) => {
        // setting true to update codeditor values with current locked keys checkbox value
        if (state.selectedTabIndex !== index) {
            hideLockKeysToggled.current = true
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.selectedTabIndex,
            payload: index,
        })

        setConvertVariables(false)

        // NOTE: if we are on invalid yaml then this will fail thus wrapping it with try catch
        try {
            if (state.wasGuiOrHideLockedKeysEdited) {
                applyCompareDiffOfTempFormDataOnOriginalData(
                    getCodeEditorValueForReadOnly(true),
                    getCodeEditorValue(false),
                    editorOnChange,
                )
            }
        } catch {}

        switch (index) {
            case 1:
            case 3:
                setIsValuesOverride(true)
                if (state.selectedTabIndex === 2) {
                    handleComparisonClick()
                    toggleYamlMode(isGuiModeRef.current)
                }
                break
            case 2:
                if (state.selectedTabIndex !== 2) {
                    isGuiModeRef.current = state.yamlMode
                }
                if (!state.openComparison) {
                    if (!state.yamlMode) {
                        if ((!state.latestDraft && state.selectedTabIndex === 1) || state.selectedTabIndex === 3) {
                            changeEditorMode()
                        } else {
                            toggleYamlMode(true)
                        }
                    }
                    handleComparisonClick()
                }
                break
            default:
                break
        }
    }

    const isPublishedOverridden = readOnlyPublishedMode
        ? state.publishedState.isOverride
        : state.latestDraft?.action === 3
          ? state.isDraftOverriden
          : !!state.duplicate
    const overridden = state.publishedState ? isPublishedOverridden : !!state.duplicate
    const getOverrideActionState = () => {
        if (state.loading) {
            return <Progressing />
        }
        if (overridden) {
            return 'Delete override'
        }
        return 'Allow override'
    }

    const renderOverrideInfoStrip = () => (
        <div
            className={`flex dc__content-space fs-12 fw-6 lh-20 h-32 pl-16 pr-16 dc__border-bottom ${
                overridden ? 'bcy-1' : 'bcb-1'
            }`}
        >
            <div className="flex left dc__gap-8">
                {overridden ? <WarningIcon className="icon-dim-16" /> : <InfoIcon className="icon-dim-16" />}
                <span data-testid="env-override-title">
                    {overridden
                        ? 'Base configurations are overridden for this file'
                        : 'This file is inheriting base configurations'}
                </span>
            </div>
            {(!state.publishedState ||
                (state.selectedTabIndex !== 1 && !!state.latestDraft && state.publishedState.isOverride)) && (
                <span
                    data-testid={`action-override-${overridden ? 'delete' : 'allow'}`}
                    className={`cursor ${overridden ? 'cr-5' : 'cb-5'}`}
                    onClick={handleOverride}
                >
                    {getOverrideActionState()}
                </span>
            )}
        </div>
    )

    const prepareDataToSaveDraft = () => {
        return prepareDataToSave(true)
    }

    const prepareDataToDeleteOverrideDraft = () => prepareDataToSave(true)

    const getCodeEditorValueForReadOnly = (fetchUnEdited?: boolean) => {
        if (state.publishedState) {
            if (
                state.publishedState.isOverride &&
                (state.selectedCompareOption?.environmentId !== -1 || state.selectedTabIndex === 1)
            ) {
                return YAMLStringify(state.publishedState.environmentConfig.envOverrideValues)
            }
        } else if (
            (state.selectedCompareOption?.environmentId === Number(envId) || fetchUnEdited) &&
            state.data.environmentConfig.envOverrideValues
        ) {
            return YAMLStringify(state.data.environmentConfig.envOverrideValues)
        }

        return YAMLStringify(state.data.globalConfig)
    }

    const getCodeEditorValue = (readOnlyPublishedMode: boolean, notTempFormData = false) => {
        let codeEditorValue = ''
        if (readOnlyPublishedMode) {
            codeEditorValue = getCodeEditorValueForReadOnly()
        } else if (isCompareAndApprovalState) {
            codeEditorValue =
                state.latestDraft?.action !== 3 || state.showDraftOverriden
                    ? state.draftValues
                    : YAMLStringify(state.data.globalConfig)
        } else if (state.tempFormData && !notTempFormData) {
            codeEditorValue = state.tempFormData
        } else {
            const isOverridden = state.latestDraft?.action === 3 ? state.isDraftOverriden : !!state.duplicate
            codeEditorValue = isOverridden ? YAMLStringify(state.duplicate) : YAMLStringify(state.data.globalConfig)
        }

        return codeEditorValue
    }

    const reload = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: {
                loading: true,
                tempFormData: '',
                duplicate: '',
            },
        })
        initialise(state.selectedChartRefId, true, false)
        fetchEnvConfig(envId)
    }

    function renderEditorComponent() {
        if (readOnlyPublishedMode && !state.showReadme) {
            return (
                <DeploymentTemplateReadOnlyEditorView
                    value={isValuesOverride ? getCodeEditorValue(true) : manifestDataRHS}
                    isEnvOverride
                    lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                    hideLockedKeys={hideLockedKeys}
                    uneditedDocument={isValuesOverride ? getCodeEditorValue(true) : manifestDataRHS}
                    editedDocument={isValuesOverride ? getCodeEditorValue(true) : manifestDataRHS}
                />
            )
        }
        if (state.loadingManifestOverride) {
            return (
                <div className="h-100vh">
                    <Progressing pageLoader />
                </div>
            )
        }
        return (
            <DeploymentTemplateEditorView
                isEnvOverride
                value={isValuesOverride ? getCodeEditorValue(false) : manifestDataRHS}
                defaultValue={
                    state.data && state.openComparison
                        ? isValuesOverride
                            ? getCodeEditorValue(true)
                            : manifestDataLHS
                        : ''
                }
                editorOnChange={editorOnChange}
                environmentName={environmentName}
                readOnly={
                    !state.duplicate ||
                    isCompareAndApprovalState ||
                    !overridden ||
                    !isValuesOverride ||
                    convertVariablesOverride
                }
                uneditedDocument={getCodeEditorValue(false, true)}
                // FIXME: make sure that the value did not change from hide locked keys logic
                editedDocument={getCodeEditorValue(false)}
                globalChartRefId={state.data.globalChartRefId}
                handleOverride={handleOverride}
                isValues={isValuesOverride}
                convertVariables={convertVariablesOverride}
                setConvertVariables={setConvertVariables}
                groupedData={groupedData}
                hideLockedKeys={hideLockedKeys}
                lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                hideLockKeysToggled={hideLockKeysToggled}
                removedPatches={removedPatches}
            />
        )
    }

    const clusterId = useMemo(
        () => environments.find((env) => env.environmentId === Number(envId))?.clusterId,
        [environments, envId],
    )

    const renderValuesView = () => (
        <div
            className={`deployment-template-override-form h-100 ${state.openComparison ? 'comparison-view' : ''} ${
                state.showReadme ? 'readme-view' : ''
            }`}
        >
            {window._env_.ENABLE_SCOPED_VARIABLES && (
                <div className="variables-widget-position">
                    <FloatingVariablesSuggestions
                        zIndex={1004}
                        appId={appId}
                        envId={envId}
                        clusterId={clusterId}
                        hideObjectVariables={false}
                    />
                </div>
            )}

            <DeploymentTemplateOptionsTab
                isEnvOverride
                disableVersionSelect={readOnlyPublishedMode || !state.duplicate}
                isValues={isValuesOverride}
            />
            {renderEditorComponent()}
            <DeploymentConfigFormCTA
                loading={state.loading || state.chartConfigLoading || state.lockChangesLoading}
                isEnvOverride
                disableButton={!state.duplicate}
                disableCheckbox={!state.duplicate}
                showAppMetricsToggle={
                    state.charts &&
                    state.selectedChart &&
                    window._env_?.APPLICATION_METRICS_ENABLED &&
                    isGrafanaModuleInstalled &&
                    state.yamlMode
                }
                isAppMetricsEnabled={
                    !!state.latestDraft && state.selectedTabIndex !== 1
                        ? state.isAppMetricsEnabled
                        : state.data.appMetrics
                }
                toggleAppMetrics={handleAppMetrics}
                isPublishedMode={readOnlyPublishedMode}
                reload={reload}
                isValues={isValuesOverride}
                convertVariables={convertVariablesOverride}
                handleLockedDiffDrawer={handleLockedDiffDrawer}
                setShowLockedDiffForApproval={setShowLockedDiffForApproval}
                checkForProtectedLockedChanges={checkForProtectedLockedChanges}
                showLockedDiffForApproval={showLockedDiffForApproval}
                handleSaveChanges={handleSaveChanges}
            />
        </div>
    )

    const getValueForContext = () => ({
        isUnSet: false,
        state,
        dispatch,
        isConfigProtectionEnabled,
        environments: environments || [],
        changeEditorMode,
        reloadEnvironments,
        // TODO: Replace from useURLFilters
        handleDisableResolveScopedVariables: () => {},
        lockedConfigKeysWithLockType,
        handleUpdateRemovedPatches,
        removedPatches,
    })

    return (
        <DeploymentTemplateProvider value={getValueForContext()}>
            <ConfigToolbar
                loading={state.loading || state.chartConfigLoading}
                draftId={state.latestDraft?.draftId}
                draftVersionId={state.latestDraft?.draftVersionId}
                selectedTabIndex={state.selectedTabIndex}
                handleTabSelection={handleTabSelection}
                noReadme={!state.yamlMode}
                showReadme={state.showReadme}
                isReadmeAvailable={!!state.data.readme}
                handleReadMeClick={handleReadMeClick}
                handleCommentClick={toggleDraftComments}
                commentsPresent={state.latestDraft?.commentsCount > 0}
                isDraftMode={isConfigProtectionEnabled && !!state.latestDraft}
                isApprovalPending={state.latestDraft?.draftState === 4}
                approvalUsers={state.latestDraft?.approvers}
                showValuesPostfix
                reload={reload}
                isValues={isValuesOverride}
                setIsValues={setIsValuesOverride}
                convertVariables={convertVariablesOverride}
                setConvertVariables={setConvertVariables}
                componentType={3}
                setShowLockedDiffForApproval={setShowLockedDiffForApproval}
                setLockedConfigKeysWithLockType={setLockedConfigKeysWithLockType}
                lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                setHideLockedKeys={handleSetHideLockedKeys}
                hideLockedKeys={hideLockedKeys}
                hideLockKeysToggled={hideLockKeysToggled}
                inValidYaml={state.unableToParseYaml}
                appId={appId}
                envId={envId}
            />
            {state.selectedTabIndex !== 2 && !state.showReadme && renderOverrideInfoStrip()}
            {renderValuesView()}
            {state.dialog && <DeleteOverrideDialog appId={appId} envId={envId} initialise={initialise} />}
            {SaveChangesModal && state.showSaveChangesModal && (
                <SaveChangesModal
                    appId={Number(appId)}
                    envId={Number(envId)}
                    resourceType={3}
                    resourceName={`${environmentName}-DeploymentTemplateOverride`}
                    prepareDataToSave={prepareDataToSaveDraft}
                    toggleModal={toggleSaveChangesModal}
                    latestDraft={state.latestDraft}
                    reload={reload}
                    closeLockedDiffDrawerWithChildModal={closeLockedDiffDrawerWithChildModal}
                    showAsModal={!state.showLockedTemplateDiff}
                    saveEligibleChangesCb={saveEligibleChangesCb}
                />
            )}
            {DeleteOverrideDraftModal && state.showDeleteOverrideDraftModal && (
                <DeleteOverrideDraftModal
                    appId={Number(appId)}
                    envId={Number(envId)}
                    resourceType={3}
                    resourceName={`${environmentName}-DeploymentTemplateOverride`}
                    prepareDataToSave={prepareDataToDeleteOverrideDraft}
                    toggleModal={toggleDeleteOverrideDraftModal}
                    latestDraft={state.latestDraft}
                    reload={reload}
                />
            )}
            {DeploymentTemplateLockedDiff && state.showLockedTemplateDiff && (
                <DeploymentTemplateLockedDiff
                    closeModal={closeLockedDiffDrawerWithChildModal}
                    showLockedDiffForApproval={showLockedDiffForApproval}
                    onSave={handleSubmit}
                    documents={{
                        edited: reapplyRemovedLockedKeysToYaml(
                            YAML.parse(getCodeEditorValue(false)),
                            removedPatches.current,
                        ),
                        unedited: YAML.parse(getCodeEditorValueForReadOnly(true)),
                    }}
                    lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                    disableSaveEligibleChanges={disableSaveEligibleChanges}
                    setLockedConfigKeysWithLockType={setLockedConfigKeysWithLockType}
                    appId={appId}
                    envId={envId}
                />
            )}
        </DeploymentTemplateProvider>
    )
}
