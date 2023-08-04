import React, { useEffect, useReducer, useContext, Reducer } from 'react'
import { useParams } from 'react-router'
import YAML from 'yaml'
import { showError, Progressing, useEffectAfterMount } from '@devtron-labs/devtron-fe-common-lib'
import { getDeploymentTemplate, chartRefAutocomplete } from './service'
import { getDeploymentTemplate as getBaseDeploymentTemplate } from '../deploymentConfig/service'
import { useAsync, importComponentFromFELibrary } from '../common'
import '../deploymentConfig/deploymentConfig.scss'
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
    updateTemplateFromBasicValue,
    validateBasicView,
} from '../deploymentConfig/DeploymentConfig.utils'
import { mainContext } from '../common/navigation/NavigationRoutes'
import { BASIC_FIELDS, EDITOR_VIEW } from '../deploymentConfig/constants'
import { deploymentConfigReducer, initDeploymentConfigState } from '../deploymentConfig/DeploymentConfigReducer'
import DeploymentTemplateOverrideForm from './DeploymentTemplateOverrideForm'

const DraftComments = importComponentFromFELibrary('DraftComments')
const getAllDrafts = importComponentFromFELibrary('getAllDrafts', null, 'function')
const getDraft = importComponentFromFELibrary('getDraft', null, 'function')

export default function DeploymentTemplateOverride({
    parentState,
    setParentState,
    environments,
    environmentName,
    isProtected,
}: DeploymentTemplateOverrideProps) {
    const { currentServerInfo } = useContext(mainContext)
    const { appId, envId } = useParams<{ appId; envId }>()
    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [appId])
    const [state, dispatch] = useReducer<Reducer<DeploymentConfigStateWithDraft, DeploymentConfigStateAction>>(
        deploymentConfigReducer,
        initDeploymentConfigState,
    )

    useEffect(() => {
        dispatch({ type: DeploymentConfigStateActionTypes.reset })
        dispatch({ type: DeploymentConfigStateActionTypes.loading, payload: true })
        initialise()
    }, [envId])

    useEffect(() => {
        if (!state.chartConfigLoading && state.selectedChartRefId) {
            fetchDeploymentTemplate()
        }
    }, [state.chartConfigLoading])

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
        dispatch({
            type: DeploymentConfigStateActionTypes.chartConfigLoading,
            payload: true,
        })
        chartRefAutocomplete(Number(appId), Number(envId))
            .then((chartRefResp) => {
                // Use other latest ref id instead of selectedChartRefId on delete override action
                const _selectedChartId =
                    (!isDeleteAction && state.selectedChartRefId) ||
                    chartRefResp.result.latestEnvChartRef ||
                    chartRefResp.result.latestAppChartRef ||
                    chartRefResp.result.latestChartRef

                const chartRefsData = {
                    charts: chartRefResp.result.chartRefs,
                    selectedChart: chartRefResp.result.chartRefs?.find((chart) => chart.id === _selectedChartId),
                    selectedChartRefId: _selectedChartId,
                    latestAppChartRef: chartRefResp.result.latestAppChartRef,
                    latestChartRef: chartRefResp.result.latestChartRef,
                }

                if (!updateChartRefOnly) {
                    chartRefsData['isConfigProtectionEnabled'] = isProtected
                }

                if (!updateChartRefOnly && isProtected && typeof getAllDrafts === 'function') {
                    fetchAllDrafts(chartRefsData)
                } else if (!state.selectedChartRefId) {
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
                dispatch({
                    type: DeploymentConfigStateActionTypes.chartConfigLoading,
                    payload: false,
                })
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
                    globalConfig,
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
                    duplicate: envOverrideValues,
                    draftValues: YAML.stringify(envOverrideValues, null),
                    environmentConfig: {
                        id,
                        status,
                        manualReviewed,
                        active,
                        namespace,
                    },
                    isAppMetricsEnabled,
                    latestDraft: draftResp.result,
                    selectedTabIndex: 3,
                    openComparison: false,
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
                    updateTemplateFromBasicValue(envOverrideValues)
                    parseDataForView(isBasicLocked, currentEditorView, globalConfig, envOverrideValues, false)
                }
            })
            .catch((e) => {
                updateRefsData(chartRefsData)
            })
    }

    async function handleAppMetrics() {
        if (state.latestDraft && state.selectedTabIndex !== 1) {
            dispatch({
                type: DeploymentConfigStateActionTypes.isAppMetricsEnabled,
                payload: !state.isAppMetricsEnabled,
            })
        } else {
            dispatch({
                type: DeploymentConfigStateActionTypes.appMetrics,
                payload: !state.data.appMetrics,
            })
        }
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
                    true,
                )
            }

            const _duplicateFromResp =
                result.IsOverride || state.duplicate
                    ? result.environmentConfig.envOverrideValues || result.globalConfig
                    : null

            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: {
                    data: result,
                    duplicate: !!state.latestDraft ? state.duplicate : _duplicateFromResp,
                    readme: result.readme,
                    schema: result.schema,
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
            dispatch({ type: DeploymentConfigStateActionTypes.loading, payload: false })
        }
    }

    async function handleOverride(e) {
        e.preventDefault()
        if (state.duplicate) {
            //permanent delete
            if (state.isConfigProtectionEnabled && (state.data.IsOverride || !!state.latestDraft)) {
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
                        parseDataForView(false, EDITOR_VIEW.UNDEFINED, state.data.globalConfig, null, false)
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
        updatePublishedState,
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

        if (updatePublishedState && state.isConfigProtectionEnabled && state.latestDraft) {
            dispatch({
                type: DeploymentConfigStateActionTypes.publishedState,
                payload: statesToUpdate,
            })
        } else {
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: statesToUpdate,
            })
        }
    }

    const toggleDraftComments = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleDraftComments })
    }

    if (state.loading || parentState === ComponentStates.loading) {
        return <Progressing size={48} fullHeight />
    }

    return (
        <div
            className={`app-compose__deployment-config dc__window-bg ${
                state.openComparison || state.showReadme ? 'full-view' : ''
            } ${state.showComments ? 'comments-view' : ''}`}
        >
            <div className="bcn-0 dc__border br-4 m-8 dc__overflow-hidden" style={{ height: 'calc(100vh - 92px)' }}>
                {state.data && state.charts && (
                    <DeploymentTemplateOverrideForm
                        state={state}
                        environments={environments}
                        environmentName={environmentName}
                        handleOverride={handleOverride}
                        dispatch={dispatch}
                        initialise={initialise}
                        handleAppMetrics={handleAppMetrics}
                        toggleDraftComments={toggleDraftComments}
                        isGrafanaModuleInstalled={grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED}
                        isEnterpriseInstallation={
                            currentServerInfo?.serverInfo?.installationType === InstallationType.ENTERPRISE
                        }
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
