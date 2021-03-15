import React, { useEffect, useState } from 'react';
import { getDeploymentTemplate, updateDeploymentTemplate, saveDeploymentTemplate, getChartReferences, updateAppMetrics } from './service';
import { Toggle, Progressing, ConfirmationDialog } from '../common';
import { showError } from '../common/helpers/Helpers'
import { useParams } from 'react-router'
import { toast } from 'react-toastify';
import warningIcon from '../../assets/icons/ic-info-filled.svg';
import { DOCUMENTATION } from '../../config';
import { BasicDeploymentConfig } from './BasicDeploymentConfig';
import { AdvanceDeploymentConfig } from './AdvanceDeploymentConfig'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import { ReactComponent as Help } from '../../assets/icons/ic-info-outline.svg';
import ReadmeDeploymentTemplate from './ReadmeTemplateModal';
import Tippy from '@tippyjs/react';
import YAML from 'yaml';


export type DeploymentConfigType = "basic" | "advanced";

export interface DeploymentConfig {
    id: number;
    appId: number;
    chartRefId: number;
    chartRepositoryId: number;
    defaultAppOverride: any;
    isAppMetricsEnabled: boolean;
    latest: boolean;
    refChartTemplate: string;
    refChartTemplateVersion: string;
}

export default function DeploymentConfigForm({ respondOnSuccess }) {
    const { appId } = useParams<{ appId: string }>();
    const [configType, setConfigType] = useState<DeploymentConfigType>("basic");
    const [selectedChart, selectChart] = useState<{ id: number, version: string; }>(null)
    const [chartVersions, setChartVersions] = useState<{ id: number, version: string; }[]>(null)
    const [deploymentConfigLoading, setDeploymentConfigLoading] = useState(true);
    const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>();
    // const [obj, json, yaml, error] = useJsonYaml(deploymentConfig?.defaultAppOverride, 4, 'yaml', true);
    const [obj, setValuesOverride] = useState({})
    const [appMetricsLoading, setAppMetricsLoading] = useState(false)
    const [chartConfig, setChartConfig] = useState(null)
    const [showConfirmation, toggleConfirmation] = useState(false)
    const [isIngressCollapsed, toggleIngressCollapse] = useState(false);
    const [mapping, setMapping] = useState()
    const [advancedConfigTab, setAdvancedConfigTab] = useState<'json' | 'yaml'>('yaml');
    const appMetricsEnvironmentVariableEnabled = window._env_ && window._env_.APPLICATION_METRICS_ENABLED;

    useEffect(() => {
        async function fetchChartVersions() {
            try {
                const { result: { chartRefs, latestAppChartRef, latestChartRef } } = await getChartReferences(Number(appId));
                let selectedChartId: number = latestAppChartRef || latestChartRef;
                let chart = chartRefs.find(chart => chart.id === selectedChartId);
                setChartVersions(chartRefs);
                selectChart(chart);
            }
            catch (error) {
                showError(error)
            }
            finally {

            }
        }
        fetchChartVersions();
    }, [])

    useEffect(() => {
        fetchDeploymentTemplate();
    }, [selectedChart])

    function handleValuesOverride(value) {
        try {
            if (advancedConfigTab === 'json') setValuesOverride(value);
            else {
                let json = YAML.parse(value);
                setValuesOverride(json);
            }
        } catch (error) {

        }
    }

    async function fetchDeploymentTemplate() {
        try {
            const response = await getDeploymentTemplate(Number(appId), selectedChart.id);
            setDeploymentConfig(response.result.globalConfig);
            setValuesOverride(response.result.globalConfig.defaultAppOverride);
            setMapping(response.result.mapping);
            setDeploymentConfigLoading(false);
        }
        catch (err) {
            // showError(err);
        }
        finally {

        }
    }

    async function saveAppMetrics(appMetricsEnabled) {
        try {
            setAppMetricsLoading(true)
            await updateAppMetrics(Number(appId), {
                isAppMetricsEnabled: appMetricsEnabled
            })
            toast.success(`Successfully ${appMetricsEnabled ? 'subscribed' : 'unsubscribed'}.`, { autoClose: null })
        }
        catch (err) {
            showError(err)
            setAppMetricsLoading(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!obj) {
            toast.error("Invalid JSON/YAML");
            return
        }
        if (chartConfig.id) {
            //update flow, might have overridden
            toggleConfirmation(true);
        }
        else save()
    }

    async function save() {
        setDeploymentConfigLoading(true);
        let payload;
        try {
            if (!deploymentConfig.id) {     //save 
                payload = {
                    appId: deploymentConfig.appId,
                    chartRefId: selectedChart.id,
                    defaultAppOverride: deploymentConfig.defaultAppOverride,
                    valuesOverride: obj,
                }
            }
            else {
                //update
                payload = {
                    id: selectedChart.id === deploymentConfig.chartRefId ? deploymentConfig.id : 0,
                    appId: deploymentConfig.appId,
                    chartRefId: selectedChart.id,
                    refChartTemplate: deploymentConfig.refChartTemplate,
                    refChartTemplatteVersion: deploymentConfig.refChartTemplateVersion,
                    isAppMetricsEnabled: deploymentConfig.isAppMetricsEnabled,
                    defaultAppOverride: deploymentConfig.defaultAppOverride,
                    valuesOverride: obj,
                }
            }

            const api = deploymentConfig.id ? await updateDeploymentTemplate(payload) : await saveDeploymentTemplate(payload);
            if (!deploymentConfig.id) {
                respondOnSuccess();
            }
            fetchDeploymentTemplate();
            toast.success(
                <div className="toast">
                    <div className="toast__title">{deploymentConfig.id ? 'Updated' : 'Saved'}</div>
                    <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                </div>
            )
        }
        catch (err) {
            showError(err)
        }
        finally {
            setDeploymentConfigLoading(false)
            toggleConfirmation(false)
        }
    }

    if (deploymentConfigLoading) {
        return <Progressing pageLoader />
    }

    return <>
        <div className="form__app-compose">
            <h3 className="form__title">Deployment Template</h3>
            <p className="form__subtitle">Required to execute deployment pipelines for this application.&nbsp;
                <a rel="noreferrer noopener" className="learn-more__href" href={DOCUMENTATION.APP_CREATE_DEPLOYMENT_TEMPLATE} target="_blank">Learn more about Deployment Template Configurations</a>
            </p>
            <form action="" className="p-20 mb-16 br-8 bcn-0 bw-1 en-2" onSubmit={handleSubmit}>
                <div className="flex left">
                    <label className="tertiary-tab__radio mr-10 flex left" style={{ width: "250px" }}>
                        <input type="radio"
                            value="google"
                            checked={configType === 'basic'}
                            name="status"
                            onClick={(e) => setConfigType('basic')} />
                        <div className="tertiary-tab p-12">
                            <aside className="cn-9 fs-13 fw-6">Wizard (Basic)</aside>
                            <aside className="cn-7 fs-12 lh-1-33 fw-5">You can configure only a subset of the available settings.</aside>
                        </div>
                    </label>
                    <label className="tertiary-tab__radio flex left" style={{ width: "250px" }}>
                        <input type="radio"
                            value="google"
                            checked={configType === 'advanced'}
                            name="status"
                            onClick={(e) => setConfigType('advanced')} />
                        <div className="tertiary-tab p-12">
                            <aside className="cn-9 fs-13 fw-6">YAML Editor (Advanced)</aside>
                            <aside className="cn-7 fs-12 lh-1-33 fw-5">You can configure all available settings in YAML/JSON format.</aside>
                        </div>
                    </label>
                </div>
                {configType === "basic" ? <BasicDeploymentConfig isIngressCollapsed={isIngressCollapsed}
                    mapping={mapping}
                    valuesOverride={deploymentConfig.defaultAppOverride}
                    toggleIngressCollapse={() => toggleIngressCollapse(!isIngressCollapsed)} /> : null}
                {configType == "advanced" ? <AdvanceDeploymentConfig advancedConfigTab={advancedConfigTab}
                    valuesOverride={obj}
                    setAdvancedConfigTab={setAdvancedConfigTab}
                    chartVersions={chartVersions}
                    selectedChart={selectedChart}
                    selectChart={selectChart}
                    handleValuesOverride={handleValuesOverride}
                /> : null}
            </form>
        </div>

        {showConfirmation && <ConfirmationDialog>
            <ConfirmationDialog.Icon src={warningIcon} />
            <ConfirmationDialog.Body title="Retain overrides and update" />
            <p>Changes will only be applied to environments using default configuration.</p>
            <p>Environments using overriden configurations will not be updated.</p>
            <ConfirmationDialog.ButtonGroup>
                <button type="button" className="cta cancel" onClick={e => toggleConfirmation(false)}>Cancel</button>
                <button type="button" className="cta" onClick={e => save()}>{deploymentConfigLoading ? <Progressing /> : chartConfig.id ? 'Update' : 'Save'}</button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>}
        {chartVersions && selectedChart && appMetricsEnvironmentVariableEnabled &&
            <OptApplicationMetrics
                currentVersion={selectedChart?.version}
                minimumSupportedVersion={"3.7.0"}
                onChange={e => saveAppMetrics(!deploymentConfig.isAppMetricsEnabled)}
                opted={deploymentConfig.isAppMetricsEnabled}
                loading={appMetricsLoading}
            />
        }
    </>
}

export function OptApplicationMetrics({ currentVersion, minimumSupportedVersion, onChange, opted, focus = false, loading, className = "", disabled = false }) {
    return <div id="opt-metrics" className={`flex column left white-card ${focus ? 'animate-background' : ''} ${className}`}>
        <div className="p-lr-20 m-tb-20 flex left w-100" style={{ justifyContent: 'space-between' }}>
            <div className="flex column left">
                <b className="mr-8">Show application metrics</b>
                <div>Capture and show key application metrics over time. (E.g. Status codes 2xx, 3xx, 5xx; throughput and latency).</div>
            </div>
            <div style={{ height: '20px', width: '32px' }}>
                {loading ? <Progressing /> : <Toggle disabled={disabled || (currentVersion < minimumSupportedVersion)} onSelect={onChange} selected={opted} />}
            </div>
        </div>
        {currentVersion < minimumSupportedVersion && <div className="flex left p-lr-20 chart-version-warning w-100">
            <img />
            <span>Application metrics is not supported for the selected chart version. Update to the latest chart version and re-deploy the application to view metrics.</span>
        </div>}
    </div>
}