import React, { useEffect, useState } from 'react'
import { getDeploymentTemplate, updateDeploymentTemplate, saveDeploymentTemplate } from './service'
import { getChartReferences } from '../../services/service'
import { Progressing, ConfirmationDialog, useJsonYaml } from '../common'
import { useEffectAfterMount, showError } from '../common/helpers/Helpers'
import { useParams } from 'react-router'
import { toast } from 'react-toastify'
import warningIcon from '../../assets/icons/ic-info-filled.svg'
import './deploymentConfig.scss'
import YAML from 'yaml'
import { useHistory } from 'react-router-dom'
import {
    DeploymentConfigFormCTA,
    DeploymentTemplateEditorView,
    DeploymentTemplateOptionsTab,
} from './DeploymentTemplateView'
import { DeploymentChartVersionType, DeploymentConfigProps } from './types'
import { STAGE_NAME } from '../app/details/appConfig/appConfig.type'

export default function DeploymentConfig({
    respondOnSuccess,
    isUnSet,
    navItems,
    isCiPipeline,
    environments,
}: DeploymentConfigProps) {
    const [charts, setCharts] = useState<DeploymentChartVersionType[]>([])
    const [selectedChartRefId, selectChartRefId] = useState(0)
    const [selectedChart, selectChart] = useState<DeploymentChartVersionType>(null)
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
    const [fetchedValues, setFetchedValues] = useState<Record<number | string, string>>({})

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
            } = await getDeploymentTemplate(+appId, +selectedChart.id)
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
            await api(requestBody)
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

    const appMetricsEnvironmentVariableEnabled = window._env_ && window._env_.APPLICATION_METRICS_ENABLED

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
                {selectedChart && (
                    <DeploymentTemplateEditorView
                        appId={appId}
                        envId={envId}
                        isUnSet={isUnSet}
                        openComparison={openComparison}
                        showReadme={showReadme}
                        chartConfigLoading={chartConfigLoading}
                        readme={readme}
                        value={tempFormData}
                        editorOnChange={editorOnChange}
                        schemas={schemas}
                        charts={charts || []}
                        selectedChart={selectedChart}
                        environments={environments || []}
                        fetchedValues={fetchedValues}
                        setFetchedValues={setFetchedValues}
                    />
                )}
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
