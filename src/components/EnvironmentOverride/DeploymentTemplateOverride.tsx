import React, { useState, useEffect, useReducer, useContext, Reducer } from 'react'
import { useParams } from 'react-router'
import {
    getDeploymentTemplate,
    createDeploymentTemplate,
    updateDeploymentTemplate,
    deleteDeploymentTemplate,
    chartRefAutocomplete,
} from './service'
import { getDeploymentTemplate as getBaseDeploymentTemplate } from '../deploymentConfig/service'
import { useJsonYaml, useAsync, importComponentFromFELibrary } from '../common'
import {
    showError,
    Progressing,
    ConfirmationDialog,
    not,
    useEffectAfterMount,
    noop,
} from '@devtron-labs/devtron-fe-common-lib'
import { toast } from 'react-toastify'
import '../deploymentConfig/deploymentConfig.scss'
import warningIcon from '../../assets/img/warning-medium.svg'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning-y6.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/ic-info-filled.svg'
import YAML from 'yaml'
import {
    DeploymentConfigStateAction,
    DeploymentConfigStateActionTypes,
    DeploymentConfigStateType,
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

const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar', DeploymentConfigToolbar)

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
    const [state, dispatch] = useReducer<Reducer<DeploymentConfigStateType, DeploymentConfigStateAction>>(
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
        initialise()
    }, [state.selectedChartRefId])

    async function initialise(isDeleteAction?: boolean, forceReloadEnvironments?: boolean) {
        setChartRefLoading(true)
        try {
            const { result } = await chartRefAutocomplete(+appId, +envId)
            // Use other latest ref id instead of selectedChartRefId on delete override action
            const _selectedChartId =
                (!isDeleteAction && state.selectedChartRefId) ||
                result.latestEnvChartRef ||
                result.latestAppChartRef ||
                result.latestChartRef

            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: {
                    charts: result.chartRefs,
                    selectedChart: result.chartRefs?.find((chart) => chart.id === _selectedChartId),
                    selectedChartRefId: _selectedChartId,
                    latestAppChartRef: result.latestAppChartRef,
                    latestChartRef: result.latestChartRef,
                },
            })

            if (isDeleteAction || forceReloadEnvironments) {
                setParentState(ComponentStates.reloading)
            }
        } catch (err) {
            setParentState(ComponentStates.failed)
            showError(err)
        } finally {
            setChartRefLoading(false)
        }
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
                    ...state,
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
            if (state.data.IsOverride) {
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

    async function handleDelete() {
        try {
            const { result } = await deleteDeploymentTemplate(state.data.environmentConfig.id, +appId, +envId)
            toast.success('Restored to global.', { autoClose: null })
            dispatch({
                type: DeploymentConfigStateActionTypes.duplicate,
                payload: null,
            })
            initialise(true)
        } catch (err) {
        } finally {
            dispatch({ type: DeploymentConfigStateActionTypes.toggleDialog })
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
            statesToUpdate['yamlMode'] = _currentViewEditor === EDITOR_VIEW.BASIC ? false : true
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

    if (loading || state.loading || parentState === ComponentStates.loading) {
        return <Progressing size={48} fullHeight />
    }

    return (
        <div
            className={`app-compose__deployment-config bcn-0 ${
                state.openComparison || state.showReadme ? 'full-view' : 'h-100'
            }`}
        >
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
                    handleDelete={handleDelete}
                    isGrafanaModuleInstalled={grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED}
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
    handleDelete,
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

    async function handleSubmit(e) {
        e.preventDefault()
        if (!obj && state.yamlMode) {
            toast.error(error)
            return
        }
        if (
            (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) &&
            !state.yamlMode &&
            !state.basicFieldValuesErrorObj.isValid
        ) {
            toast.error('Some required fields are missing')
            return
        }
        const api =
            state.data.environmentConfig && state.data.environmentConfig.id > 0
                ? updateDeploymentTemplate
                : createDeploymentTemplate
        const envOverrideValuesWithBasic =
            !state.yamlMode && patchBasicData(obj || state.duplicate, state.basicFieldValues)
        const payload = {
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
        try {
            setLoading(not)
            await api(+appId, +envId, payload)
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
                        yamlMode: !state.yamlMode,
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

    const closeConfirmationDialog = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleDialog })
    }

    const handleReadMeClick = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: {
                showReadme: !state.showReadme,
                openComparison: state.showReadme && state.selectedTabIndex === 2 ? true : false,
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
                if (state.openComparison) {
                    dispatch({
                        type: DeploymentConfigStateActionTypes.yamlMode,
                        payload: state.isBasicLocked,
                    })
                    handleComparisonClick()
                }
                break
            case 2:
                if (!state.openComparison) {
                    dispatch({
                        type: DeploymentConfigStateActionTypes.yamlMode,
                        payload: true,
                    })
                    handleComparisonClick()
                }
                break
            case 3:
                // Edit draft mode -> same as values
                break
            default:
                break
        }
    }

    const overridden = !!state.duplicate
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
                    {loading ? <Progressing /> : overridden ? 'Delete override' : 'Allow override'}
                </span>
            </div>
        )
    }

    const appMetricsEnvironmentVariableEnabled = window._env_ && window._env_.APPLICATION_METRICS_ENABLED

    return (
        <DeploymentConfigContext.Provider
            value={{
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
            }}
        >
            <ConfigToolbar
                loading={state.loading || state.chartConfigLoading}
                selectedTabIndex={state.selectedTabIndex}
                handleTabSelection={handleTabSelection}
                noReadme={!state.yamlMode}
                showReadme={state.showReadme}
                handleReadMeClick={handleReadMeClick}
                handleCommentClick={noop}
                isDraftMode={false}
                handleDiscardDraft={noop}
                isApprovalPending={false}
                approvalUsers={[]}
                activityHistory={[]}
            />
            {state.selectedTabIndex !== 2 && !state.showReadme && renderOverrideInfoStrip()}
            <form
                className={`deployment-template-override-form h-100 ${state.openComparison ? 'comparison-view' : ''}`}
                onSubmit={handleSubmit}
            >
                <DeploymentTemplateOptionsTab
                    disableVersionSelect={!state.duplicate}
                    codeEditorValue={
                        tempValue
                            ? tempValue
                            : state
                            ? state.duplicate
                                ? YAML.stringify(state.duplicate, { indent: 2 })
                                : YAML.stringify(state.data.globalConfig, { indent: 2 })
                            : ''
                    }
                />
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
                        selectedChart={state.selectedChart}
                    />
                )}
            </form>
            {state.dialog && (
                <ConfirmationDialog>
                    <ConfirmationDialog.Icon src={warningIcon} />
                    <ConfirmationDialog.Body
                        title="This action will cause permanent removal."
                        subtitle="This action will cause all overrides to erase and app level configuration will be applied"
                    />
                    <ConfirmationDialog.ButtonGroup>
                        <button
                            data-testid="cancel-changes-button"
                            type="button"
                            className="cta cancel"
                            onClick={closeConfirmationDialog}
                        >
                            Cancel
                        </button>
                        <button
                            data-testid="confirm-changes-button"
                            type="button"
                            className="cta delete"
                            onClick={handleDelete}
                        >
                            Confirm
                        </button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            )}
        </DeploymentConfigContext.Provider>
    )
}
