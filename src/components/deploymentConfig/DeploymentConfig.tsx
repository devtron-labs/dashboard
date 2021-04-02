import React, { useEffect, useState } from 'react';
import { getDeploymentTemplate, updateDeploymentTemplate, saveDeploymentTemplate, toggleAppMetrics as updateAppMetrics } from './service';
import { getChartReferences} from '../../services/service';
import { Toggle, Progressing, ConfirmationDialog, useJsonYaml } from '../common';
import { useEffectAfterMount, showError } from '../common/helpers/Helpers'
import { useParams } from 'react-router'
import { toast } from 'react-toastify';
import CodeEditor from '../CodeEditor/CodeEditor'
import warningIcon from '../../assets/icons/ic-info-filled.svg'
import ReactSelect from 'react-select';
import { DOCUMENTATION } from '../../config';
import './deploymentConfig.scss';

export function OptApplicationMetrics({ currentVersion, minimumSupportedVersion, onChange, opted, focus = false, loading, className = "", disabled = false }) {
    return <div id="opt-metrics" className={`flex column left white-card ${focus ? 'animate-background' : ''} ${className}`}>
        <div className="p-lr-20 m-tb-20 flex left" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div className="flex column left">
                <b style={{ marginBottom: '8px' }}>Show application metrics</b>
                <div>Capture and show key application metrics over time. (E.g. Status codes 2xx, 3xx, 5xx; throughput and latency).</div>
            </div>
            <div style={{ height: '20px', width: '32px' }}>
                {loading ? <Progressing /> : <Toggle disabled={disabled || (currentVersion < minimumSupportedVersion)} onSelect={onChange} selected={opted} />}
            </div>
        </div>
        {currentVersion < minimumSupportedVersion && <div className="flex left p-lr-20 chart-version-warning" style={{ width: '100%' }}>
            <img />
            <span>Application metrics is not supported for the selected chart version. Update to the latest chart version and re-deploy the application to view metrics.</span>
        </div>}
    </div>
}

export default function DeploymentConfig({ respondOnSuccess }) {
    return <div className="form__app-compose">
        <h3 className="form__title form__title--artifatcs">Deployment Template</h3>
        <p className="form__subtitle">Required to execute deployment pipelines for this application.&nbsp;
            <a rel="noreferrer noopener" className="learn-more__href" href={DOCUMENTATION.APP_CREATE_DEPLOYMENT_TEMPLATE} target="_blank">Learn more about Deployment Template Configurations</a>
        </p>
        <DeploymentConfigForm respondOnSuccess={respondOnSuccess} />
    </div>
}

function DeploymentConfigForm({ respondOnSuccess }) {
    const [chartVersions, setChartVersions] = useState<{ id: number, version: string; }[]>(null)
    const [selectedChart, selectChart] = useState<{ id: number, version: string; }>(null)
    const [template, setTemplate] = useState("")
    const [loading, setLoading] = useState(false)
    const [appMetricsLoading, setAppMetricsLoading] = useState(false)
    const [chartConfig, setChartConfig] = useState(null)
    const [isAppMetricsEnabled, toggleAppMetrics] = useState(null)
    const [tempFormData, setTempFormData] = useState("")
    const [obj, json, yaml, error] = useJsonYaml(tempFormData, 4, 'yaml', true);
    const [chartConfigLoading, setChartConfigLoading] = useState(null)
    const [showConfirmation, toggleConfirmation] = useState(false)

    useEffect(() => {
        initialise()
    }, [])

    // useEffectAfterMount(() => {
    //     if (typeof chartConfigLoading === 'boolean' && !chartConfigLoading) {
    //         fetchDeploymentTemplate()
    //     }
    // }, [chartConfigLoading])

    useEffectAfterMount(() => {
        fetchDeploymentTemplate();
        // initialise()
    }, [selectedChart])

    const { appId } = useParams<{ appId }>()

    async function saveAppMetrics(appMetricsEnabled) {
        try {
            setAppMetricsLoading(true)
            await updateAppMetrics(+appId, {
                isAppMetricsEnabled: appMetricsEnabled
            })
            toast.success(`Successfully ${appMetricsEnabled ? 'subscribed' : 'unsubscribed'}.`, { autoClose: null })
            initialise();
        }
        catch (err) {
            showError(err)
            setAppMetricsLoading(false)
        }
    }

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

    async function fetchDeploymentTemplate() {
        setChartConfigLoading(true)
        try {
            const { result: { globalConfig: { defaultAppOverride, id, refChartTemplate, refChartTemplateVersion, isAppMetricsEnabled, chartRefId } } } = await getDeploymentTemplate(+appId, selectedChart.id)
            setTemplate(defaultAppOverride)
            setChartConfig({ id, refChartTemplate, refChartTemplateVersion, chartRefId })
            toggleAppMetrics(isAppMetricsEnabled)
            setTempFormData(JSON.stringify(defaultAppOverride, null, 4))
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
        }
        catch (err) {
            showError(err)
        }
        finally {
            setLoading(false)
            toggleConfirmation(false)
        }
    }
    const appMetricsEnvironmentVariableEnabled = window._env_ && window._env_.APPLICATION_METRICS_ENABLED;
    return (
        <>
            <form action="" className="white-card white-card__deployment-config" onSubmit={handleSubmit}>
                <div className="form__row">
                    <div className="form__label">Chart version</div>
                    <ReactSelect options={chartVersions}
                        isMulti={false}
                        getOptionLabel={option => `${option.version}`}
                        getOptionValue={option => `${option.id}`}
                        value={selectedChart}
                        components={{
                            IndicatorSeparator: null
                        }}
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                boxShadow: 'none',
                                border: `solid 1px var(--B500)`
                            }),
                            option: (base, state) => {
                                return ({
                                    ...base,
                                    color: 'var(--N900)',
                                    backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                })
                            },
                        }}
                        onChange={(selected) => selectChart(selected as { id: number, version: string })}
                    />
                </div>
                <div className="form__row form__row--code-editor-container">
                    <CodeEditor
                        value={template ? JSON.stringify(template, null, 2) : ""}
                        onChange={resp => { setTempFormData(resp) }}
                        mode="yaml"
                        loading={chartConfigLoading}>
                        <CodeEditor.Header>
                            <CodeEditor.LanguageChanger />
                            <CodeEditor.ValidationError />
                        </CodeEditor.Header>
                    </CodeEditor>
                </div>
                <div className="form__buttons">
                    <button className="cta" type="submit">{loading ? <Progressing /> : 'Save'}</button>
                </div>
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
            {chartVersions && selectedChart && appMetricsEnvironmentVariableEnabled &&
                <OptApplicationMetrics
                    currentVersion={selectedChart?.version}
                    minimumSupportedVersion={"3.7.0"}
                    onChange={e => saveAppMetrics(!isAppMetricsEnabled)}
                    opted={isAppMetricsEnabled}
                    loading={appMetricsLoading}
                />
            }
        </>
    )
}
