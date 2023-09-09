import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import YAML from 'yaml'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary, useJsonYaml } from '../common'
import { DeploymentConfigStateActionTypes } from '../deploymentConfig/types'
import { EDITOR_VIEW } from '../deploymentConfig/constants'
import { DEPLOYMENT, ROLLOUT_DEPLOYMENT } from '../../config'
import { createDeploymentTemplate, updateDeploymentTemplate } from './service'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning-y6.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/ic-info-filled.svg'
import DeploymentTemplateOptionsTab from '../deploymentConfig/DeploymentTemplateView/DeploymentTemplateOptionsTab'
import DeploymentTemplateEditorView from '../deploymentConfig/DeploymentTemplateView/DeploymentTemplateEditorView'
import DeploymentConfigFormCTA from '../deploymentConfig/DeploymentTemplateView/DeploymentConfigFormCTA'
import { DeploymentConfigContext } from '../deploymentConfig/DeploymentConfig'
import { DeleteOverrideDialog } from '../deploymentConfig/DeploymentTemplateView/DeploymentTemplateView.component'
import DeploymentTemplateReadOnlyEditorView from '../deploymentConfig/DeploymentTemplateView/DeploymentTemplateReadOnlyEditorView'
import DeploymentConfigToolbar from '../deploymentConfig/DeploymentTemplateView/DeploymentConfigToolbar'
import {
    getBasicFieldValue,
    handleConfigProtectionError,
    isBasicValueChanged,
    patchBasicData,
    updateTemplateFromBasicValue,
    validateBasicView,
} from '../deploymentConfig/DeploymentConfig.utils'
import { getDeploymentManisfest } from '../deploymentConfig/service'

