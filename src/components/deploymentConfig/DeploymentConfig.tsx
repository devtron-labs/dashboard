import React, { useEffect, useState } from 'react';
import {
    getDeploymentTemplate,
    updateDeploymentTemplate,
    saveDeploymentTemplate,
    toggleAppMetrics as updateAppMetrics,
} from './service';
import { getChartReferences } from '../../services/service';
import {
    Toggle,
    Progressing,
    ConfirmationDialog,
    VisibleModal,
    useJsonYaml,
    isVersionLessThanOrEqualToTarget,
} from '../common';
import { useEffectAfterMount, showError } from '../common/helpers/Helpers';
import ReadmeConfig from './ReadmeConfig';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import CodeEditor from '../CodeEditor/CodeEditor';
import warningIcon from '../../assets/icons/ic-info-filled.svg';
import { ReactComponent as ArrowSquareOut } from '../../assets/icons/misc/arrowSquareOut.svg';
import ReactSelect from 'react-select';
import { DOCUMENTATION } from '../../config';
import './deploymentConfig.scss';
import { ReactComponent as Warn } from '../../assets/icons/ic-info-warn.svg';
import { MODES } from '../../../src/config/constants';
import YAML from 'yaml';

export function OptApplicationMetrics({
    currentVersion,
    onChange,
    opted,
    focus = false,
    loading,
    className = '',
    disabled = false,
}) {
    let isChartVersionSupported = isVersionLessThanOrEqualToTarget(currentVersion, [3, 7, 0]);

    return (
        <div
            id="opt-metrics"
            className={`flex column left white-card ${focus ? 'animate-background' : ''} ${className}`}
        >
            <div className="p-lr-20 m-tb-20 flex left" style={{ justifyContent: 'space-between', width: '100%' }}>
                <div className="flex column left">
                    <b style={{ marginBottom: '8px' }}>Show application metrics</b>
                    <div>
                        Capture and show key application metrics over time. (E.g. Status codes 2xx, 3xx, 5xx; throughput
                        and latency).
                    </div>
                </div>
                <div style={{ height: '20px', width: '32px' }}>
                    {loading ? (
                        <Progressing />
                    ) : (
                        <Toggle disabled={disabled || isChartVersionSupported} onSelect={onChange} selected={opted} />
                    )}
                </div>
            </div>
            {isChartVersionSupported && (
                <div className="flex left p-lr-20 chart-version-warning" style={{ width: '100%' }}>
                    <img />
                    <span>
                        Application metrics is not supported for the selected chart version. Update to the latest chart
                        version and re-deploy the application to view metrics.
                    </span>
                </div>
            )}
        </div>
    );
}

export default function DeploymentConfig({ respondOnSuccess, isUnSet }) {
    return (
        <div className="form__app-compose">
            <h3 className="form__title form__title--artifatcs">Deployment Template</h3>
            <p className="form__subtitle">
                Required to execute deployment pipelines for this application.&nbsp;
                <a
                    rel="noreferrer noopener"
                    className="learn-more__href"
                    href={DOCUMENTATION.APP_CREATE_DEPLOYMENT_TEMPLATE}
                    target="_blank"
                >
                    Learn more
                </a>
            </p>
            <DeploymentConfigForm respondOnSuccess={respondOnSuccess} isUnSet={isUnSet} />
        </div>
    );
}

