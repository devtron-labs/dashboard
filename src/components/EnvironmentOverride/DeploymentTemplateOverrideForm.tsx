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

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import YAML from 'yaml'
import { Progressing, YAMLStringify, getLockedJSON, getUnlockedJSON } from '@devtron-labs/devtron-fe-common-lib'
import * as jsonpatch from 'fast-json-patch'
import { FloatingVariablesSuggestions, importComponentFromFELibrary, useJsonYaml } from '../common'
import { ConfigKeysWithLockType, DeploymentConfigStateActionTypes } from '../deploymentConfig/types'
import { createDeploymentTemplate, updateDeploymentTemplate } from './service'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning-y6.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/ic-info-filled.svg'
import DeploymentTemplateOptionsTab from '../deploymentConfig/DeploymentTemplateView/DeploymentTemplateOptionsTab'
import DeploymentTemplateEditorView from '../deploymentConfig/DeploymentTemplateView/DeploymentTemplateEditorView'
import DeploymentConfigFormCTA from '../deploymentConfig/DeploymentTemplateView/DeploymentConfigFormCTA'
import { DeploymentConfigContext } from '../deploymentConfig/DeploymentConfig'
import { getDeploymentManisfest, getIfLockedConfigProtected } from '../deploymentConfig/service'
import { DeleteOverrideDialog } from '../deploymentConfig/DeploymentTemplateView/DeploymentTemplateView.component'
import DeploymentTemplateReadOnlyEditorView from '../deploymentConfig/DeploymentTemplateView/DeploymentTemplateReadOnlyEditorView'
import DeploymentConfigToolbar from '../deploymentConfig/DeploymentTemplateView/DeploymentConfigToolbar'
import { handleConfigProtectionError } from '../deploymentConfig/DeploymentConfig.utils'
import CodeEditor from '../CodeEditor/CodeEditor'