const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar', DeploymentConfigToolbar)
const SaveChangesModal = importComponentFromFELibrary('SaveChangesModal')
const DeleteOverrideDraftModal = importComponentFromFELibrary('DeleteOverrideDraftModal')

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
    value,
    setValue,
    valueLeft,
    setValueLeft,
}) {
    const [obj, , , error] = useJsonYaml(state.tempFormData, 4, 'yaml', true)
    const { appId, envId } = useParams<{ appId; envId }>()
    const readOnlyPublishedMode = state.selectedTabIndex === 1 && isConfigProtectionEnabled && !!state.latestDraft
    const [loading, setLoading] = useState(false)

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

    const prepareDataToSave = (envOverrideValuesWithBasic, includeInDraft?: boolean) => {
        const payload = {
            environmentId: +envId,
            envOverrideValues: envOverrideValuesWithBasic || obj || state.duplicate,
            chartRefId: state.selectedChartRefId,
            IsOverride: true,
            isAppMetricsEnabled: state.latestDraft ? state.isAppMetricsEnabled : state.data.appMetrics,
            currentViewEditor: state.isBasicLocked ? EDITOR_VIEW.ADVANCED : state.currentEditorView,
            isBasicLocked: state.isBasicLocked,
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

    async function handleSubmit(e) {
        e.preventDefault()
        if (!obj && state.yamlMode) {
            toast.error(error)
            return
        } else if (
            (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) &&
            !state.yamlMode &&
            !state.basicFieldValuesErrorObj.isValid
        ) {
            toast.error('Some required fields are missing')
            return
        } else if (isConfigProtectionEnabled) {
            toggleSaveChangesModal()
            return
        }

        const api =
            state.data.environmentConfig && state.data.environmentConfig.id > 0
                ? updateDeploymentTemplate
                : createDeploymentTemplate
        const envOverrideValuesWithBasic =
            !state.yamlMode && patchBasicData(obj || state.duplicate, state.basicFieldValues)

        try {
            dispatch({ type: DeploymentConfigStateActionTypes.loading, payload: true })
            await api(+appId, +envId, prepareDataToSave(envOverrideValuesWithBasic))
            if (envOverrideValuesWithBasic) {
                editorOnChange(YAML.stringify(envOverrideValuesWithBasic, { indent: 2 }), true)
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
            dispatch({
                type: DeploymentConfigStateActionTypes.fetchedValues,
                payload: {},
            })
            initialise(true, false, true)
        } catch (err) {
            handleConfigProtectionError(2, err, dispatch, reloadEnvironments)
        } finally {
            dispatch({ type: DeploymentConfigStateActionTypes.loading, payload: false })
        }
    }

    const changeEditorMode = (): void => {
        if (readOnlyPublishedMode) {
            if (state.publishedState && !state.publishedState.isBasicLocked) {
                toggleYamlMode(!state.yamlMode)
            }
            return
        } else if (state.basicFieldValuesErrorObj && !state.basicFieldValuesErrorObj.isValid) {
            toast.error('Some required fields are missing')
            return
        } else if (state.isBasicLocked) {
            return
        }

        try {
            const parsedCodeEditorValue =
                state.tempFormData && state.tempFormData !== ''
                    ? YAML.parse(state.tempFormData)
                    : state.duplicate || state.data.globalConfig
            if (state.yamlMode) {
                const _basicFieldValues = getBasicFieldValue(parsedCodeEditorValue)
                dispatch({
                    type: DeploymentConfigStateActionTypes.multipleOptions,
                    payload: {
                        basicFieldValues: _basicFieldValues,
                        basicFieldValuesErrorObj: validateBasicView(_basicFieldValues),
                        yamlMode: false,
                    },
                })
                return
            } else {
                const newTemplate = patchBasicData(parsedCodeEditorValue, state.basicFieldValues)
                updateTemplateFromBasicValue(newTemplate)
                editorOnChange(YAML.stringify(newTemplate, { indent: 2 }), state.yamlMode)
            }
            dispatch({
                type: DeploymentConfigStateActionTypes.yamlMode,
                payload: true,
            })
        } catch (err) {}
    }

    const isCompareAndApprovalState =
        state.selectedTabIndex === 2 && !state.showReadme && state.latestDraft?.draftState === 4

    const editorOnChange = (str: string, fromBasic?: boolean): void => {
        if (isCompareAndApprovalState) return

        if (isValuesOverride) {
            dispatch({
                type: DeploymentConfigStateActionTypes.tempFormData,
                payload: str,
            })
        }
        try {
            const parsedValues = YAML.parse(str)
            // Unset unableToParseYaml flag when yaml is successfully parsed
            dispatch({
                type: DeploymentConfigStateActionTypes.unableToParseYaml,
                payload: false,
            })

            if (str && state.currentEditorView && !state.isBasicLocked && !fromBasic) {
                dispatch({
                    type: DeploymentConfigStateActionTypes.isBasicLocked,
                    payload: isBasicValueChanged(parsedValues),
                })
            }
        } catch (error) {
            // Set unableToParseYaml flag when yaml is malformed
            if (!isValuesOverride) return // Don't set unableToParseYaml flag when in manifest view
            dispatch({
                type: DeploymentConfigStateActionTypes.unableToParseYaml,
                payload: true,
            })
        }
    }

    const handleReadMeClick = () => {
        if (!state.showReadme && state.unableToParseYaml) return

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: {
                showReadme: !state.showReadme,
                openComparison: state.showReadme && state.selectedTabIndex === 2,
            },
        })
    }

    const handleComparisonClick = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: { openComparison: !state.openComparison, showReadme: false },
        })
    }

    const handleTabSelection = (index: number) => {
        if (state.unableToParseYaml) return

        dispatch({
            type: DeploymentConfigStateActionTypes.selectedTabIndex,
            payload:
                ((!state.latestDraft && state.selectedTabIndex === 1) || state.selectedTabIndex === 3) &&
                state.basicFieldValuesErrorObj &&
                !state.basicFieldValuesErrorObj.isValid
                    ? state.selectedTabIndex
                    : index,
        })

        switch (index) {
            case 1:
            case 3:
                const _isBasicLocked =
                    state.publishedState && index === 1 ? state.publishedState.isBasicLocked : state.isBasicLocked
                const defaultYamlMode =
                    state.selectedChart.name !== ROLLOUT_DEPLOYMENT && state.selectedChart.name !== DEPLOYMENT
                toggleYamlMode(defaultYamlMode || _isBasicLocked || isEnterpriseInstallation)
                if (state.selectedTabIndex === 2) {
                    handleComparisonClick()
                }
                break
            case 2:
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
        } else if (overridden) {
            return 'Delete override'
        } else {
            return 'Allow override'
        }
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
        const envOverrideValuesWithBasic =
            !state.yamlMode && patchBasicData(obj || state.duplicate, state.basicFieldValues)
        return prepareDataToSave(envOverrideValuesWithBasic, true)
    }

    const prepareDataToDeleteOverrideDraft = () => prepareDataToSave(state.data.globalConfig, true)

    const getCodeEditorValueForReadOnly = () => {
        if (state.publishedState) {
            if (
                state.publishedState.isOverride &&
                (state.selectedCompareOption?.id !== -1 || state.selectedTabIndex === 1)
            ) {
                return YAML.stringify(state.publishedState.environmentConfig.envOverrideValues, { indent: 2 })
            }
        } else if (
            state.selectedCompareOption?.id === Number(envId) &&
            state.data.environmentConfig.envOverrideValues
        ) {
            return YAML.stringify(state.data.environmentConfig.envOverrideValues, { indent: 2 })
        }

        return YAML.stringify(state.data.globalConfig, { indent: 2 })
    }

    useEffect(() => {
        if (isValuesOverride) return
        const values = Promise.all([getCodeEditorManifestValue(false), getCodeEditorManifestValue(true)])
        setLoading(true)
        values
            .then((res) => {
                const [value, valueLeft] = res
                setValue(value)
                setValueLeft(valueLeft)
            })
            .catch((err) => {
                toast.error('Failed to fetch manifest data')
                setIsValuesOverride(true)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [isValuesOverride])

    const getCodeEditorManifestValue = async (readOnlyPublishedMode: boolean) => {
        let codeEditorValue = ''
        if (readOnlyPublishedMode) {
            const readOnlyData = getCodeEditorValueForReadOnly()
            codeEditorValue = await fetchManifestData(readOnlyData)
        } else if (isCompareAndApprovalState) {
            codeEditorValue =
                state.latestDraft?.action !== 3 || state.showDraftOverriden
                    ? await fetchManifestData(state.draftValues)
                    : await fetchManifestData(YAML.stringify(state.data.globalConfig, { indent: 2 }))
        } else if (state.tempFormData) {
            codeEditorValue = await fetchManifestData(state.tempFormData)
        } else {
            const isOverridden = state.latestDraft?.action === 3 ? state.isDraftOverriden : !!state.duplicate
            codeEditorValue = isOverridden
                ? await fetchManifestData(YAML.stringify(state.duplicate, { indent: 2 }))
                : await fetchManifestData(YAML.stringify(state.data.globalConfig, { indent: 2 }))
        }
        return codeEditorValue
    }

    const getCodeEditorValue = (readOnlyPublishedMode: boolean) => {
        let codeEditorValue = ''
        if (readOnlyPublishedMode) {
            codeEditorValue = getCodeEditorValueForReadOnly()
        } else if (isCompareAndApprovalState) {
            codeEditorValue =
                state.latestDraft?.action !== 3 || state.showDraftOverriden
                    ? state.draftValues
                    : YAML.stringify(state.data.globalConfig, { indent: 2 })
        } else if (state.tempFormData) {
            codeEditorValue = state.tempFormData
        } else {
            const isOverridden = state.latestDraft?.action === 3 ? state.isDraftOverriden : !!state.duplicate
            codeEditorValue = isOverridden
                ? YAML.stringify(state.duplicate, { indent: 2 })
                : YAML.stringify(state.data.globalConfig, { indent: 2 })
        }

        return codeEditorValue
    }

    const reload = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.loading,
            payload: true,
        })
        dispatch({
            type: DeploymentConfigStateActionTypes.tempFormData,
            payload: '',
        })
        dispatch({
            type: DeploymentConfigStateActionTypes.duplicate,
            payload: '',
        })
        initialise(false, true, false)
    }

    const fetchManifestData = async (data) => {
        const request = {
            appId: +appId,
            chartRefId: state.selectedChartRefId,
            valuesAndManifestFlag: 2,
            values: data,
        }
        setLoading(true)
        const response = await getDeploymentManisfest(request)
        setLoading(false)
        return response.result.data
    }

    const renderValuesView = () => (
        <form
            className={`deployment-template-override-form h-100 ${state.openComparison ? 'comparison-view' : ''} ${
                state.showReadme ? 'readme-view' : ''
            }`}
            onSubmit={handleSubmit}
        >
            <DeploymentTemplateOptionsTab
                isEnvOverride={true}
                disableVersionSelect={readOnlyPublishedMode || !state.duplicate}
                codeEditorValue={isValuesOverride ? getCodeEditorValue(readOnlyPublishedMode) : value}
            />
            {readOnlyPublishedMode && !state.showReadme ? (
                <DeploymentTemplateReadOnlyEditorView
                    value={isValuesOverride ? getCodeEditorValue(true) : value}
                    isEnvOverride={true}
                />
            ) : loading ? (
                <div className="h-100vh">
                    <Progressing pageLoader />
                </div>
            ) : (
                <DeploymentTemplateEditorView
                    isEnvOverride={true}
                    value={isValuesOverride ? getCodeEditorValue(false) : value}
                    defaultValue={
                        state.data && state.openComparison
                            ? isValuesOverride
                                ? getCodeEditorValue(true)
                                : valueLeft
                            : ''
                    }
                    editorOnChange={editorOnChange}
                    environmentName={environmentName}
                    readOnly={!state.duplicate || isCompareAndApprovalState || !overridden}
                    globalChartRefId={state.data.globalChartRefId}
                    handleOverride={handleOverride}
                    isValues={isValuesOverride}
                    groupedData={groupedData}
                />
            )}
            <DeploymentConfigFormCTA
                loading={state.loading || state.chartConfigLoading}
                isEnvOverride={true}
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
            />
        </form>
    )

    const getValueForContext = () => ({
        isUnSet: false,
        state,
        dispatch,
        isConfigProtectionEnabled,
        environments: environments || [],
        changeEditorMode: changeEditorMode,
        reloadEnvironments: reloadEnvironments,
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
                showValuesPostfix={true}
                reload={reload}
                isValues={isValuesOverride}
                setIsValues={setIsValuesOverride}
            />
            {state.selectedTabIndex !== 2 && !state.showReadme && renderOverrideInfoStrip()}
            {renderValuesView()}
            {state.dialog && <DeleteOverrideDialog appId={appId} envId={envId} initialise={initialise} />}
            {SaveChangesModal && state.showSaveChangsModal && (
                <SaveChangesModal
                    appId={Number(appId)}
                    envId={Number(envId)}
                    resourceType={3}
                    resourceName={`${environmentName}-DeploymentTemplateOverride`}
                    prepareDataToSave={prepareDataToSaveDraft}
                    toggleModal={toggleSaveChangesModal}
                    latestDraft={state.latestDraft}
                    reload={reload}
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
        </DeploymentConfigContext.Provider>
    )
}
