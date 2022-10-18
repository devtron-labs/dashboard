import React, { useState, useEffect, useReducer, useCallback, useContext } from 'react'
import { useParams } from 'react-router'
import {
    getDeploymentTemplate,
    createDeploymentTemplate,
    updateDeploymentTemplate,
    deleteDeploymentTemplate,
    chartRefAutocomplete,
} from './service'
import { getDeploymentTemplate as getBaseDeploymentTemplate } from '../deploymentConfig/service'
import { Override } from './ConfigMapOverrides'
import { showError, not, Progressing, ConfirmationDialog, useEffectAfterMount, useJsonYaml, useAsync } from '../common'
import { toast } from 'react-toastify'
import '../deploymentConfig/deploymentConfig.scss'
import warningIcon from '../../assets/img/warning-medium.svg'
import YAML from 'yaml'
import {
    DeploymentConfigFormCTA,
    DeploymentTemplateEditorView,
    DeploymentTemplateOptionsTab,
} from '../deploymentConfig/DeploymentTemplateView'
import { BasicFieldErrorObj, DeploymentChartVersionType } from '../deploymentConfig/types'
import { ComponentStates, DeploymentTemplateOverrideProps } from './EnvironmentOverrides.type'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleNameMap } from '../../config'
import { InstallationType, ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import {
    getBasicFieldValue,
    isBasicValueChanged,
    patchBasicData,
    updateTemplateFromBasicValue,
    validateBasicView,
} from '../deploymentConfig/DeploymentConfig.utils'
import { mainContext } from '../common/navigation/NavigationRoutes'
import * as jsonpatch from 'fast-json-patch'

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
    const initialState = {
        showReadme: false,
        openComparison: false,
        charts: [],
        selectedChart: null,
        basicFieldValues: null,
        basicFieldValuesErrorObj: null,
        yamlMode: true,
        isBasicViewLocked: null,
        currentViewEditor: null,
    }
    const memoisedReducer = useCallback(
        (state, action) => {
            switch (action.type) {
                case 'setResult':
                    return {
                        ...state,
                        data: action.value,
                        duplicate:
                            action.value.IsOverride || state.duplicate
                                ? action.value.environmentConfig.envOverrideValues || action.value.globalConfig
                                : null,
                    }
                case 'setCharts':
                    // Use other latest ref id instead of selectedChartRefId on delete override action
                    const _selectedChartId =
                        (!action.value.isDeleteAction && state.selectedChartRefId) ||
                        action.value.latestEnvChartRef ||
                        action.value.latestAppChartRef ||
                        action.value.latestChartRef
                    return {
                        ...state,
                        charts: action.value.chartRefs,
                        selectedChart: action.value.chartRefs?.find((chart) => chart.id === _selectedChartId),
                        selectedChartRefId: _selectedChartId,
                    }
                case 'createDuplicate':
                    return { ...state, duplicate: action.value, selectedChartRefId: state.data.globalChartRefId }
                case 'removeDuplicate':
                    return { ...state, duplicate: null }
                case 'selectChart':
                    return {
                        ...state,
                        selectedChart: action.value,
                        selectedChartRefId: action.value.id,
                    }
                case 'appMetrics':
                    return {
                        ...state,
                        data: {
                            ...state.data,
                            appMetrics: action.value,
                        },
                    }
                case 'showReadme':
                    return { ...state, showReadme: action.value }
                case 'openComparison':
                    return { ...state, openComparison: action.value }
                case 'toggleDialog':
                    return { ...state, dialog: !state.dialog }
                case 'reset':
                    return { ...initialState, selectedChartRefId: null }
                case 'changeEditorMode':
                    return { ...state, yamlMode: action.value }
                case 'setIsBasicViewLocked':
                    return { ...state, isBasicViewLocked: action.value }
                case 'multipleOptions':
                    return { ...state, ...action.value }
                case 'setBasicFieldValues':
                    return { ...state, basicFieldValues: action.value }
                case 'setBasicFieldValuesErrorObj':
                    return { ...state, basicFieldValuesErrorObj: action.value }
                default:
                    return state
            }
        },
        [appId, envId],
    )
    const [state, dispatch] = useReducer(memoisedReducer, initialState)

    useEffect(() => {
        dispatch({ type: 'reset' })
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
            dispatch({
                type: 'setCharts',
                value: {
                    ...result,
                    isDeleteAction,
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
            type: 'appMetrics',
            value: !state.data.appMetrics,
        })
    }

    async function fetchDeploymentTemplate() {
        try {
            const { result } = await getDeploymentTemplate(
                +appId,
                +envId,
                state.selectedChartRefId || state.latestAppChartRef || state.latestChartRef,
            )
            if (result.IsOverride) {
                parseDataForView(
                  result.environmentConfig.isBasicViewLocked,
                  result.environmentConfig.currentViewEditor,
                  result.environmentConfig.envOverrideValues,
                )
            }
            dispatch({ type: 'setResult', value: result })
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
                dispatch({ type: 'toggleDialog' })
            } else {
                //remove copy
                dispatch({ type: 'removeDuplicate' })
            }
        } else {
            //create copy
            parseDataForView(
                state.data.environmentConfig.isBasicViewLocked,
                state.data.environmentConfig.currentViewEditor,
                state.duplicate || state.data.globalConfig,
            )
            dispatch({ type: 'createDuplicate', value: state.data.globalConfig })
        }
    }

    async function handleDelete() {
        try {
            const { result } = await deleteDeploymentTemplate(state.data.environmentConfig.id, +appId, +envId)
            toast.success('Restored to global.', { autoClose: null })
            dispatch({ type: 'removeDuplicate' })
            initialise(true)
        } catch (err) {
        } finally {
            dispatch({ type: 'toggleDialog' })
        }
    }

    const parseDataForView = async (isBasicViewLocked: boolean, currentViewEditor: string, template): Promise<void> => {
        let _currentViewEditor
        if (!currentViewEditor) {
            isBasicViewLocked = false
        } else if (currentViewEditor === '' || currentViewEditor === 'UNDEFINED') {
            const {
                result: {
                    globalConfig: { defaultAppOverride },
                },
            } = await getBaseDeploymentTemplate(
                +appId,
                state.selectedChartRefId || state.latestAppChartRef || state.latestChartRef,
            )
            isBasicViewLocked = isBasicValueChanged(defaultAppOverride, template)
        } else {
            _currentViewEditor = currentViewEditor
        }
        _currentViewEditor =
            isBasicViewLocked || currentServerInfo.serverInfo.installationType === InstallationType.ENTERPRISE
                ? 'ADVANCED'
                : 'BASIC'
        if (!isBasicViewLocked) {
            const _basicFieldValues = getBasicFieldValue(template)
            dispatch({
                type: 'multipleOptions',
                value: {
                    basicFieldValues: _basicFieldValues,
                    basicFieldValuesErrorObj: validateBasicView(_basicFieldValues),
                    yamlMode: _currentViewEditor === 'BASIC' ? false : true,
                    currentViewEditor: _currentViewEditor,
                    isBasicViewLocked: false,
                },
            })
        } else {
            dispatch({
                type: 'multipleOptions',
                value: {
                    yamlMode: _currentViewEditor === 'BASIC' ? false : true,
                    currentViewEditor: _currentViewEditor,
                    isBasicViewLocked: true,
                },
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
    const [fetchedValues, setFetchedValues] = useState<Record<number, string>>({})
    const [basicFieldPatchData, setBasicFieldPatchData] = useState<Record<string, jsonpatch.Operation>>(null)

    useEffect(() => {
        // Reset editor value on delete override action
        if (!state.duplicate && tempValue) {
            editorOnChange('')
        }
    }, [state.duplicate])

    async function handleSubmit(e) {
        e.preventDefault()
        if (!obj) {
            toast.error(error)
            return
        }
        const api =
            state.data.environmentConfig && state.data.environmentConfig.id > 0
                ? updateDeploymentTemplate
                : createDeploymentTemplate
        const payload = {
            environmentId: +envId,
            envOverrideValues: obj,
            chartRefId: state.selectedChartRefId,
            IsOverride: true,
            isAppMetricsEnabled: state.data.appMetrics,
            currentViewEditor: state.currentViewEditor,
            isBasicViewLocked: state.isBasicViewLocked,
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
            setFetchedValues({})
            initialise(false, true)
        } catch (err) {
            showError(err)
        } finally {
            setLoading(not)
        }
    }

    const handleReadMeClick = () => {
        dispatch({
            type: 'showReadme',
            value: !state.showReadme,
        })

        if (state.openComparison) {
            dispatch({
                type: 'openComparison',
                value: false,
            })
        }
    }

    const changeEditorMode = (): void => {
        if (state.basicFieldValuesErrorObj && !state.basicFieldValuesErrorObj.isValid) {
            toast.error('Some required fields are missing')
            return
        }
        if (state.isBasicViewLocked) {
            return
        }
        const parsedCodeEditorValue = YAML.parse(tempValue)
        if (state.yamlMode) {
            const _basicFieldValues = getBasicFieldValue(parsedCodeEditorValue)
            dispatch({
                type: 'multipleOptions',
                value: {
                    basicFieldValues: _basicFieldValues,
                    basicFieldValuesErrorObj: validateBasicView(_basicFieldValues),
                    yamlMode: !state.yamlMode,
                },
            })
            return
        } else if (basicFieldPatchData !== null) {
            const newTemplate = patchBasicData(parsedCodeEditorValue, basicFieldPatchData)
            updateTemplateFromBasicValue(newTemplate)
            editorOnChange(YAML.stringify(newTemplate), state.yamlMode)
        }
        dispatch({
            type: 'changeEditorMode',
            value: true,
        })
    }

    const handleComparisonClick = () => {
        dispatch({
            type: 'openComparison',
            value: !state.openComparison,
        })

        if (state.showReadme) {
            dispatch({
                type: 'showReadme',
                value: false,
            })
        }
    }

    const editorOnChange = (str: string, fromBasic?: boolean): void => {
        setTempValue(str)
        if (str && state.currentViewEditor && !state.isBasicViewLocked && !fromBasic) {
            dispatch({
                type: 'setIsBasicViewLocked',
                value: isBasicValueChanged(YAML.parse(str)),
            })
        }
    }

    const handleSelectChart = (selectedChart: DeploymentChartVersionType) => {
        dispatch({ type: 'selectChart', value: selectedChart })
    }

    const setBasicFieldValues = (basicFieldValues: Record<string, any>) => {
        dispatch({ type: 'setBasicFieldValues', value: basicFieldValues })
    }

    const setBasicFieldValuesErrorObj = (basicFieldErrorObj: BasicFieldErrorObj) => {
        dispatch({ type: 'setBasicFieldValuesErrorObj', value: basicFieldErrorObj })
    }

    const closeConfirmationDialog = () => {
        dispatch({ type: 'toggleDialog' })
    }

    const appMetricsEnvironmentVariableEnabled = window._env_ && window._env_.APPLICATION_METRICS_ENABLED

    return (
        <>
            <form
                className={`deployment-template-override-form h-100 ${state.openComparison ? 'comparison-view' : ''}`}
                onSubmit={handleSubmit}
            >
                <Override
                    external={false}
                    overridden={!!state.duplicate}
                    onClick={handleOverride}
                    type="deployment template"
                />
                <DeploymentTemplateOptionsTab
                    isEnvOverride={true}
                    isComparisonAvailable={true}
                    isUnSet={false}
                    environmentName={environmentName}
                    disableVersionSelect={!state.duplicate}
                    openComparison={state.openComparison}
                    handleComparisonClick={handleComparisonClick}
                    chartConfigLoading={chartRefLoading}
                    isReadMeAvailable={!!state.data.readme}
                    openReadMe={state.showReadme}
                    handleReadMeClick={handleReadMeClick}
                    charts={state.charts}
                    selectedChart={state.selectedChart}
                    selectChart={handleSelectChart}
                    selectedChartRefId={state.selectedChartRefId}
                    yamlMode={state.yamlMode}
                    isBasicViewLocked={state.isBasicViewLocked}
                    codeEditorValue={
                        tempValue
                            ? tempValue
                            : state
                            ? state.duplicate
                                ? YAML.stringify(state.duplicate, { indent: 2 })
                                : YAML.stringify(state.data.globalConfig, { indent: 2 })
                            : ''
                    }
                    basicFieldValuesErrorObj={state.basicFieldValuesErrorObj}
                    changeEditorMode={changeEditorMode}
                />
                <DeploymentTemplateEditorView
                    appId={appId}
                    envId={envId}
                    isUnSet={false}
                    isEnvOverride={true}
                    openComparison={state.openComparison}
                    showReadme={state.showReadme}
                    chartConfigLoading={chartRefLoading}
                    readme={state.data.readme}
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
                    schemas={state.data.schema}
                    charts={state.charts || []}
                    selectedChart={state.selectedChart}
                    environments={environments || []}
                    environmentName={environmentName}
                    fetchedValues={fetchedValues}
                    setFetchedValues={setFetchedValues}
                    readOnly={!state.duplicate}
                    globalChartRefId={state.data.globalChartRefId}
                    yamlMode={state.yamlMode}
                    changeEditorMode={changeEditorMode}
                    basicFieldValues={state.basicFieldValues}
                    setBasicFieldValues={setBasicFieldValues}
                    basicFieldPatchData={basicFieldPatchData}
                    setBasicFieldPatchData={setBasicFieldPatchData}
                    basicFieldValuesErrorObj={state.basicFieldValuesErrorObj}
                    setBasicFieldValuesErrorObj={setBasicFieldValuesErrorObj}
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
                        currentChart={state.selectedChart}
                        toggleAppMetrics={handleAppMetrics}
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
                        <button type="button" className="cta cancel" onClick={closeConfirmationDialog}>
                            Cancel
                        </button>
                        <button type="button" className="cta delete" onClick={handleDelete}>
                            Confirm
                        </button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            )}
        </>
    )
}
