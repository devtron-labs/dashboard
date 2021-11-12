import React, { useEffect, useState } from 'react';
import { getDeploymentTemplate, updateDeploymentTemplate, saveDeploymentTemplate, toggleAppMetrics as updateAppMetrics } from './service';
import { getChartReferences } from '../../services/service';
import { Toggle, Progressing, ConfirmationDialog, useJsonYaml, isVersionLessThanOrEqualToTarget, Checkbox } from '../common';
import { useEffectAfterMount, showError, usePrevious } from '../common/helpers/Helpers'
import { useParams, useHistory } from 'react-router'
import { toast } from 'react-toastify';
import CodeEditor from '../CodeEditor/CodeEditor'
import warningIcon from '../../assets/icons/ic-info-filled.svg'
import { ReactComponent as File } from '../../assets/icons/ic-file.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import Help from '../../assets/icons/ic-help-green.svg';
import ReactSelect from 'react-select';
import { DOCUMENTATION } from '../../config';
import './deploymentConfig.scss';
import { ReactComponent as HelpOutline } from '../../assets/icons/ic-help-outline.svg';

export function OptApplicationMetrics({ currentVersion, appMatrixEnabled = false, chartVersions = [], selectedChart = null, onChange, opted, focus = false, loading, className = "", disabled = false, onInfoClick, chartConfig }) {
    let isChartVersionSupported = isVersionLessThanOrEqualToTarget(currentVersion, [3, 7, 0]);
    const appMetricsEnvironmentVariableEnabled = window._env_ && window._env_.APPLICATION_METRICS_ENABLED;

    return <div id="opt-metrics" className={`flex column left br-0  ${focus ? 'animate-background' : ''} ${className}`}>
        <div className="p-lr-20 p-13 flex left content-space" style={{ width: '100%' }}>
            {chartVersions && selectedChart && appMetricsEnvironmentVariableEnabled ?
                <div className="flex left">
                    <Checkbox isChecked={appMatrixEnabled}
                        onClick={(e) => { e.stopPropagation() }}
                        rootClassName="form__checkbox-label--ignore-cache"
                        value={"CHECKED"}
                        disabled={disabled || isChartVersionSupported}
                        onChange={onChange}
                    >
                    </Checkbox>
                    <div className="ml-14">
                        <b>Show application metrics</b><HelpOutline className="icon-dim-20 ml-8 vertical-align-middle mr-5 pointer" onClick={onInfoClick} />
                        <div>Capture and show key application metrics over time. (E.g. Status codes 2xx, 3xx, 5xx; throughput and latency).</div>
                    </div>
                </div> : <div />}
            <div>
                <button className="cta" type="submit">{loading ? <Progressing /> : chartConfig?.id ? 'Save' : 'Save & Next'}</button>
            </div>
        </div>
        {isChartVersionSupported && <div className="flex left p-lr-20 chart-version-warning" style={{ width: '100%', position: "absolute", bottom: 60 }}>
            <img />
            <span>Application metrics is not supported for the selected chart version. Update to the latest chart version and re-deploy the application to view metrics.</span>
        </div>}
    </div>
}

const RecommandedTab = () => {
    return <div className="app-matrix-outer pt-10 pb-10 pl-16 pr-16 br-4 bw-1 bcv-1 flexbox-col mt-20">
        <div className="align-start flex left ">
            <img src={Help} className="icon-dim-20 mt-2" style={{ alignItems: 'flex-start' }} />
            <div className="ml-8 fs-13">
                <span className="fw-6 text-capitalize">Recommended: </span>Try enabling metrics for a non-prod environment before you do it for Production.
       </div>
        </div>
    </div>
}

const DesiredConfig: React.FC<{ port: string, supportStreaming: boolean, useHTTP2: boolean, useGPRC: boolean }> = ({ port, supportStreaming, useHTTP2, useGPRC }) => {
    return <div className="mt-20">
        <span className="fw-6 fs-14">Desired configurations for {port} port</span>
        <div className="p-8 bcn-1 mt-12">
            <span className="fs-13">ContainerPort:</span>
            <div className="align-start flex left ">
                <p>-</p>
                <div className="ml-8 fs-13">
                    <div>supportStreaming: {supportStreaming.toString()}</div>
                    <div>useHTTP2: {useHTTP2.toString()}</div>
                    <div>useGPRC: {useGPRC.toString()}</div>
                </div>
            </div>
        </div>
    </div>
}

