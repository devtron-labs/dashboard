import React, { useState, useEffect, useReducer, useContext, Reducer } from 'react'
import { useParams } from 'react-router'
import {
    getDeploymentTemplate,
    createDeploymentTemplate,
    updateDeploymentTemplate,
    chartRefAutocomplete,
} from './service'
import { getDeploymentTemplate as getBaseDeploymentTemplate } from '../deploymentConfig/service'
import { useJsonYaml, useAsync, importComponentFromFELibrary } from '../common'
import { showError, Progressing, not, useEffectAfterMount, noop } from '@devtron-labs/devtron-fe-common-lib'
import { toast } from 'react-toastify'
import '../deploymentConfig/deploymentConfig.scss'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning-y6.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/ic-info-filled.svg'
import YAML from 'yaml'
import {
    DeploymentConfigStateAction,
    DeploymentConfigStateActionTypes,
    DeploymentConfigStateWithDraft,
} from '../deploymentConfig/types'
import { ComponentStates, DeploymentTemplateOverrideProps } from './EnvironmentOverrides.type'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { DEPLOYMENT, ModuleNameMap, ROLLOUT_DEPLOYMENT } from '../../config'
import { InstallationType, ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import {
    getBasicFieldValue,
    isBasicValueChanged,
    patchBasicData,
    updateTemplateFromBasicValue,
    validateBasicView,
} from '../deploymentConfig/DeploymentConfig.utils'
import { mainContext } from '../common/navigation/NavigationRoutes'
import { BASIC_FIELDS, EDITOR_VIEW } from '../deploymentConfig/constants'
import DeploymentTemplateOptionsTab from '../deploymentConfig/DeploymentTemplateView/DeploymentTemplateOptionsTab'
import DeploymentTemplateEditorView from '../deploymentConfig/DeploymentTemplateView/DeploymentTemplateEditorView'
import DeploymentConfigFormCTA from '../deploymentConfig/DeploymentTemplateView/DeploymentConfigFormCTA'
import { DeploymentConfigContext } from '../deploymentConfig/DeploymentConfig'
import { deploymentConfigReducer, initDeploymentConfigState } from '../deploymentConfig/DeploymentConfigReducer'
import DeploymentConfigToolbar from '../deploymentConfig/DeploymentTemplateView/DeploymentConfigToolbar'
import { DeleteOverrideDialog } from '../deploymentConfig/DeploymentTemplateView/DeploymentTemplateView.component'
import DeploymentTemplateReadOnlyEditorView from '../deploymentConfig/DeploymentTemplateView/DeploymentTemplateReadOnlyEditorView'

const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar', DeploymentConfigToolbar)
const SaveChangesModal = importComponentFromFELibrary('SaveChangesModal')
const DeleteOverrideDraftModal = importComponentFromFELibrary('DeleteOverrideDraftModal')
const DraftComments = importComponentFromFELibrary('DraftComments')
const getAllDrafts = importComponentFromFELibrary('getAllDrafts', null, 'function')
const getConfigProtections = importComponentFromFELibrary('getConfigProtections', null, 'function')
const getDraft = importComponentFromFELibrary('getDraft', null, 'function')

export default function DeploymentTemplateOverride({
    parentState,
    setParentState,
    environments,
    environmentName,
}: DeploymentTemplateOverrideProps) {
    const { currentServerInfo } = useContext(mainContext)
    const { appId, envId } = useParams<{ appId; envId }>()
    const [loading, setLoading] = useState(false)
    const [chartRefLoading, setChartRefLoading] = useState(null)
    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [appId])
    const [state, dispatch] = useReducer<Reducer<DeploymentConfigStateWithDraft, DeploymentConfigStateAction>>(
        deploymentConfigReducer,
        initDeploymentConfigState,
    )

    useEffect(() => {
        dispatch({ type: DeploymentConfigStateActionTypes.reset })
        setLoading(true)
        initialise()
    }, [envId])

    useEffect(() => {
        if (typeof chartRefLoading === 'boolean' && !chartRefLoading && state.selectedChartRefId) {
            fetchDeploymentTemplate()
        }
    }, [chartRefLoading])

    useEffectAfterMount(() => {
        if (!state.selectedChartRefId) return
        initialise(false, false, true)
    }, [state.selectedChartRefId])

    const updateRefsData = (chartRefsData, clearPublishedState?) => {
        const payload = {
            ...chartRefsData,
            chartConfigLoading: false,
        }

        if (clearPublishedState) {
            payload.selectedTabIndex = state.selectedTabIndex === 3 ? 1 : state.selectedTabIndex
            payload.allDrafts = []
            payload.latestDraft = null
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload,
        })
    }

    async function initialise(
        isDeleteAction?: boolean,
        forceReloadEnvironments?: boolean,
        updateChartRefOnly?: boolean,
    ) {
        setChartRefLoading(true)
        Promise.all([
            chartRefAutocomplete(Number(appId), Number(envId)),
            !updateChartRefOnly && typeof getConfigProtections === 'function'
                ? getConfigProtections(Number(appId))
                : { result: null },
        ])
            .then(([chartRefResp, configProtectionsResp]) => {
                // Use other latest ref id instead of selectedChartRefId on delete override action
                const _selectedChartId =
                    (!isDeleteAction && state.selectedChartRefId) ||
                    chartRefResp.result.latestEnvChartRef ||
                    chartRefResp.result.latestAppChartRef ||
                    chartRefResp.result.latestChartRef
                const isConfigProtectionEnabled =
                    configProtectionsResp.result?.find(
                        (config) => config.appId === Number(appId) && config.envId === Number(envId),
                    )?.state === 1

                const chartRefsData = {
                    charts: chartRefResp.result.chartRefs,
                    selectedChart: chartRefResp.result.chartRefs?.find((chart) => chart.id === _selectedChartId),
                    selectedChartRefId: _selectedChartId,
                    latestAppChartRef: chartRefResp.result.latestAppChartRef,
                    latestChartRef: chartRefResp.result.latestChartRef,
                }

                if (!updateChartRefOnly) {
                    chartRefsData['isConfigProtectionEnabled'] = isConfigProtectionEnabled
                }

                if (!updateChartRefOnly && isConfigProtectionEnabled && typeof getAllDrafts === 'function') {
                    fetchAllDrafts(chartRefsData)
                } else {
                    updateRefsData(chartRefsData)
                }

                if (isDeleteAction || forceReloadEnvironments) {
                    setParentState(ComponentStates.reloading)
                }
            })
            .catch((e) => {
                setParentState(ComponentStates.failed)
                showError(e)
            })
            .finally(() => {
                setChartRefLoading(false)
            })
    }

    const fetchAllDrafts = (chartRefsData) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.chartConfigLoading,
            payload: true,
        })
        getAllDrafts(Number(appId), Number(envId), 3)
            .then((allDraftsResp) => {
                if (allDraftsResp.result) {
                    const allDrafts = allDraftsResp.result
                        .sort((draftA, draftB) => draftB.draftId - draftA.draftId)
                        .sort((draftA, draftB) => draftB.draftVersionId - draftA.draftVersionId)
                    const latestDraft = allDrafts[0]

                    if (
                        typeof getDraft === 'function' &&
                        latestDraft &&
                        (latestDraft.draftState === 1 || latestDraft.draftState === 4)
                    ) {
                        getDraftAndActivity(allDrafts, latestDraft, chartRefsData)
                    } else {
                        updateRefsData(chartRefsData)
                    }
                } else {
                    updateRefsData(chartRefsData, true)
                }
            })
            .catch((e) => {
                updateRefsData(chartRefsData)
            })
    }

    const getDraftAndActivity = (allDrafts, latestDraft, chartRefsData) => {
        getDraft(latestDraft.draftId)
            .then((draftResp) => {
                const {
                    envOverrideValues,
                    id,
                    IsOverride,
                    isAppMetricsEnabled,
                    currentEditorView,
                    isBasicLocked,
                    chartRefId,
                    status,
                    manualReviewed,
                    active,
                    namespace,
                } = JSON.parse(draftResp.result.data)

                const payload = {
                    chartConfigLoading: false,
                    duplicate: envOverrideValues,
                    environmentConfig: {
                        id,
                        status,
                        manualReviewed,
                        active,
                        namespace,
                    },
                    isAppMetricsEnabled,
                    latestDraft: draftResp.result,
                    allDrafts,
                    currentEditorView,
                    isBasicLocked,
                    ...{
                        ...chartRefsData,
                        selectedChartRefId: chartRefId,
                        selectedChart: chartRefsData?.charts?.find((chart) => chart.id === chartRefId),
                    },
                }

                dispatch({
                    type: DeploymentConfigStateActionTypes.multipleOptions,
                    payload,
                })

                if (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) {
                    // updateTemplateFromBasicValue(envOverrideValues)
                    // parseDataForView(
                    //     isBasicLocked,
                    //     currentEditorView,
                    //     null,
                    //     envOverrideValues,
                    // )
                }
            })
            .catch((e) => {
                updateRefsData(chartRefsData)
            })
    }

    async function handleAppMetrics() {
        dispatch({
            type: DeploymentConfigStateActionTypes.appMetrics,
            payload: !state.data.appMetrics,
        })
    }

    async function fetchDeploymentTemplate() {
        try {
            const { result } = await getDeploymentTemplate(
                +appId,
                +envId,
                state.selectedChartRefId || state.latestAppChartRef || state.latestChartRef,
            )
            if (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) {
                updateTemplateFromBasicValue(result.environmentConfig.envOverrideValues || result.globalConfig)
                parseDataForView(
                    result.environmentConfig.isBasicViewLocked,
                    result.environmentConfig.currentViewEditor,
                    result.globalConfig,
                    result.environmentConfig.envOverrideValues,
                )
            }

            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: {
                    data: result,
                    duplicate:
                        result.IsOverride || state.duplicate
                            ? result.environmentConfig.envOverrideValues || result.globalConfig
                            : null,
                    isBasicLockedInBase:
                        result.environmentConfig.currentViewEditor !== EDITOR_VIEW.UNDEFINED &&
                        result.environmentConfig.isBasicViewLocked,
                },
            })
            setParentState(ComponentStates.loaded)
        } catch (err) {
            setParentState(ComponentStates.failed)
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleOverride(e) {
        e.preventDefault()
        if (state.duplicate) {
            //permanent delete
            if (state.isConfigProtectionEnabled && state.latestDraft) {
                dispatch({ type: DeploymentConfigStateActionTypes.toggleDeleteOverrideDraftModal })
            } else if (state.data.IsOverride) {
                dispatch({ type: DeploymentConfigStateActionTypes.toggleDialog })
            } else {
                //remove copy
                if (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) {
                    if (state.isBasicLockedInBase !== null && state.isBasicLockedInBase !== undefined) {
                        const _basicFieldValues = getBasicFieldValue(state.data.globalConfig)
                        let _isBasicLocked = false
                        if (
                            _basicFieldValues[BASIC_FIELDS.HOSTS].length === 0 ||
                            !_basicFieldValues[BASIC_FIELDS.PORT] ||
                            !_basicFieldValues[BASIC_FIELDS.ENV_VARIABLES] ||
                            !_basicFieldValues[BASIC_FIELDS.RESOURCES]
                        ) {
                            _isBasicLocked = true
                        }
                        dispatch({
                            type: DeploymentConfigStateActionTypes.multipleOptions,
                            payload: {
                                basicFieldValues: _basicFieldValues,
                                basicFieldValuesErrorObj: validateBasicView(_basicFieldValues),
                                isBasicLocked: state.isBasicLockedInBase || _isBasicLocked,
                                duplicate: null,
                            },
                        })
                    } else {
                        dispatch({
                            type: DeploymentConfigStateActionTypes.duplicate,
                            payload: null,
                        })
                        parseDataForView(false, EDITOR_VIEW.UNDEFINED, state.data.globalConfig, null)
                    }
                }
            }
        } else {
            //create copy
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: {
                    duplicate: state.data.globalConfig,
                    selectedChartRefId: state.data.globalChartRefId,
                },
            })
        }
    }

    const parseDataForView = async (
        _isBasicLocked: boolean,
        _currentViewEditor: string,
        baseTemplate,
        envOverrideValues,
    ): Promise<void> => {
        if (_currentViewEditor === '' || _currentViewEditor === EDITOR_VIEW.UNDEFINED) {
            if (!envOverrideValues) {
                const {
                    result: { defaultAppOverride },
                } = await getBaseDeploymentTemplate(
                    +appId,
                    state.selectedChartRefId || state.latestAppChartRef || state.latestChartRef,
                    true,
                )
                _isBasicLocked = isBasicValueChanged(defaultAppOverride, baseTemplate)
            } else {
                _isBasicLocked = isBasicValueChanged(baseTemplate, envOverrideValues)
            }
        }

        const statesToUpdate = {}
        if (!state.currentEditorView || !state.duplicate) {
            _currentViewEditor =
                _isBasicLocked ||
                state.openComparison ||
                state.showReadme ||
                currentServerInfo?.serverInfo?.installationType === InstallationType.ENTERPRISE
                    ? EDITOR_VIEW.ADVANCED
                    : EDITOR_VIEW.BASIC
            statesToUpdate['yamlMode'] = _currentViewEditor === EDITOR_VIEW.ADVANCED
            statesToUpdate['currentViewEditor'] = _currentViewEditor
            statesToUpdate['isBasicLocked'] = _isBasicLocked
        }

        if (!_isBasicLocked) {
            const _basicFieldValues = getBasicFieldValue(envOverrideValues || baseTemplate)
            if (
                _basicFieldValues[BASIC_FIELDS.HOSTS].length === 0 ||
                !_basicFieldValues[BASIC_FIELDS.PORT] ||
                !_basicFieldValues[BASIC_FIELDS.ENV_VARIABLES] ||
                !_basicFieldValues[BASIC_FIELDS.RESOURCES]
            ) {
                statesToUpdate['yamlMode'] = true
                statesToUpdate['currentEditorView'] = EDITOR_VIEW.ADVANCED
                statesToUpdate['isBasicLocked'] = true
            } else {
                statesToUpdate['basicFieldValues'] = _basicFieldValues
                statesToUpdate['basicFieldValuesErrorObj'] = validateBasicView(_basicFieldValues)
            }
        }

        if (Object.keys(statesToUpdate).length > 0) {
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: statesToUpdate,
            })
        }
    }

    const toggleDraftComments = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleDraftComments })
    }

    if (loading || state.loading || parentState === ComponentStates.loading) {
        return <Progressing size={48} fullHeight />
    }

    return (
        <div
            className={`app-compose__deployment-config dc__window-bg ${
                state.openComparison || state.showReadme ? 'full-view' : ''
            } ${state.showComments ? 'comments-view' : ''}`}
        >
            <div className="bcn-0 dc__border br-4 m-12 dc__overflow-hidden" style={{ height: 'calc(100vh - 102px)' }}>
                {state.data && state.charts && (
                    <DeploymentTemplateOverrideForm
                        chartRefLoading={chartRefLoading}
                        state={state}
                        environments={environments}
                        environmentName={environmentName}
                        handleOverride={handleOverride}
                        dispatch={dispatch}
                        initialise={initialise}
                        handleAppMetrics={handleAppMetrics}
                        toggleDraftComments={toggleDraftComments}
                        isGrafanaModuleInstalled={grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED}
                    />
                )}
            </div>
            {DraftComments && state.showComments && (
                <DraftComments
                    draftId={state.latestDraft?.draftId}
                    draftVersionId={state.latestDraft?.draftVersionId}
                    toggleDraftComments={toggleDraftComments}
                />
            )}
        </div>
    )
}

