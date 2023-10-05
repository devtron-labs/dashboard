import React, { useEffect, useReducer, useContext, Reducer } from 'react'
import { useParams } from 'react-router'
import YAML from 'yaml'
import { showError, Progressing, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import { getDeploymentTemplate, chartRefAutocomplete } from './service'
import { getDeploymentTemplate as getBaseDeploymentTemplate } from '../deploymentConfig/service'
import { importComponentFromFELibrary } from '../common'
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
const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')

export default function DeploymentTemplateOverride({
    parentState,
    setParentState,
    environments,
    environmentName,
    isProtected,
    reloadEnvironments,
}: DeploymentTemplateOverrideProps) {
    const { currentServerInfo } = useContext(mainContext)
    const { appId, envId } = useParams<{ appId; envId }>()
    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [appId])
    const [state, dispatch] = useReducer<Reducer<DeploymentConfigStateWithDraft, DeploymentConfigStateAction>>(
        deploymentConfigReducer,
        initDeploymentConfigState,
    )
    const baseDeploymentAbortController = new AbortController()

    useEffect(() => {
        dispatch({ type: DeploymentConfigStateActionTypes.reset })
        reloadEnvironments()
        initialise()
    }, [envId, appId])

    useEffect(() => {
        if (state.selectedChart) {
            fetchDeploymentTemplate()
        }
    }, [state.selectedChart])

    const updateRefsData = (chartRefsData, clearPublishedState?) => {
        const payload = {
            ...chartRefsData,
            chartConfigLoading: false,
        }

        if (clearPublishedState) {
            payload.publishedState = null
            payload.selectedTabIndex = 1
            payload.openComparison = false
            payload.showReadme = false
            payload.showComments = false
            payload.latestDraft = null
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload,
        })
    }

    async function initialise(
        selectedChartRefId?: string,
        forceReloadEnvironments?: boolean,
        updateChartRefOnly?: boolean,
    ) {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: {
                chartConfigLoading: true,
                loading: true,
            },
        })
        chartRefAutocomplete(Number(appId), Number(envId))
            .then((chartRefResp) => {
                // Use other latest ref id instead of selectedChartRefId on delete override action
                const _selectedChartId =
                    selectedChartRefId ||
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

                if (!updateChartRefOnly && isProtected && typeof getDraftByResourceName === 'function') {
                    fetchAllDrafts(chartRefsData)
                } else {
                    updateRefsData(chartRefsData)
                }

                if (selectedChartRefId || forceReloadEnvironments) {
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
        getDraftByResourceName(appId, Number(envId), 3, `${environmentName}-DeploymentTemplateOverride`)
            .then((draftsResp) => {
                if (draftsResp.result && (draftsResp.result.draftState === 1 || draftsResp.result.draftState === 4)) {
                    processDraftData(draftsResp.result, chartRefsData)
                } else {
                    updateRefsData(chartRefsData, !!state.publishedState)
                }
            })
            .catch((e) => {
                updateRefsData(chartRefsData)
            })
    }

    const processDraftData = (latestDraft, chartRefsData) => {
        const {
            envOverrideValues,
            id,
            isDraftOverriden,
            globalConfig,
            isAppMetricsEnabled,
            currentEditorView,
            isBasicLocked,
            chartRefId,
            status,
            manualReviewed,
            active,
            namespace,
        } = JSON.parse(latestDraft.data)

        const isApprovalPending = latestDraft.draftState === 4
        const payload = {
            chartConfigLoading: false,
            duplicate: envOverrideValues,
            draftValues: YAML.stringify(envOverrideValues, { indent: 2 }),
            environmentConfig: {
                id,
                status,
                manualReviewed,
                active,
                namespace,
            },
            isAppMetricsEnabled,
            latestDraft: latestDraft,
            selectedTabIndex: isApprovalPending ? 2 : 3,
            openComparison: isApprovalPending,
            showReadme: false,
            currentEditorView,
            isBasicLocked,
            showDraftOverriden: isDraftOverriden,
            ...{
                ...chartRefsData,
                selectedChartRefId: chartRefId,
                selectedChart: chartRefsData?.charts?.find((chart) => chart.id === chartRefId),
            },
        }

        if (chartRefsData) {
            payload['publishedState'] = {
                ...state.publishedState,
                ...chartRefsData,
            }
        } else if (!state.publishedState) {
            payload['publishedState'] = state
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload,
        })

        if (payload.selectedChart.name === ROLLOUT_DEPLOYMENT || payload.selectedChart.name === DEPLOYMENT) {
            updateTemplateFromBasicValue(envOverrideValues)
            parseDataForView(isBasicLocked, currentEditorView, globalConfig, envOverrideValues, payload, false)
        }
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

            const _duplicateFromResp =
                result.IsOverride || state.duplicate
                    ? result.environmentConfig.envOverrideValues || result.globalConfig
                    : null
            const payload = {
                data: result,
                duplicate: !!state.latestDraft ? state.duplicate : _duplicateFromResp,
                readme: result.readme,
                schema: result.schema,
                isBasicLockedInBase:
                    result.environmentConfig.currentViewEditor !== EDITOR_VIEW.UNDEFINED &&
                    result.environmentConfig.isBasicViewLocked,
            }

            if (isProtected && state.latestDraft) {
                payload['publishedState'] = {
                    ...state.publishedState,
                    ...result,
                    isBasicLockedInBase: payload.isBasicLockedInBase,
                    isOverride: result.IsOverride,
                }
            }

            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload,
            })

            if (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) {
                updateTemplateFromBasicValue(result.environmentConfig.envOverrideValues || result.globalConfig)
                parseDataForView(
                    result.environmentConfig.isBasicViewLocked,
                    result.environmentConfig.currentViewEditor,
                    result.globalConfig,
                    result.environmentConfig.envOverrideValues,
                    payload,
                    true,
                )
            }

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
        if (state.unableToParseYaml) {
            return
        } else if (state.duplicate && (!state.latestDraft || state.isDraftOverriden)) {
            const showDeleteModal = state.latestDraft ? state.latestDraft.action !== 3 : state.data.IsOverride
            //permanent delete
            if (isProtected && showDeleteModal) {
                dispatch({ type: DeploymentConfigStateActionTypes.toggleDeleteOverrideDraftModal })
            } else if (showDeleteModal) {
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
                                isDraftOverriden: false,
                            },
                        })
                    } else {
                        dispatch({
                            type: DeploymentConfigStateActionTypes.multipleOptions,
                            payload: { duplicate: null, isDraftOverriden: false },
                        })
                        parseDataForView(false, EDITOR_VIEW.UNDEFINED, state.data.globalConfig, null, {}, false)
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
                    isDraftOverriden: !!state.latestDraft,
                },
            })
        }
    }

    const parseDataForView = async (
        _isBasicLocked: boolean,
        _currentViewEditor: string,
        baseTemplate,
        envOverrideValues,
        templateData,
        updatePublishedState,
    ): Promise<void> => {
        if (_currentViewEditor === '' || _currentViewEditor === EDITOR_VIEW.UNDEFINED) {
            if (!envOverrideValues) {
                const {
                    result: { defaultAppOverride },
                } = await getBaseDeploymentTemplate(
                    +appId,
                    state.selectedChartRefId || state.latestAppChartRef || state.latestChartRef,
                    baseDeploymentAbortController.signal,
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
            statesToUpdate['currentEditorView'] = _currentViewEditor
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

        // Override yamlMode state to advanced when draft state is 4 (approval pending)
        if (templateData.latestDraft?.draftState === 4) {
            statesToUpdate['yamlMode'] = true
            statesToUpdate['currentEditorView'] = EDITOR_VIEW.ADVANCED
        }

        if (updatePublishedState && templateData['publishedState']) {
            dispatch({
                type: DeploymentConfigStateActionTypes.publishedState,
                payload: {
                    ...templateData['publishedState'],
                    ...statesToUpdate,
                },
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
                        isConfigProtectionEnabled={isProtected}
                        environments={environments}
                        environmentName={environmentName}
                        reloadEnvironments={reloadEnvironments}
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
