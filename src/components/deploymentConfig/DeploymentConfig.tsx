import React, { useContext, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { getDeploymentTemplate, updateDeploymentTemplate, saveDeploymentTemplate } from './service'
import { getAppOtherEnvironment, getChartReferences } from '../../services/service'
import { Progressing, ConfirmationDialog, useJsonYaml, useEffectAfterMount, showError, useAsync, not } from '../common'
import warningIcon from '../../assets/icons/ic-info-filled.svg'
import {
    DeploymentConfigFormCTA,
    DeploymentTemplateEditorView,
    DeploymentTemplateOptionsTab,
} from './DeploymentTemplateView'
import { BasicFieldErrorObj, DeploymentChartVersionType, DeploymentConfigProps } from './types'
import { STAGE_NAME } from '../app/details/appConfig/appConfig.type'
import YAML from 'yaml'
import './deploymentConfig.scss'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleNameMap, ROLLOUT_DEPLOYMENT } from '../../config'
import { InstallationType, ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import * as jsonpatch from 'fast-json-patch'
import { mainContext } from '../common/navigation/NavigationRoutes'
import {
    getBasicFieldValue,
    isBasicValueChanged,
    patchBasicData,
    updateTemplateFromBasicValue,
    validateBasicView,
} from './DeploymentConfig.utils'

export default function DeploymentConfig({
    respondOnSuccess,
    isUnSet,
    navItems,
    isCiPipeline,
    environments,
    setEnvironments,
}: DeploymentConfigProps) {
    const { currentServerInfo } = useContext(mainContext)
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
    const [yamlMode, toggleYamlMode] = useState(true)
    const [isBasicViewLocked, setIsBasicViewLocked] = useState(false)
    const [currentViewEditor, setCurrentViewEditor] = useState(null)
    const [basicFieldValues, setBasicFieldValues] = useState<Record<string, any>>(null)
    const [basicFieldValuesErrorObj, setBasicFieldValuesErrorObj] = useState<BasicFieldErrorObj>(null)
    const [basicFieldPatchData, setBasicFieldPatchData] = useState<Record<string, jsonpatch.Operation>>(null)
    const [environmentsLoading, environmentResult, environmentError, reloadEnvironments] = useAsync(
        () => getAppOtherEnvironment(appId),
        [appId],
        !!appId,
    )
    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [appId])

    useEffect(() => {
        initialise()
    }, [])

    useEffectAfterMount(() => {
        fetchDeploymentTemplate()
    }, [selectedChart])

    useEffect(() => {
        if (!environmentsLoading && environmentResult?.result) {
            setEnvironments(environmentResult.result)
        }
    }, [environmentsLoading, environmentResult])

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

    const parseDataForView = async (isBasicViewLocked: boolean, currentViewEditor: string, template): Promise<void> => {
        let _currentViewEditor
        if (!currentViewEditor) {
            isBasicViewLocked = false
        } else if (currentViewEditor === 'UNDEFINED') {
            const {
                result: { defaultAppOverride },
            } = await getDeploymentTemplate(+appId, +selectedChart.id, true)
            isBasicViewLocked = isBasicValueChanged(defaultAppOverride, template)
        } else {
            _currentViewEditor = currentViewEditor
        }
        _currentViewEditor =
            isBasicViewLocked || currentServerInfo.serverInfo.installationType === InstallationType.ENTERPRISE
                ? 'ADVANCED'
                : 'BASIC'
        setIsBasicViewLocked(isBasicViewLocked)
        setCurrentViewEditor(_currentViewEditor)
        toggleYamlMode(_currentViewEditor === 'BASIC' ? false : true)
        if (!isBasicViewLocked) {
            const _basicFieldValues = getBasicFieldValue(template)
            setBasicFieldValues(_basicFieldValues)
            setBasicFieldValuesErrorObj(validateBasicView(_basicFieldValues))
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
                        isBasicViewLocked,
                        currentViewEditor,
                    },
                },
            } = await getDeploymentTemplate(+appId, +selectedChart.id)
            setTemplate(defaultAppOverride)
            setSchema(schema)
            setReadme(readme)
            setChartConfig({ id, refChartTemplate, refChartTemplateVersion, chartRefId, readme })
            setAppMetricsEnabled(isAppMetricsEnabled)
            setTempFormData(YAML.stringify(defaultAppOverride, null))
            if (selectedChart.name === ROLLOUT_DEPLOYMENT) {
                parseDataForView(isBasicViewLocked, currentViewEditor, defaultAppOverride)
            }
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
        if (!basicFieldValuesErrorObj.isValid) {
            toast.error('Some required fields are missing')
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
                valuesOverride: basicFieldPatchData !== null ? patchBasicData(obj, basicFieldPatchData) : obj,
                defaultAppOverride: template,
                isAppMetricsEnabled,
                isBasicViewLocked: isBasicViewLocked,
                currentViewEditor,
            }
            const api = chartConfig.id ? updateDeploymentTemplate : saveDeploymentTemplate
            await api(requestBody)
            reloadEnvironments()
            fetchDeploymentTemplate()
            respondOnSuccess()
            setFetchedValues({})
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

    const closeConfirmationDialog = () => {
        toggleConfirmation(false)
    }

    const editorOnChange = (str: string, fromBasic?: boolean): void => {
        setTempFormData(str)
        if (str && currentViewEditor && !isBasicViewLocked && !fromBasic) {
            setIsBasicViewLocked(isBasicValueChanged(YAML.parse(str)))
        }
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

    const changeEditorMode = (): void => {
        if (basicFieldValuesErrorObj && !basicFieldValuesErrorObj.isValid) {
            toast.error('Some required fields are missing')
            toggleYamlMode(false)
            return
        }
        if (isBasicViewLocked) {
            return
        }
        const parsedCodeEditorValue = YAML.parse(tempFormData)
        if (yamlMode) {
            const _basicFieldValues = getBasicFieldValue(parsedCodeEditorValue)
            setBasicFieldValues(_basicFieldValues)
            setBasicFieldValuesErrorObj(validateBasicView(_basicFieldValues))
        } else if (basicFieldPatchData !== null) {
            const newTemplate = patchBasicData(parsedCodeEditorValue, basicFieldPatchData)
            updateTemplateFromBasicValue(newTemplate)
            editorOnChange(YAML.stringify(newTemplate), !yamlMode)
            setBasicFieldPatchData(null)
        }
        toggleYamlMode(not)
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
                    chartConfigLoading={chartConfigLoading}
                    isReadMeAvailable={!!readme}
                    openReadMe={showReadme}
                    handleReadMeClick={handleReadMeClick}
                    isUnSet={isUnSet}
                    charts={charts}
                    selectedChart={selectedChart}
                    selectChart={selectChart}
                    selectedChartRefId={selectedChartRefId}
                    yamlMode={yamlMode}
                    isBasicViewLocked={isBasicViewLocked}
                    codeEditorValue={tempFormData}
                    basicFieldValuesErrorObj={basicFieldValuesErrorObj}
                    changeEditorMode={changeEditorMode}
                />
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
                    yamlMode={yamlMode}
                    basicFieldValues={basicFieldValues}
                    setBasicFieldValues={setBasicFieldValues}
                    basicFieldPatchData={basicFieldPatchData}
                    setBasicFieldPatchData={setBasicFieldPatchData}
                    basicFieldValuesErrorObj={basicFieldValuesErrorObj}
                    setBasicFieldValuesErrorObj={setBasicFieldValuesErrorObj}
                    changeEditorMode={changeEditorMode}
                />
                {!openComparison && !showReadme && (
                    <DeploymentConfigFormCTA
                        loading={loading || chartConfigLoading}
                        showAppMetricsToggle={
                            charts &&
                            selectedChart &&
                            appMetricsEnvironmentVariableEnabled &&
                            grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED &&
                            yamlMode
                        }
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
                        <button type="button" className="cta cancel" onClick={closeConfirmationDialog}>
                            Cancel
                        </button>
                        <button type="button" className="cta" onClick={save}>
                            {loading ? <Progressing /> : chartConfig.id ? 'Update' : 'Save'}
                        </button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            )}
        </div>
    )
}
