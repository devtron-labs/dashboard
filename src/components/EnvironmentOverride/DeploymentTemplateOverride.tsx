import React, { useState, useEffect, useReducer, useCallback } from 'react'
import { useParams } from 'react-router'
import { getDeploymentTemplate, createDeploymentTemplate, updateDeploymentTemplate, deleteDeploymentTemplate, createNamespace, toggleAppMetrics, chartRefAutocomplete } from './service'
import fileIcon from '../../assets/icons/ic-file.svg'
import arrowTriangle from '../../assets/icons/ic-chevron-down.svg'
import { Override } from './ConfigMapOverrides'
import { Select, mapByKey, showError, not, Progressing, ConfirmationDialog, Info, useEffectAfterMount, useJsonYaml, Checkbox } from '../common'
import CodeEditor from '../CodeEditor/CodeEditor';
import { toast } from 'react-toastify'
import { OptApplicationMetrics } from '../deploymentConfig/DeploymentConfig'
import warningIcon from '../../assets/img/warning-medium.svg'
import YAML from 'yaml'
import { DOCUMENTATION } from '../../config';
import { ReactComponent as HelpOutline } from '../../assets/icons/ic-help-outline.svg';
import { ApplicationmatrixInfo } from '../deploymentConfig/DeploymentConfig'

export default function DeploymentTemplateOverride({ parentState, setParentState, ...props }) {
    const { appId, envId } = useParams<{ appId, envId }>()
    const [loading, setLoading] = useState(false)
    const [chartRefLoading, setChartRefLoading] = useState(null)

    const memoisedReducer = useCallback((state, action) => {
        switch (action.type) {
            case 'toggleCollapse':
                return { ...state, collapsed: !Boolean(state.collapsed) }
            case 'setResult':
                return {
                    ...state, data: action.value, duplicate: (action.value.IsOverride || state.duplicate) ? (action.value.environmentConfig.envOverrideValues || action.value.globalConfig) : null
                }
            case 'setCharts':
                return { ...state, charts: mapByKey(action.value.chartRefs, 'id'), selectedChartRefId: state.selectedChartRefId || action.value.latestEnvChartRef || action.value.latestAppChartRef || action.value.latestChartRef }
            case 'createDuplicate':
                return { ...state, duplicate: action.value, selectedChartRefId: state.data.globalChartRefId }
            case 'removeDuplicate':
                return { ...state, duplicate: null }
            case 'selectChart':
                return { ...state, selectedChartRefId: action.value }
            case 'appMetricsLoading':
                return { ...state, appMetricsLoading: true }
            case 'appMetricsEnabled':
                return { ...state, appMetricsEnabled: action.value }
            case 'appMetricsTabVisible':
                return { ...state, appMetricsTabVisible: action.value }
            case 'success':
            case 'error':
                return { ...state, appMetricsLoading: false }
            case 'toggleDialog':
                return { ...state, dialog: !state.dialog }
            case 'reset':
                return { collapsed: true, charts: new Map(), selectedChartRefId: null }
            default:
                return state
        }
    }, [appId, envId])
    const initialState = {
        collapsed: true,
        charts: new Map(),
    }
    const [state, dispatch] = useReducer(memoisedReducer, initialState)

    useEffect(() => {
        dispatch({ type: 'reset' })
        setLoading(true)
        initialise();
    }, [envId])

    useEffect(() => {
        if (typeof chartRefLoading === 'boolean' && !chartRefLoading && state.selectedChartRefId) {
            fetchDeploymentTemplate()
        }
    }, [chartRefLoading])

    useEffectAfterMount(() => {
        if (!state.selectedChartRefId) return
        initialise();
    }, [state.selectedChartRefId])

    async function initialise() {
        setChartRefLoading(true)
        try {
            const { result } = await chartRefAutocomplete(+appId, +envId)
            dispatch({ type: 'setCharts', value: result })
        }
        catch (err) {
            setParentState('failed')
            showError(err)
        }
        finally {
            setChartRefLoading(false)
        }
    }

    function handleAppMetrics(isOpted) {
        dispatch({ type: 'appMetricsLoading' })
        dispatch({ type: 'appMetricsEnabled', value: isOpted })
        dispatch({ type: 'appMetricsTabVisible', value: isOpted })
    }

    async function fetchDeploymentTemplate() {
        try {
            const { result } = await getDeploymentTemplate(+appId, +envId, (state.selectedChartRefId || state.latestAppChartRef || state.latestChartRef))
            dispatch({ type: 'setResult', value: result })
            dispatch({ type: 'appMetricsEnabled', value: result.isAppMetricsEnabled })
            setParentState('loaded')
        }
        catch (err) {
            setParentState('failed')
            showError(err)
        }
        finally {
            setLoading(false)
            if (state.appMetricsLoading) {
                toast.success(`Successfully ${state.data.appMetrics ? 'deactivated' : 'activated'} app metrics.`, { autoClose: null })
                dispatch({ type: 'success' })
            }
        }
    }

    async function handleOverride(e) {
        e.preventDefault();
        if (state.duplicate) {//permanent delete
            if (state.data.IsOverride) {
                dispatch({ type: 'toggleDialog' })
            }
            else {
                //remove copy
                dispatch({ type: 'removeDuplicate' })
            }
        }
        else {
            //create copy
            dispatch({ type: 'createDuplicate', value: state.data.globalConfig })
        }
    }

    async function handleDelete() {
        try {
            const { result } = await deleteDeploymentTemplate(state.data.environmentConfig.id, +appId, +envId);
            toast.success('Restored to global.', { autoClose: null })
            dispatch({ type: 'removeDuplicate' })
            initialise()
        } catch (err) { }
        finally {
            dispatch({ type: 'toggleDialog' })
        }
    }

    function setAppMetricsTabVisible() {
        dispatch({ type: 'appMetricsTabVisible', value: !state.appMetricsTabVisible })
    }

    if (loading || state.loading) return null
    if (parentState === 'loading') return null
    return (
        <>
            <section className="deployment-template-override white-card white-card--list br-0" style={{height: "100%"}}>
                {state.data && state.charts && <NameSpace originalNamespace={state.data.namespace} chartRefId={state.latestAppChartRef || state.latestChartRef} id={state.data.environmentConfig.id} data={state.data} isOverride={state.data.IsOverride} />}
                {state.data && state.charts && <DeploymentTemplateOverrideForm chartRefLoading={chartRefLoading} state={state} handleOverride={handleOverride} dispatch={dispatch} initialise={initialise} handleAppMetrics={(e) => handleAppMetrics(!state.appMetricsEnabled)} handleDelete={handleDelete} setAppMetricsTabVisible={(e) => setAppMetricsTabVisible()} />}
            </section>
        </>
    )
}