function DeploymentTemplateOverrideForm({
    state,
    environments,
    environmentName,
    handleOverride,
    dispatch,
    initialise,
    handleAppMetrics,
    toggleDraftComments,
    chartRefLoading,
    isGrafanaModuleInstalled,
}) {
    const [tempValue, setTempValue] = useState('')
    const [obj, json, yaml, error] = useJsonYaml(tempValue, 4, 'yaml', true)
    const [loading, setLoading] = useState(false)
    const { appId, envId } = useParams<{ appId; envId }>()

    useEffect(() => {
        // Reset editor value on delete override action
        if (!state.duplicate && tempValue) {
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

    const prepareDataToSave = (envOverrideValuesWithBasic) => {
        return {
            environmentId: +envId,
            envOverrideValues: envOverrideValuesWithBasic || obj,
            chartRefId: state.selectedChartRefId,
            IsOverride: true,
            isAppMetricsEnabled: state.data.appMetrics,
            currentEditorView: state.isBasicLocked ? EDITOR_VIEW.ADVANCED : state.currentEditorView,
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
        } else if (state.isConfigProtectionEnabled) {
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
            setLoading(not)
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
            initialise(false, true)
        } catch (err) {
            showError(err)
        } finally {
            setLoading(not)
        }
    }

    const changeEditorMode = (): void => {
        if (state.basicFieldValuesErrorObj && !state.basicFieldValuesErrorObj.isValid) {
            toast.error('Some required fields are missing')
            return
        }
        if (state.isBasicLocked) {
            return
        }
        try {
            const parsedCodeEditorValue =
                tempValue && tempValue !== '' ? YAML.parse(tempValue) : state.duplicate || state.data.globalConfig
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

    const editorOnChange = (str: string, fromBasic?: boolean): void => {
        setTempValue(str)
        if (str && state.currentEditorView && !state.isBasicLocked && !fromBasic) {
            try {
                dispatch({
                    type: DeploymentConfigStateActionTypes.isBasicLocked,
                    payload: isBasicValueChanged(YAML.parse(str)),
                })
            } catch (error) {}
        }
    }

    const handleReadMeClick = () => {
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
        dispatch({
            type: DeploymentConfigStateActionTypes.selectedTabIndex,
            payload: index,
        })

        switch (index) {
            case 1:
            case 3:
                if (state.selectedTabIndex == 2) {
                    toggleYamlMode(state.isBasicLocked)
                    handleComparisonClick()
                }
                break
            case 2:
                if (!state.openComparison) {
                    toggleYamlMode(true)
                    handleComparisonClick()
                }
                break
            default:
                break
        }
    }

    const overridden = !!state.duplicate
    const getOverrideActionState = () => {
        if (loading) {
            return <Progressing />
        } else if (overridden) {
            return 'Delete override'
        } else {
            return 'Allow override'
        }
    }
    const renderOverrideInfoStrip = () => {
        return (
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
                <span
                    data-testid={`action-override-${overridden ? 'delete' : 'allow'}`}
                    className={`cursor ${overridden ? 'cr-5' : 'cb-5'}`}
                    onClick={handleOverride}
                >
                    {getOverrideActionState()}
                </span>
            </div>
        )
    }

    const prepareDataToSaveDraft = () => {
        const envOverrideValuesWithBasic =
            !state.yamlMode && patchBasicData(obj || state.duplicate, state.basicFieldValues)
        return prepareDataToSave(envOverrideValuesWithBasic)
    }

    const renderValuesView = () => {
        const readOnlyPublishedMode =
            state.selectedTabIndex === 1 && state.isConfigProtectionEnabled && state.latestDraft

        return (
            <form
                className={`deployment-template-override-form h-100 ${state.openComparison ? 'comparison-view' : ''}`}
                onSubmit={handleSubmit}
            >
                <DeploymentTemplateOptionsTab
                    isEnvOverride={true}
                    disableVersionSelect={readOnlyPublishedMode || !state.duplicate}
                    codeEditorValue={
                        readOnlyPublishedMode
                            ? YAML.stringify(state.data.globalConfig, { indent: 2 })
                            : tempValue
                            ? tempValue
                            : state
                            ? state.duplicate
                                ? YAML.stringify(state.duplicate, { indent: 2 })
                                : YAML.stringify(state.data.globalConfig, { indent: 2 })
                            : ''
                    }
                />
                {readOnlyPublishedMode ? (
                    <DeploymentTemplateReadOnlyEditorView
                        value={YAML.stringify(state.data.globalConfig, { indent: 2 })}
                    />
                ) : (
                    <DeploymentTemplateEditorView
                        isEnvOverride={true}
                        value={
                            tempValue
                                ? tempValue
                                : state
                                ? state.duplicate
                                    ? YAML.stringify(state.duplicate, { indent: 2 })
                                    : YAML.stringify(state.data.globalConfig, { indent: 2 })
                                : ''
                        }
                        defaultValue={
                            state && state.data && state.openComparison
                                ? YAML.stringify(state.data.globalConfig, { indent: 2 })
                                : ''
                        }
                        editorOnChange={editorOnChange}
                        environmentName={environmentName}
                        readOnly={!state.duplicate}
                        globalChartRefId={state.data.globalChartRefId}
                        handleOverride={handleOverride}
                    />
                )}
                {!state.openComparison && !state.showReadme && (
                    <DeploymentConfigFormCTA
                        loading={loading || chartRefLoading}
                        isEnvOverride={true}
                        disableButton={!state.duplicate}
                        disableCheckbox={!state.duplicate}
                        showAppMetricsToggle={
                            state.charts &&
                            state.selectedChart &&
                            appMetricsEnvironmentVariableEnabled &&
                            isGrafanaModuleInstalled &&
                            state.yamlMode
                        }
                        isAppMetricsEnabled={state.data.appMetrics}
                        toggleAppMetrics={handleAppMetrics}
                        isDraftMode={readOnlyPublishedMode}
                        reload={initialise}
                    />
                )}
            </form>
        )
    }

    const getValueForContext = () => {
        return {
            isUnSet: false,
            state: {
                ...state,
                isBasicLocked: state.isBasicLocked,
                chartConfigLoading: chartRefLoading,
                readme: state.data.readme,
                schema: state.data.schema,
            },
            dispatch,
            environments: environments || [],
            changeEditorMode: changeEditorMode,
        }
    }

    const appMetricsEnvironmentVariableEnabled = window._env_ && window._env_.APPLICATION_METRICS_ENABLED
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
                isDraftMode={state.isConfigProtectionEnabled && !!state.latestDraft}
                isApprovalPending={state.latestDraft?.draftState === 4}
                approvalUsers={state.latestDraft?.approvers}
                reload={initialise}
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
                    reload={initialise}
                />
            )}
            {DeleteOverrideDraftModal && state.showDeleteOverrideDraftModal && (
                <DeleteOverrideDraftModal
                    appId={Number(appId)}
                    envId={Number(envId)}
                    resourceType={3}
                    resourceName={`${environmentName}-DeploymentTemplateOverride`}
                    prepareDataToSave={prepareDataToSaveDraft}
                    toggleModal={toggleDeleteOverrideDraftModal}
                    latestDraft={state.latestDraft}
                    reload={initialise}
                />
            )}
        </DeploymentConfigContext.Provider>
    )
}
