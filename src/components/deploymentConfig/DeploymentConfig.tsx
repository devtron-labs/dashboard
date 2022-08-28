import React, { useEffect, useState } from 'react'
import { getDeploymentTemplate, updateDeploymentTemplate, saveDeploymentTemplate } from './service'
import { getChartReferences } from '../../services/service'
import {
    Toggle,
    Progressing,
    ConfirmationDialog,
    VisibleModal,
    useJsonYaml,
    isVersionLessThanOrEqualToTarget,
    CHECKBOX_VALUE,
    Checkbox,
} from '../common'
import { useEffectAfterMount, showError } from '../common/helpers/Helpers'
import ReadmeConfig from './ReadmeConfig'
import { useParams } from 'react-router'
import { toast } from 'react-toastify'
import CodeEditor from '../CodeEditor/CodeEditor'
import warningIcon from '../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Next } from '../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg'
import './deploymentConfig.scss'
import { MODES } from '../../../src/config/constants'
import YAML from 'yaml'
import { useHistory } from 'react-router-dom'
import { ROLLOUT_DEPLOYMENT } from '../../config'
import { DeploymentTemplateEditorView, DeploymentTemplateOptionsTab } from './DeploymentTemplateView'
import { STAGE_NAME } from '../app/details/appConfig/AppConfig'
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails'

export function OptApplicationMetrics({
    currentChart,
    onChange,
    opted,
    focus = false,
    loading,
    className = '',
    disabled = false,
}: {
    currentChart: { id: number; version: string; name: string }
    onChange
    opted: boolean
    focus?: boolean
    loading: boolean
    className?: string
    disabled?: boolean
}) {
    let isUnSupportedChartVersion =
        currentChart.name === ROLLOUT_DEPLOYMENT && isVersionLessThanOrEqualToTarget(currentChart.version, [3, 7, 0])

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
                        <Toggle disabled={disabled || isUnSupportedChartVersion} onSelect={onChange} selected={opted} />
                    )}
                </div>
            </div>
            {isUnSupportedChartVersion && (
                <div className="flex left p-lr-20 chart-version-warning" style={{ width: '100%' }}>
                    <img />
                    <span>
                        Application metrics is not supported for the selected chart version. Update to the latest chart
                        version and re-deploy the application to view metrics.
                    </span>
                </div>
            )}
        </div>
    )
}

function DeploymentConfigFormCTA({
    loading,
    showAppMetricsToggle,
    isAppMetricsEnabled,
    isCiPipeline,
    disabled,
    currentChart,
    toggleAppMetrics,
}: {
    loading: boolean
    showAppMetricsToggle: boolean
    isAppMetricsEnabled: boolean
    isCiPipeline: boolean
    disabled?: boolean
    currentChart: { id: number; version: string; name: string }
    toggleAppMetrics: () => void
}) {
    const isUnSupportedChartVersion =
        showAppMetricsToggle &&
        currentChart.name === ROLLOUT_DEPLOYMENT &&
        isVersionLessThanOrEqualToTarget(currentChart.version, [3, 7, 0])
    return (
        <div className="form-cta-section flex right pt-16 pb-16 pr-20 pl-20">
            {showAppMetricsToggle && (
                <div className="form-app-metrics-cta flex top left mr-16">
                    {loading ? (
                        <Progressing
                            styles={{
                                width: 'auto',
                                marginRight: '16px',
                            }}
                        />
                    ) : (
                        <Checkbox
                            rootClassName="mt-2 mr-8"
                            isChecked={isAppMetricsEnabled}
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={toggleAppMetrics}
                            disabled={disabled || isUnSupportedChartVersion}
                        />
                    )}
                    <div className="flex column left">
                        <b className="fs-13 fw-6 cn-9 mb-4">Show application metrics</b>
                        <div className="fs-13 fw-4 cn-7">
                            {isUnSupportedChartVersion
                                ? 'Application metrics is not supported for the selected chart version. Select a different chart version.'
                                : 'Capture and show key application metrics over time. (E.g. Status codes 2xx, 3xx, 5xx; throughput and latency).'}
                        </div>
                    </div>
                </div>
            )}
            <button className="form-submit-cta cta flex h-32" type="submit" disabled={loading}>
                {loading ? (
                    <Progressing />
                ) : (
                    <>
                        {!isCiPipeline ? (
                            <>
                                Save & Next
                                <Next className="icon-dim-16 ml-5" />
                            </>
                        ) : (
                            <>
                                <Check className="icon-dim-16 mr-5 no-svg-fill scn-0" />
                                Save changes
                            </>
                        )}
                    </>
                )}
            </button>
        </div>
    )
}