function DeploymentConfigForm({ respondOnSuccess, isUnSet }) {
    const [charts, setCharts] = useState<{ id: number; version: string; name: string }[]>([]);
    const [selectedChartRefId, selectChartRefId] = useState(0);
    const [selectedChart, selectChart] = useState<{ id: number; version: string; name: string }>(null);
    const [template, setTemplate] = useState('');
    const [schemas, setSchema] = useState();
    const [loading, setLoading] = useState(false);
    const [appMetricsLoading, setAppMetricsLoading] = useState(false);
    const [chartConfig, setChartConfig] = useState(null);
    const [isAppMetricsEnabled, toggleAppMetrics] = useState(null);
    const [tempFormData, setTempFormData] = useState('');
    const [obj, json, yaml, error] = useJsonYaml(tempFormData, 4, 'yaml', true);
    const [chartConfigLoading, setChartConfigLoading] = useState(null);
    const [showConfirmation, toggleConfirmation] = useState(false);
    const [showReadme, setShowReadme] = useState(false);
    const [readme, setReadme] = useState('');

    useEffect(() => {
        initialise();
    }, []);

    // useEffectAfterMount(() => {
    //     if (typeof chartConfigLoading === 'boolean' && !chartConfigLoading) {
    //         fetchDeploymentTemplate()
    //     }
    // }, [chartConfigLoading])

    useEffectAfterMount(() => {
        fetchDeploymentTemplate();
        // initialise()
    }, [selectedChart]);

    const { appId, envId } = useParams<{ appId, envId }>();

    async function saveAppMetrics(appMetricsEnabled) {
        try {
            setAppMetricsLoading(true);
            await updateAppMetrics(+appId, {
                isAppMetricsEnabled: appMetricsEnabled,
            });
            toast.success(`Successfully ${appMetricsEnabled ? 'subscribed' : 'unsubscribed'}.`, { autoClose: null });
            initialise();
        } catch (err) {
            showError(err);
            setAppMetricsLoading(false);
        }
    }

    async function initialise() {
        setChartConfigLoading(true);
        try {
            const {
                result: { chartRefs, latestAppChartRef, latestChartRef },
            } = await getChartReferences(+appId);
            setCharts(chartRefs);
            let selectedChartId: number = latestAppChartRef || latestChartRef;
            let chart = chartRefs.find((chart) => chart.id === selectedChartId);
            selectChartRefId(selectedChartId);
            selectChart(chart);
        } catch (err) {
        } finally {
            setChartConfigLoading(false);
        }
    }

    async function fetchDeploymentTemplate() {
        setChartConfigLoading(true);
        try {
            const {
                result: {
                    globalConfig: {
                        defaultAppOverride,
                        id,
                        refChartTemplate,
                        refChartTemplateVersion,
                        isAppMetricsEnabled,
                        chartRefId,
                        readme,
                        schema,
                    },
                },
            } = await getDeploymentTemplate(+appId, selectedChart.id);
            setTemplate(defaultAppOverride);
            setSchema(schema);
            setReadme(readme);
            setChartConfig({ id, refChartTemplate, refChartTemplateVersion, chartRefId, readme });
            toggleAppMetrics(isAppMetricsEnabled);
            setTempFormData(YAML.stringify(defaultAppOverride, null));
        } catch (err) {
            showError(err);
        } finally {
            setChartConfigLoading(false);
            if (appMetricsLoading) {
                setAppMetricsLoading(false);
            }
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!obj) {
            toast.error(error);
            return;
        }
        if (chartConfig.id) {
            //update flow, might have overridden
            toggleConfirmation(true);
        } else save();
    }

    async function save() {
        setLoading(true);
        try {
            let requestBody = {
                ...(chartConfig.chartRefId === selectedChart.id ? chartConfig : {}),
                appId: +appId,
                chartRefId: selectedChart.id,
                valuesOverride: obj,
                defaultAppOverride: template,
                isAppMetricsEnabled,
                envId: +envId
            };
            const api = chartConfig.id ? updateDeploymentTemplate : saveDeploymentTemplate;
            const { result } = await api(requestBody);
            fetchDeploymentTemplate();
            respondOnSuccess();
            toast.success(
                <div className="toast">
                    <div className="toast__title">{chartConfig.id ? 'Updated' : 'Saved'}</div>
                    <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                </div>,
            );
        } catch (err) {
            showError(err);
        } finally {
            setLoading(false);
            toggleConfirmation(false);
        }
    }

    const appMetricsEnvironmentVariableEnabled = window._env_ && window._env_.APPLICATION_METRICS_ENABLED;
    let uniqueCharts = new Map<string, boolean>();
    let chartsWithUniqueNames = charts
        .filter((cv) => {
            if (uniqueCharts.get(cv.name)) {
                return false;
            } else {
                uniqueCharts.set(cv.name, true);
                return true;
            }
        })
        .sort((a, b) => b.name.localeCompare(a.name));
    let filteredCharts = selectedChart
        ? charts.filter((cv) => cv.name == selectedChart.name).sort((a, b) => b.id - a.id)
        : [];
    return (
        <>
            <form action="" className="white-card white-card__deployment-config" onSubmit={handleSubmit}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gridColumnGap: '16px',
                        marginBottom: '4px',
                    }}
                >
                    <div className="flex left column">
                        <label className="form__label">Chart type</label>
                        {isUnSet ? (
                            <ReactSelect
                                options={chartsWithUniqueNames}
                                isMulti={false}
                                getOptionLabel={(option) => `${option.name}`}
                                getOptionValue={(option) => `${option.name}`}
                                value={selectedChart}
                                components={{
                                    IndicatorSeparator: null,
                                }}
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        boxShadow: 'none',
                                        border: `solid 1px var(--B500)`,
                                    }),
                                    option: (base, state) => {
                                        return {
                                            ...base,
                                            color: 'var(--N900)',
                                            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                        };
                                    },
                                    container: (base, state) => {
                                        return {
                                            ...base,
                                            width: '100%',
                                        };
                                    },
                                }}
                                onChange={(selected) => {
                                    let filteredCharts = charts.filter((chart) => chart.name == selected.name);
                                    let selectedChart = filteredCharts.find((chart) => chart.id == selectedChartRefId);
                                    if (selectedChart) {
                                        selectChart(selectedChart);
                                    } else {
                                        let sortedFilteredCharts = filteredCharts.sort((a, b) => a.id - b.id);
                                        selectChart(
                                            sortedFilteredCharts[
                                                sortedFilteredCharts.length ? sortedFilteredCharts.length - 1 : 0
                                            ],
                                        );
                                    }
                                }}
                            />
                        ) : (
                            <input autoComplete="off" value={selectedChart?.name} className="form__input" disabled />
                        )}
                    </div>
                    <div className="flex left column">
                        <div className="form__label">Chart version</div>
                        <ReactSelect
                            options={filteredCharts}
                            isMulti={false}
                            getOptionLabel={(option) => `${option.version}`}
                            getOptionValue={(option) => `${option.id}`}
                            value={selectedChart}
                            components={{
                                IndicatorSeparator: null,
                            }}
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    boxShadow: 'none',
                                    border: `solid 1px var(--B500)`,
                                }),
                                option: (base, state) => {
                                    return {
                                        ...base,
                                        color: 'var(--N900)',
                                        backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                    };
                                },
                                container: (base, state) => {
                                    return {
                                        ...base,
                                        width: '100%',
                                    };
                                },
                            }}
                            onChange={(selected) =>
                                selectChart(selected as { id: number; version: string; name: string })
                            }
                        />
                    </div>
                </div>
                <div className="deploymentConfig__warning flex fs-12 left pt-4 m-b-16">
                    {isUnSet && (
                        <>
                            <Warn className="icon-dim-16 mr-4 " />
                            Chart type cannot be changed once saved.
                        </>
                    )}
                </div>
                <div className="form__row form__row--code-editor-container">
                    <CodeEditor
                        value={tempFormData}
                        onChange={(resp) => {
                            setTempFormData(resp);
                        }}
                        mode={MODES.YAML}
                        validatorSchema={schemas}
                        loading={chartConfigLoading}
                    >
                        <div className="readme-container">
                            <CodeEditor.Header>
                                <h5>{MODES.YAML.toUpperCase()}</h5>
                                <CodeEditor.ValidationError />
                            </CodeEditor.Header>
                            {readme && (
                                <div
                                    className="cb-5 fw-6 fs-13 flexbox pr-16 pt-10 cursor border-bottom-1px "
                                    onClick={(e) => setShowReadme(true)}
                                >
                                    README
                                    <ArrowSquareOut className="icon-dim-18 scb-5 rotateBy--90 ml-5" />
                                </div>
                            )}
                        </div>
                    </CodeEditor>
                </div>
                <div className="form__buttons">
                    <button className="cta" type="submit">
                        {loading ? <Progressing /> : 'Save'}
                    </button>
                </div>
            </form>
            {showReadme && (
                <VisibleModal className="">
                    <ReadmeConfig
                        value={tempFormData}
                        height={500}
                        schema={schemas}
                        onChange={(resp) => {
                            setTempFormData(resp);
                        }}
                        readme={chartConfig.readme}
                        handleClose={(e) => setShowReadme(false)}
                        loading={chartConfigLoading}
                    />
                </VisibleModal>
            )}

            {showConfirmation && (
                <ConfirmationDialog>
                    <ConfirmationDialog.Icon src={warningIcon} />
                    <ConfirmationDialog.Body title="Retain overrides and update" />
                    <p>Changes will only be applied to environments using default configuration.</p>
                    <p>Environments using overriden configurations will not be updated.</p>
                    <ConfirmationDialog.ButtonGroup>
                        <button type="button" className="cta cancel" onClick={(e) => toggleConfirmation(false)}>
                            Cancel
                        </button>
                        <button type="button" className="cta" onClick={(e) => save()}>
                            {loading ? <Progressing /> : chartConfig.id ? 'Update' : 'Save'}
                        </button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            )}
            {charts && selectedChart && appMetricsEnvironmentVariableEnabled && (
                <OptApplicationMetrics
                    currentVersion={selectedChart?.version}
                    onChange={(e) => saveAppMetrics(!isAppMetricsEnabled)}
                    opted={isAppMetricsEnabled}
                    loading={appMetricsLoading}
                />
            )}
        </>
    );
}