function DeploymentTemplateOverrideForm({ state, handleOverride, dispatch, initialise, handleAppMetrics, handleDelete, chartRefLoading, setAppMetricsTabVisible }) {
    const [tempValue, setTempValue] = useState("")
    const [obj, json, yaml, error] = useJsonYaml(tempValue, 4, 'yaml', true)
    const [loading, setLoading] = useState(false)
    const { appId, envId } = useParams<{ appId, envId }>()
    async function handleSubmit(e) {
        e.preventDefault();
        if (!obj) {
            toast.error(error)
            return
        }
        const api = state.data.environmentConfig && state.data.environmentConfig.id > 0 ? updateDeploymentTemplate : createDeploymentTemplate
        const payload = {
            envOverrideValues: obj,
            chartRefId: state.selectedChartRefId,
            IsOverride: true,
            ...(state.data.environmentConfig.id > 0 ? {
                id: state.data.environmentConfig.id,
                status: state.data.environmentConfig.status,
                manualReviewed: true,
                active: state.data.environmentConfig.active,
                namespace: state.data.environmentConfig.namespace
            } : {}),

        }
        try {
            setLoading(not)
            await api(+appId, +envId, payload);
            toast.success(
                <div className="toast">
                    <div className="toast__title">{state.data.environmentConfig && state.data.environmentConfig.id > 0 ? 'Updated override' : 'Overridden'}</div>
                    <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                </div>
                , { autoClose: null })
            initialise()
        }
        catch (err) {
            showError(err)
        }
        finally {
            setLoading(not)
        }
    }
    function getWindowDimensions() {
        const { innerWidth: width, innerHeight: height } = window;
        return {
            width,
            height
        };
    }

    function useWindowDimensions() {
        const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

        useEffect(() => {
            function handleResize() {
                setWindowDimensions(getWindowDimensions());
            }

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);

        return windowDimensions;
    }

    const { height, width } = useWindowDimensions();

    const appMetricsEnvironmentVariableEnabled = window._env_ && window._env_.APPLICATION_METRICS_ENABLED;
    return (
        <>
            <form className="deployment-template-override-form"onSubmit={handleSubmit} style={{height:'100%'}}>
                <Override
                    external={false}
                    overridden={!!state.duplicate}
                    onClick={handleOverride}
                    type="deployment template"
                />
                <div style={{ display: 'grid', gridTemplateColumns: state.appMetricsTabVisible ? '50% 50%' : '100%', overflow: 'hidden' }}>
                    <div className="code-editor-container br-0" style={{ borderWidth: 0, borderRightWidth:1, borderRadius:0 }}>
                        <CodeEditor
                            value={state ? state.duplicate ? YAML.stringify(state.duplicate, { indent: 4 }) : YAML.stringify(state.data.globalConfig, { indent: 4 }) : ""}
                            onChange={res => setTempValue(res)}
                            defaultValue={state && state.data && state.duplicate ? YAML.stringify(state.data.globalConfig, { indent: 4 }) : ""}
                            mode="yaml"
                            height={height-315}
                            tabSize={4}
                            readOnly={!state.duplicate}
                            loading={chartRefLoading}
                        >
                            <div className="border-bottom p-12" style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr', gridColumnGap: '16px' }}>
                                {!state.duplicate && <div className="flex left">
                                    <span className="form__label" style={{ marginBottom: 0 }}>Chart version: <span className="fw-6">{state.charts?.get(state.data.globalChartRefId).version} (read-only)</span></span>
                                </div>}
                                {state.duplicate && <div className="flex left column" style={{ width: !state.appMetricsTabVisible? '20%' : '40%', backgroundColor: '#f7fafc' }}>
                                    <Select onChange={e => dispatch({ type: 'selectChart', value: e.target.value })} value={state.selectedChartRefId} rootClassName="chart-version">
                                        <Select.Button style={{ height: '28px', paddingLeft: '8px', width: '100%' }}>
                                            <span>
                                                {state.selectedChartRefId ? "Chart version: " : 'Select chart'}
                                                <span className="fw-6">{state.selectedChartRefId && state.charts.get(state.selectedChartRefId).version}</span>
                                            </span>
                                        </Select.Button>
                                        {state.charts && Array.from(state.charts).map((value, idx) => <Select.Option key={idx} value={value[0]}>{value[1].version}</Select.Option>)}
                                    </Select>
                                </div>}
                                <div className={`flex ${state.duplicate ? 'content-space' : 'right'} mr-10`}>
                                    {state.duplicate && !state.appMetricsTabVisible &&
                                        <CodeEditor.SplitPane />}
                                    <a rel="noreferrer noopener" target="_blank" className="cn-9" href={DOCUMENTATION.APP_CREATE_DEPLOYMENT_TEMPLATE}><img src={fileIcon} alt="file-icon" /> Readme</a>
                                </div>
                            </div>
                            <CodeEditor.ValidationError />
                        </CodeEditor>
                    </div>
                    {state.appMetricsTabVisible && <ApplicationmatrixInfo setAppMetricsTabVisible={setAppMetricsTabVisible} isEnvOverride={true} height={height-315}/>}
                </div>
                <div className="flex content-space save_container p-10">
                    <div className="flex column left">
                        {state.charts && state.selectedChartRefId && appMetricsEnvironmentVariableEnabled ?
                        <div className="flex left">
                            <Checkbox isChecked={state.appMetricsEnabled}
                                onClick={(e) => { e.stopPropagation() }}
                                rootClassName="form__checkbox-label--ignore-cache"
                                value={"CHECKED"}
                                disabled={!state.duplicate || (state.data && !state.data.IsOverride)}
                                onChange={handleAppMetrics}
                            >
                            </Checkbox>
                            <div className="ml-14">
                                <b>Show application metrics</b><HelpOutline className="icon-dim-20 ml-8 vertical-align-middle mr-5 pointer" onClick={setAppMetricsTabVisible} />
                                <div>Capture and show key application metrics over time. (E.g. Status codes 2xx, 3xx, 5xx; throughput and latency).</div>
                            </div>
                        </div>: <div />}
                    </div>
                    <button className="cta" disabled={!state.duplicate}>{loading ? <Progressing /> : 'Save'}</button>
                </div>
            </form>
            {state.dialog && <ConfirmationDialog>
                <ConfirmationDialog.Icon src={warningIcon} />
                <ConfirmationDialog.Body title="This action will cause permanent removal." subtitle="This action will cause all overrides to erase and app level configuration will be applied" />
                <ConfirmationDialog.ButtonGroup>
                    <button type="button" className="cta cancel" onClick={e => dispatch({ type: 'toggleDialog' })}>Cancel</button>
                    <button type="button" className="cta delete" onClick={handleDelete}>Confirm</button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>}
        </>
    )
}

function NameSpace({ originalNamespace = "", chartRefId, id, data, isOverride }) {
    const [loading, setLoading] = useState(false)
    const { appId, envId } = useParams()
    const [namespace, setNamespace] = useState(originalNamespace)
    useEffect(() => {
        setNamespace(originalNamespace)
    }, [originalNamespace])
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(not)
        try {
            const { result } = await createNamespace(appId, envId, {
                "namespace": namespace,
                "chartRefId": chartRefId,
                id
            })
        }
        catch (err) {
            showError(err)
        }
        finally {
            setLoading(not)
        }
    }
    return (
        <div className="p-12 pointer flex left">
            <div className="flex left fs-14 cn-9 fw-5">{namespace} / Deployment template</div>
        </div>
    )
}