const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar', DeploymentConfigToolbar)
const SaveChangesModal = importComponentFromFELibrary('SaveChangesModal')
const DeleteOverrideDraftModal = importComponentFromFELibrary('DeleteOverrideDraftModal')
const DeploymentTemplateLockedDiff = importComponentFromFELibrary('DeploymentTemplateLockedDiff')
const applyPatches = importComponentFromFELibrary('applyPatches', null, 'function')

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
    isEnterpriseInstallation,
    isValuesOverride,
    setIsValuesOverride,
    groupedData,
    manifestDataRHS,
    manifestDataLHS,
    setManifestDataRHS,
    setManifestDataLHS,
    convertVariablesOverride,
    isSuperAdmin,
}) {
    const [obj, , , error] = useJsonYaml(state.tempFormData, 4, 'yaml', true)
    const { appId, envId } = useParams<{ appId; envId }>()
    const readOnlyPublishedMode = state.selectedTabIndex === 1 && isConfigProtectionEnabled && !!state.latestDraft
    const [saveEligibleChangesCb, setSaveEligibleChangesCb] = useState(false)
    const [showLockedDiffForApproval, setShowLockedDiffForApproval] = useState(false)
    const [lockedOverride, setLockedOverride] = useState({})
    const [lockedConfigKeysWithLockType, setLockedConfigKeysWithLockType] = useState<ConfigKeysWithLockType>({
        config: [],
        allowed: false,
    })
    const [disableSaveEligibleChanges, setDisableSaveEligibleChanges] = useState(false)
    const [hideLockedKeys, setHideLockedKeys] = useState(false)
    const isGuiModeRef = useRef(state.yamlMode)
    const hideLockKeysToggled = useRef(false)
    const removedPatches = useRef<Array<jsonpatch.Operation>>([])

    useEffect(() => {
        // Reset editor value on delete override action
        if (!state.duplicate && state.tempFormData) {
            editorOnChange('')
        }
    }, [state.duplicate])

    const toggleSaveChangesModal = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleSaveChangesModal })
    }

    const toggleDeleteOverrideDraftModal = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleDeleteOverrideDraftModal })
    }

    const toggleYamlMode = (yamlMode: boolean) => {
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
        let valuesOverride = obj || state.duplicate

        if (applyPatches && hideLockedKeys) {
            valuesOverride = applyPatches(valuesOverride, removedPatches.current)
        }

        if (state.showLockedTemplateDiff) {
            // if locked keys
            if (!lockedConfigKeysWithLockType.allowed) {
                valuesOverride = getUnlockedJSON(lockedOverride, lockedConfigKeysWithLockType.config, true).newDocument
            } else {
                // if allowed keys
                valuesOverride = getLockedJSON(lockedOverride, lockedConfigKeysWithLockType.config)
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
            toast.error(error)
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
                setLockedOverride(deploymentTemplateResp.result?.lockedOverride)
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
            toast.success(
                <div className="toast">
                    <div className="toast__title">
                        {state.data.environmentConfig && state.data.environmentConfig.id > 0
                            ? 'Updated override'
                            : 'Overridden'}
                    </div>
                    <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                </div>,
                { autoClose: null },
            )
            // Resetting the fetchedValues and fetchedValuesManifest caches to avoid showing the old data
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: { fetchedValues: {}, fetchedValuesManifest: {} },
            })
            initialise(null, false, true)
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
        if (state.unableToParseYaml) {
            return
        }

        // setting true to update codeditor values with current locked keys checkbox value
        hideLockKeysToggled.current = true

        dispatch({
            type: DeploymentConfigStateActionTypes.selectedTabIndex,
            payload: index,
        })

        setConvertVariables(false)

        switch (index) {
            case 1:
            case 3:
                setIsValuesOverride(true)
                toggleYamlMode(isGuiModeRef.current)
                if (state.selectedTabIndex === 2) {
                    handleComparisonClick()
                }
                break
            case 2:
                isGuiModeRef.current = state.yamlMode
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

    const getCodeEditorValueForReadOnly = () => {
        if (state.publishedState) {
            if (
                state.publishedState.isOverride &&
                (state.selectedCompareOption?.id !== -1 || state.selectedTabIndex === 1)
            ) {
                return YAMLStringify(state.publishedState.environmentConfig.envOverrideValues)
            }
        } else if (
            state.selectedCompareOption?.id === Number(envId) &&
            state.data.environmentConfig.envOverrideValues
        ) {
            return YAMLStringify(state.data.environmentConfig.envOverrideValues)
        }

        return YAMLStringify(state.data.globalConfig)
    }

    useEffect(() => {
        if (isValuesOverride) {
            return
        }
        const values = Promise.all([getCodeEditorManifestValue(false), getCodeEditorManifestValue(true)])
        setLoadingManifestOverride(true)
        values
            .then((res) => {
                const [_manifestDataRHS, _manifestDataLHS] = res
                setManifestDataRHS(_manifestDataRHS)
                setManifestDataLHS(_manifestDataLHS)
            })
            .catch((err) => {
                toast.error('Failed to fetch manifest data')
                setIsValuesOverride(true)
            })
            .finally(() => {
                setLoadingManifestOverride(false)
            })
    }, [isValuesOverride])

    const getCodeEditorManifestValue = async (readOnlyPublishedMode: boolean) => {
        let codeEditorValue = ''
        if (readOnlyPublishedMode) {
            const readOnlyData = getCodeEditorValueForReadOnly()
            codeEditorValue = readOnlyData
        } else if (isCompareAndApprovalState) {
            codeEditorValue =
                state.latestDraft?.action !== 3 || state.showDraftOverriden
                    ? state.draftValues
                    : YAMLStringify(state.data.globalConfig)
        } else if (state.tempFormData) {
            codeEditorValue = state.tempFormData
            if (applyPatches && hideLockedKeys) {
                codeEditorValue = YAMLStringify(applyPatches(YAML.parse(state.tempFormData), removedPatches.current))
            }
        } else {
            const isOverridden = state.latestDraft?.action === 3 ? state.isDraftOverriden : !!state.duplicate
            codeEditorValue = isOverridden ? YAMLStringify(state.duplicate) : YAMLStringify(state.data.globalConfig)
        }
        const manifestEditorValue = await fetchManifestData(codeEditorValue)
        return manifestEditorValue
    }

    const getCodeEditorValue = (readOnlyPublishedMode: boolean) => {
        let codeEditorValue = ''
        if (readOnlyPublishedMode) {
            codeEditorValue = getCodeEditorValueForReadOnly()
        } else if (isCompareAndApprovalState) {
            codeEditorValue =
                state.latestDraft?.action !== 3 || state.showDraftOverriden
                    ? state.draftValues
                    : YAMLStringify(state.data.globalConfig)
        } else if (state.tempFormData) {
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
    }

    const fetchManifestData = async (data) => {
        const request = {
            appId: +appId,
            envId: +envId,
            chartRefId: state.selectedChartRefId,
            valuesAndManifestFlag: 2,
            values: data,
        }
        setLoadingManifestOverride(true)
        const response = await getDeploymentManisfest(request)
        setLoadingManifestOverride(false)
        return response.result.data
    }

    function renderEditorComponent() {
        if (readOnlyPublishedMode && !state.showReadme) {
            return (
                <DeploymentTemplateReadOnlyEditorView
                    value={isValuesOverride ? getCodeEditorValue(true) : manifestDataRHS}
                    isEnvOverride
                    lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                    hideLockedKeys={hideLockedKeys}
                    removedPatches={removedPatches}
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
                    <FloatingVariablesSuggestions zIndex={1004} appId={appId} envId={envId} clusterId={clusterId} hideObjectVariables={false} />
                </div>
            )}

            <DeploymentTemplateOptionsTab
                isEnvOverride
                disableVersionSelect={readOnlyPublishedMode || !state.duplicate}
                codeEditorValue={isValuesOverride ? getCodeEditorValue(readOnlyPublishedMode) : manifestDataRHS}
                hideLockedKeys={hideLockedKeys}
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
                isSuperAdmin={isSuperAdmin}
                checkForProtectedLockedChanges={checkForProtectedLockedChanges}
                showLockedDiffForApproval={showLockedDiffForApproval}
                setLockedOverride={setLockedOverride}
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
    })

    return (
        <DeploymentConfigContext.Provider value={getValueForContext()}>
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
                setHideLockedKeys={setHideLockedKeys}
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
                    CodeEditor={CodeEditor}
                    closeModal={closeLockedDiffDrawerWithChildModal}
                    handleChangeCheckbox={handleChangeCheckbox}
                    saveEligibleChangesCb={saveEligibleChangesCb}
                    showLockedDiffForApproval={showLockedDiffForApproval}
                    onSave={handleSubmit}
                    lockedOverride={lockedOverride}
                    lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                    disableSaveEligibleChanges={disableSaveEligibleChanges}
                    setLockedConfigKeysWithLockType={setLockedConfigKeysWithLockType}
                    appId={appId}
                    envId={envId}
                />
            )}
        </DeploymentConfigContext.Provider>
    )
}
