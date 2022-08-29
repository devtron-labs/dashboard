import React, { useState, useEffect, useReducer, useCallback } from 'react'
import { useParams } from 'react-router'
import ReadmeConfig from '../deploymentConfig/ReadmeConfig'
import {
    getDeploymentTemplate,
    createDeploymentTemplate,
    updateDeploymentTemplate,
    deleteDeploymentTemplate,
    createNamespace,
    toggleAppMetrics,
    chartRefAutocomplete,
} from './service'
import fileIcon from '../../assets/icons/ic-file.svg'
import arrowTriangle from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as ArrowSquareOut } from '../../assets/icons/misc/arrowSquareOut.svg'
import { Override } from './ConfigMapOverrides'
import {
    Select,
    mapByKey,
    showError,
    not,
    Progressing,
    ConfirmationDialog,
    VisibleModal,
    Info,
    useEffectAfterMount,
    useJsonYaml,
} from '../common'
import CodeEditor from '../CodeEditor/CodeEditor'
import { toast } from 'react-toastify'
import '../deploymentConfig/deploymentConfig.scss'
import warningIcon from '../../assets/img/warning-medium.svg'
import { MODES } from '../../../src/config/constants'
import YAML from 'yaml'
import { ReactComponent as DiffIcon } from '../../assets/icons/ic-compare.svg'
import {
    DeploymentConfigFormCTA,
    DeploymentTemplateEditorView,
    DeploymentTemplateOptionsTab,
} from '../deploymentConfig/DeploymentTemplateView'
import { DeploymentChartVersionType } from '../deploymentConfig/types'

export default function DeploymentTemplateOverride({
    parentState,
    setParentState,
    environments,
    environmentName,
    ...props
}) {
    const { appId, envId } = useParams<{ appId; envId }>()
    const [loading, setLoading] = useState(false)
    const [chartRefLoading, setChartRefLoading] = useState(null)

    const initialState = {
        showReadme: false,
        openComparison: false,
        charts: [],
        selectedChart: null,
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
                    const _selectedChartId =
                        state.selectedChartRefId ||
                        action.value.latestEnvChartRef ||
                        action.value.latestAppChartRef ||
                        action.value.latestChartRef
                    return {
                        ...state,
                        charts: action.value.chartRefs,
                        selectedChart: action.value.chartRefs.find((chart) => chart.id === _selectedChartId),
                        selectedChartRefId: _selectedChartId,
                    }
                case 'createDuplicate':
                    return { ...state, duplicate: action.value, selectedChartRefId: state.data.globalChartRefId }
                case 'removeDuplicate':
                    return { ...state, duplicate: null }
                case 'selectChart':
                    return {
                        ...state,
                        selectedChart: action.value.selectedChart,
                        selectedChartRefId: action.value.selectedChartRefId,
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

    async function initialise() {
        setChartRefLoading(true)
        try {
            const { result } = await chartRefAutocomplete(+appId, +envId)
            dispatch({ type: 'setCharts', value: result })
        } catch (err) {
            setParentState('failed')
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
            dispatch({ type: 'setResult', value: result })
            setParentState('loaded')
        } catch (err) {
            setParentState('failed')
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
            dispatch({ type: 'createDuplicate', value: state.data.globalConfig })
        }
    }

    async function handleDelete() {
        try {
            const { result } = await deleteDeploymentTemplate(state.data.environmentConfig.id, +appId, +envId)
            toast.success('Restored to global.', { autoClose: null })
            dispatch({ type: 'removeDuplicate' })
            initialise()
        } catch (err) {
        } finally {
            dispatch({ type: 'toggleDialog' })
        }
    }

    if (loading || state.loading || chartRefLoading || parentState === 'loading') {
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
}) {
    const [tempValue, setTempValue] = useState('')
    const [obj, json, yaml, error] = useJsonYaml(tempValue, 4, 'yaml', true)
    const [loading, setLoading] = useState(false)
    const { appId, envId } = useParams<{ appId; envId }>()
    const [fetchedValues, setFetchedValues] = useState<Record<number, string>>({})

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
            initialise()
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

    const editorOnChange = (str: string): void => {
        setTempValue(str)
    }

    const handleSelectChart = (selectedChart: DeploymentChartVersionType) => {
        dispatch({ type: 'selectChart', value: selectedChart })
    }

    const appMetricsEnvironmentVariableEnabled = window._env_ && window._env_.APPLICATION_METRICS_ENABLED

    return (
        <>
            <form
                className={`deployment-template-override-form ${state.openComparison ? 'comparison-view' : ''}`}
                style={{ marginBottom: '16px' }}
                onSubmit={handleSubmit}
            >
                {!state.openComparison && !state.showReadme && (
                    <Override
                        external={false}
                        overridden={!!state.duplicate}
                        onClick={handleOverride}
                        type="deployment template"
                    />
                )}
                <DeploymentTemplateOptionsTab
                    isEnvOverride={true}
                    isComparisonAvailable={true}
                    isUnSet={false}
                    environmentName={environmentName}
                    disableVersionSelect={!state.duplicate}
                    openComparison={state.openComparison}
                    handleComparisonClick={handleComparisonClick}
                    fetchingReadMe={chartRefLoading}
                    isReadMeAvailable={!!state.data.readme}
                    openReadMe={state.showReadme}
                    handleReadMeClick={handleReadMeClick}
                    charts={state.charts}
                    selectedChart={state.selectedChart}
                    selectChart={handleSelectChart}
                    selectedChartRefId={state.selectedChartRefId}
                />
                <DeploymentTemplateEditorView
                    appId={appId}
                    envId={+envId}
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
                        state && state.data && state.duplicate
                            ? YAML.stringify(state.data.globalConfig, { indent: 2 })
                            : ''
                    }
                    editorOnChange={editorOnChange}
                    schemas={state.data.schema}
                    selectedChart={state.selectedChart}
                    environments={environments}
                    environmentName={environmentName}
                    fetchedValues={fetchedValues}
                    setFetchedValues={setFetchedValues}
                    readOnly={!state.duplicate}
                />
                {!state.openComparison && !state.showReadme && (
                    <DeploymentConfigFormCTA
                        loading={loading || chartRefLoading}
                        isEnvOverride={true}
                        disableButton={!state.duplicate}
                        disableCheckbox={!state.duplicate}
                        showAppMetricsToggle={
                            state.charts && state.selectedChart && appMetricsEnvironmentVariableEnabled
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
                        <button
                            type="button"
                            className="cta cancel"
                            onClick={(e) => dispatch({ type: 'toggleDialog' })}
                        >
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