export default function DeploymentConfig({ respondOnSuccess }) {
    const [loading, setLoading] = useState(false);
    const [chartVersions, setChartVersions] = useState<{ id: number, version: string; }[]>(null);
    const [selectedChart, selectChart] = useState<{ id: number, version: string; }>(null)
    const [isAppMetricsEnabled, toggleAppMetrics] = useState(null);
    const [isAppMetricsTabVisible, setAppMetricsTabVisible] = useState(null);
    const [appMetricsLoading, setAppMetricsLoading] = useState(false);
    const [chartConfigLoading, setChartConfigLoading] = useState(null);
    const { appId } = useParams<{ appId }>();
    const [chartConfig, setChartConfig] = useState(null)

    async function initialise() {
        setChartConfigLoading(true)
        try {
            const { result: { chartRefs, latestAppChartRef, latestChartRef } } = await getChartReferences(+appId)
            setChartVersions(chartRefs);
            let selectedChartId: number = latestAppChartRef || latestChartRef;
            let chart = chartRefs.find(chart => chart.id === selectedChartId);
            selectChart(chart);
        }
        catch (err) {

        }
        finally {
            setChartConfigLoading(false)
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

    return <div style={{ display: 'grid', gridTemplateColumns: isAppMetricsTabVisible ? '50% 50%' : '100%', height: '100%', overflow: 'hidden' }}>
        <DeploymentConfigForm
            respondOnSuccess={respondOnSuccess}
            loading={loading} setLoading={setLoading}
            chartVersions={chartVersions}
            setChartVersions={setChartVersions}
            selectedChart={selectedChart}
            selectChart={selectChart}
            toggleAppMetrics={toggleAppMetrics}
            isAppMetricsEnabled={isAppMetricsEnabled}
            appMetricsLoading={appMetricsLoading}
            setAppMetricsLoading={setAppMetricsLoading}
            chartConfigLoading={chartConfigLoading}
            setChartConfigLoading={setChartConfigLoading}
            initialise={initialise}
            setChartConfig={setChartConfig}
            setAppMetricsTabVisible={setAppMetricsTabVisible}
            isAppMetricsTabVisible={isAppMetricsTabVisible}
            chartConfig={chartConfig}
            height={height}
            appId={appId} />
        {isAppMetricsTabVisible &&
            <ApplicationmatrixInfo setAppMetricsTabVisible={setAppMetricsTabVisible} isEnvOverride={false} height={height - 205} />}
    </div>
}

export function ApplicationmatrixInfo({ setAppMetricsTabVisible, isEnvOverride, height }) {
    return (
        <>
            <form action="" className="white-card white-card__deployment-config br-0 bw-0">
                <div className={`flex left content-space ${isEnvOverride ? 'app-matrix-header-override' : 'app-matrix-header'}`}>
                    <span className="fw-6 fs-14">Using application metrics</span>
                    <Close className="icon-dim-20 pointer" onClick={() => setAppMetricsTabVisible(false)} />
                </div>
                <div className="app-matrix-inner p-20" style={{ height: height }}>
                    <div className="fs-13">Once you enable application metrics and redeploy, all the requests to your service will be passed through a transparent proxy (envoy), which is used as a sidecar to your main container.</div>
                    <RecommandedTab />
                    <DesiredConfig port='http1' supportStreaming={false} useHTTP2={false} useGPRC={false} />
                    <DesiredConfig port='http2' supportStreaming={true} useHTTP2={true} useGPRC={true} />
                    <div className="fw-6 fs-14 mt-20">Configure desired resources for envoyproxy sidecar</div>
                    <div className="fs-13">Configure resources for envoyproxy based on the traffic your micro-service is expected to handle.<br />
                    The below configs are recommended for a traffic of upto 5000rpm per replica.</div>
                    <div className="p-8 bcn-1 mt-12">
                        <span className="fs-13">envoyproxy:</span>
                        <div className="align-start flex left ">
                            <div className="ml-8 fs-13">
                                <div className="ml-5">
                                    image: envoyproxy/envoy:v1.14.1:<br />
                                configMapName: "":<br />
                                resources::<br />
                                </div>
                                <div className="ml-15">
                                    limits::<br /></div>
                                <div className="ml-25">
                                    cpu: 50m:<br />
                                memory: 50Mi:<br />
                                </div>
                                <div className="ml-15">
                                    requests::<br /></div>
                                <div className="ml-25">
                                    cpu: 50m:<br />
                                memory: 50Mi
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

function DeploymentConfigForm({ respondOnSuccess, loading, setLoading, chartVersions, setChartVersions, selectedChart, selectChart, toggleAppMetrics, isAppMetricsEnabled, appMetricsLoading, setAppMetricsLoading,
    chartConfigLoading, setChartConfigLoading, initialise, appId, chartConfig, setChartConfig, height, setAppMetricsTabVisible, isAppMetricsTabVisible }) {
    const [template, setTemplate] = useState("")
    const [tempFormData, setTempFormData] = useState("")
    const [obj, json, yaml, error] = useJsonYaml(tempFormData, 4, 'yaml', true);
    const [showConfirmation, toggleConfirmation] = useState(false)
    const history = useHistory();

    useEffect(() => {
        initialise()
    }, [])

    useEffectAfterMount(() => {
        fetchDeploymentTemplate();
        // initialise()
    }, [selectedChart])

    async function fetchDeploymentTemplate() {
        setChartConfigLoading(true)
        try {
            const { result: { globalConfig: { defaultAppOverride, id, refChartTemplate, refChartTemplateVersion, isAppMetricsEnabled, chartRefId } } } = await getDeploymentTemplate(+appId, selectedChart.id)
            setTemplate(defaultAppOverride)
            setChartConfig({ id, refChartTemplate, refChartTemplateVersion, chartRefId })
            toggleAppMetrics(isAppMetricsEnabled)
            setTempFormData(JSON.stringify(defaultAppOverride, null, 2))
        }
        catch (err) {
            showError(err);
        }
        finally {
            setChartConfigLoading(false)
            if (appMetricsLoading) {
                setAppMetricsLoading(false)
            }
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!obj) {
            toast.error(error)
            return
        }
        if (chartConfig.id) {
            //update flow, might have overridden
            toggleConfirmation(true)
        }
        else save()
    }

    async function save() {
        setLoading(true)
        try {
            let requestBody = {
                ...(chartConfig.chartRefId === selectedChart.id ? chartConfig : {}),
                appId: +appId,
                chartRefId: selectedChart.id,
                valuesOverride: obj,
                defaultAppOverride: template,
                isAppMetricsEnabled
            }
            const api = chartConfig.id ? updateDeploymentTemplate : saveDeploymentTemplate
            const { result } = await api(requestBody)
            fetchDeploymentTemplate();
            respondOnSuccess();
            toast.success(
                <div className="toast">
                    <div className="toast__title">{chartConfig.id ? 'Updated' : 'Saved'}</div>
                    <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                </div>
            )
            if (!chartConfig.id) {
                let url = 'app/${appId}/edit/workflow';
                history.push(url);
            }
        }
        catch (err) {
            showError(err)
        }
        finally {
            setLoading(false)
            toggleConfirmation(false)
        }
    }

    function saveAppMetrics(appMetricsEnabled) {
        toggleAppMetrics(appMetricsEnabled)
        setAppMetricsTabVisible(appMetricsEnabled);
    }

    return (
        <>
            <form action="" className="p-0 white-card white-card__deployment-config br-0 bw-0" onSubmit={handleSubmit}>
                <div className="p-12 flex left content-space">
                    <ReactSelect options={chartVersions}
                        isMulti={false}
                        getOptionLabel={option => `Chart version ${option.version}`}
                        getOptionValue={option => `${option.id}`}
                        value={selectedChart}
                        components={{
                            IndicatorSeparator: null
                        }}
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                boxShadow: 'none',
                                border: `solid 1px var(--N200)`,
                                width: '168px',
                                backgroundColor: '#f7fafc'
                            }),
                            option: (base, state) => {
                                return ({
                                    ...base,
                                    color: 'var(--N900)',
                                    backgroundColor: state.isFocused ? '#f7fafc' : 'white',
                                    fontSize: '12px',
                                })
                            },
                            menu: (base, state) => {
                                return ({
                                    ...base,
                                    width: '168px'
                                })
                            }
                        }}
                        onChange={(selected) => selectChart(selected as { id: number, version: string })}
                    />
                    <div className="pointer flex">
                        <File className="icon-dim-20" />
                        <a rel="noreferrer noopener" className="ml-4 fs-13 cn-7" href={DOCUMENTATION.APP_CREATE_DEPLOYMENT_TEMPLATE} target="_blank">Readme</a>
                    </div>
                </div>
                <div className="form__row--code-editor-container" style={{ height: height - 210 }}>
                    <CodeEditor
                        value={tempFormData}
                        onChange={resp => { setTempFormData(resp) }}
                        mode="yaml"
                        height={height - 210}
                        loading={chartConfigLoading}>
                    </CodeEditor>                </div>
                <OptApplicationMetrics
                    currentVersion={selectedChart?.version}
                    appMatrixEnabled={isAppMetricsEnabled}
                    chartVersions={chartVersions}
                    selectedChart={selectedChart}
                    onChange={e => saveAppMetrics(!isAppMetricsEnabled)}
                    opted={isAppMetricsEnabled}
                    loading={appMetricsLoading}
                    onInfoClick={e => setAppMetricsTabVisible(!isAppMetricsTabVisible)}
                    chartConfig={chartConfig}
                />
            </form>
            {showConfirmation && <ConfirmationDialog>
                <ConfirmationDialog.Icon src={warningIcon} />
                <ConfirmationDialog.Body title="Retain overrides and update" />
                <p>Changes will only be applied to environments using default configuration.</p>
                <p>Environments using overriden configurations will not be updated.</p>
                <ConfirmationDialog.ButtonGroup>
                    <button type="button" className="cta cancel" onClick={e => toggleConfirmation(false)}>Cancel</button>
                    <button type="button" className="cta" onClick={e => save()}>{loading ? <Progressing /> : chartConfig.id ? 'Update' : 'Save'}</button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>}
        </>
    )
}