export default function DeploymentConfig({ respondOnSuccess, isUnSet, navItems, isCiPipeline, environments }) {
    const [charts, setCharts] = useState<{ id: number; version: string; name: string }[]>([])
    const [selectedChartRefId, selectChartRefId] = useState(0)
    const [selectedChart, selectChart] = useState<{ id: number; version: string; name: string }>(null)
    const [template, setTemplate] = useState('')
    const [schemas, setSchema] = useState()
    const [loading, setLoading] = useState(false)
    const [chartConfig, setChartConfig] = useState(null)
    const [isAppMetricsEnabled, setAppMetricsEnabled] = useState(false)
    const [tempFormData, setTempFormData] = useState('')
    const [obj, json, yaml, error] = useJsonYaml(tempFormData, 4, 'yaml', true)
    const [chartConfigLoading, setChartConfigLoading] = useState(null)
    const [showConfirmation, toggleConfirmation] = useState(false)
    const [showReadme, setShowReadme] = useState(false)
    const [openComparison, setOpenComparison] = useState(false)
    const [readme, setReadme] = useState('')
    const history = useHistory()
    const { appId, envId } = useParams<{ appId: string; envId: string }>()
    const [fetchedValues, setFetchedValues] = useState<Record<number, string>>({})

    useEffect(() => {
        initialise()
    }, [])

    useEffectAfterMount(() => {
        fetchDeploymentTemplate()
    }, [selectedChart])

    async function initialise() {
        setChartConfigLoading(true)
        try {
            const {
                result: { chartRefs, latestAppChartRef, latestChartRef },
            } = await getChartReferences(+appId)
            setCharts(chartRefs)
            let selectedChartId: number = latestAppChartRef || latestChartRef
            let chart = chartRefs.find((chart) => chart.id === selectedChartId)
            selectChartRefId(selectedChartId)
            selectChart(chart)
        } catch (err) {
        } finally {
            setChartConfigLoading(false)
        }
    }

    async function fetchDeploymentTemplate() {
        setChartConfigLoading(true)
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
            } = await getDeploymentTemplate(+appId, selectedChart.id)
            setTemplate(defaultAppOverride)
            setSchema(schema)
            setReadme(readme)
            setChartConfig({ id, refChartTemplate, refChartTemplateVersion, chartRefId, readme })
            setAppMetricsEnabled(isAppMetricsEnabled)
            setTempFormData(YAML.stringify(defaultAppOverride, null))
        } catch (err) {
            showError(err)
        } finally {
            setChartConfigLoading(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!obj) {
            toast.error(error)
            return
        }
        if (chartConfig.id) {
            //update flow, might have overridden
            toggleConfirmation(true)
        } else {
            save()
        }
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
                isAppMetricsEnabled,
            }
            const api = chartConfig.id ? updateDeploymentTemplate : saveDeploymentTemplate
            const { result } = await api(requestBody)
            fetchDeploymentTemplate()
            respondOnSuccess()
            toast.success(
                <div className="toast">
                    <div className="toast__title">{chartConfig.id ? 'Updated' : 'Saved'}</div>
                    <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                </div>,
            )

            if (!isCiPipeline) {
                const stageIndex = navItems.findIndex((item) => item.stage === STAGE_NAME.DEPLOYMENT_TEMPLATE)
                history.push(navItems[stageIndex + 1].href)
            }
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
            toggleConfirmation(false)
        }
    }

    const toggleAppMetrics = () => {
        setAppMetricsEnabled(!isAppMetricsEnabled)
    }

    const editorOnChange = (str: string): void => {
        setTempFormData(str)
    }

    const handleReadMeClick = () => {
        setShowReadme(!showReadme)

        if (openComparison) {
            setOpenComparison(false)
        }
    }

    const handleComparisonClick = () => {
        setOpenComparison(!openComparison)

        if (showReadme) {
            setShowReadme(false)
        }
    }

    const appMetricsEnvironmentVariableEnabled = true //window._env_ && window._env_.APPLICATION_METRICS_ENABLED

    return (
        <div className={`app-compose__deployment-config ${openComparison || showReadme ? 'full-view' : 'h-100'}`}>
            <form
                action=""
                className={`white-card__deployment-config p-0 bcn-0 h-100 ${openComparison ? 'comparison-view' : ''}`}
                onSubmit={handleSubmit}
            >
                <DeploymentTemplateOptionsTab
                    isComparisonAvailable={environments.length > 0}
                    openComparison={openComparison}
                    handleComparisonClick={handleComparisonClick}
                    fetchingReadMe={chartConfigLoading}
                    isReadMeAvailable={!!readme}
                    openReadMe={showReadme}
                    handleReadMeClick={handleReadMeClick}
                    isUnSet={isUnSet}
                    charts={charts}
                    selectedChart={selectedChart}
                    selectChart={selectChart}
                    selectedChartRefId={selectedChartRefId}
                />
                <DeploymentTemplateEditorView
                    appId={appId}
                    isUnSet={isUnSet}
                    openComparison={openComparison}
                    showReadme={showReadme}
                    chartConfigLoading={chartConfigLoading}
                    readme={readme}
                    tempFormData={tempFormData}
                    editorOnChange={editorOnChange}
                    schemas={schemas}
                    selectedChart={selectedChart}
                    environments={environments}
                    fetchedValues={fetchedValues}
                    setFetchedValues={setFetchedValues}
                />
                {!openComparison && !showReadme && (
                    <DeploymentConfigFormCTA
                        loading={loading || chartConfigLoading}
                        showAppMetricsToggle={charts && selectedChart && appMetricsEnvironmentVariableEnabled}
                        isAppMetricsEnabled={isAppMetricsEnabled}
                        isCiPipeline={isCiPipeline}
                        currentChart={selectedChart}
                        toggleAppMetrics={toggleAppMetrics}
                    />
                )}
            </form>
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
        </div>
    )
}
