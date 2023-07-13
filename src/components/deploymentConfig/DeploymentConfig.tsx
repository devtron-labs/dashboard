import React, { useContext, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { getDeploymentTemplate, updateDeploymentTemplate, saveDeploymentTemplate } from './service'
import { getAppOtherEnvironmentMin, getChartReferences } from '../../services/service'
import { useJsonYaml, useAsync, importComponentFromFELibrary } from '../common'
import {
    showError,
    Progressing,
    ConfirmationDialog,
    useEffectAfterMount,
    not,
} from '@devtron-labs/devtron-fe-common-lib'
import warningIcon from '../../assets/icons/ic-info-filled.svg'
import { BasicFieldErrorObj, ChartMetadataType, DeploymentChartVersionType, DeploymentConfigProps } from './types'
import { STAGE_NAME } from '../app/details/appConfig/appConfig.type'
import YAML from 'yaml'
import './deploymentConfig.scss'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { DEPLOYMENT, ModuleNameMap, ROLLOUT_DEPLOYMENT } from '../../config'
import { InstallationType, ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import { mainContext } from '../common/navigation/NavigationRoutes'
import {
    getBasicFieldValue,
    isBasicValueChanged,
    patchBasicData,
    updateTemplateFromBasicValue,
    validateBasicView,
} from './DeploymentConfig.utils'
import { BASIC_FIELDS, EDITOR_VIEW } from './constants'
import DeploymentConfigFormCTA from './DeploymentTemplateView/DeploymentConfigFormCTA'
import DeploymentTemplateEditorView from './DeploymentTemplateView/DeploymentTemplateEditorView'
import DeploymentTemplateOptionsTab from './DeploymentTemplateView/DeploymentTemplateOptionsTab'

const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar')

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
    const [chartsMetadata, setChartsMetadata] = useState<Record<string, ChartMetadataType>>({})
    const [selectedChartRefId, selectChartRefId] = useState(0)
    const [selectedChart, selectChart] = useState<DeploymentChartVersionType>(null)
    const [template, setTemplate] = useState('')
    const [schemas, setSchema] = useState()
    const [loading, setLoading] = useState(false)
    const [chartConfig, setChartConfig] = useState(null)
    const [isAppMetricsEnabled, setAppMetricsEnabled] = useState(false)
    const [tempFormData, setTempFormData] = useState('')
    const [obj, , , error] = useJsonYaml(tempFormData, 4, 'yaml', true)
    const [chartConfigLoading, setChartConfigLoading] = useState(null)
    const [showConfirmation, toggleConfirmation] = useState(false)
    const [showReadme, setShowReadme] = useState(false)
    const [openComparison, setOpenComparison] = useState(false)
    const [selectedTabIndex, setSelectedTabIndex] = useState(1)
    const [readme, setReadme] = useState('')
    const history = useHistory()
    const { appId, envId } = useParams<{ appId: string; envId: string }>()
    const [fetchedValues, setFetchedValues] = useState<Record<number | string, string>>({})
    const [yamlMode, toggleYamlMode] = useState(true)
    const [isBasicLocked, setIsBasicLocked] = useState(false)
    const [currentEditorView, setEditorView] = useState(null)
    const [basicFieldValues, setBasicFieldValues] = useState<Record<string, any>>(null)
    const [basicFieldValuesErrorObj, setBasicFieldValuesErrorObj] = useState<BasicFieldErrorObj>(null)
    const [environmentsLoading, environmentResult, , reloadEnvironments] = useAsync(
        () => getAppOtherEnvironmentMin(appId),
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
                result: { chartRefs, latestAppChartRef, latestChartRef, chartMetadata },
            } = await getChartReferences(+appId)
            setCharts(chartRefs)
            setChartsMetadata(chartMetadata)
            let selectedChartId: number = latestAppChartRef || latestChartRef
            let chart = chartRefs.find((chart) => chart.id === selectedChartId)
            selectChartRefId(selectedChartId)
            selectChart(chart)
        } catch (err) {
        } finally {
            setChartConfigLoading(false)
        }
    }

    const parseDataForView = async (
        _isBasicViewLocked: boolean,
        _currentViewEditor: string,
        template,
    ): Promise<void> => {
        if (_currentViewEditor === EDITOR_VIEW.UNDEFINED) {
            const {
                result: { defaultAppOverride },
            } = await getDeploymentTemplate(+appId, +selectedChart.id, true)
            _isBasicViewLocked = isBasicValueChanged(defaultAppOverride, template)
        }
        if (!currentEditorView || !_currentViewEditor) {
            _currentViewEditor =
                _isBasicViewLocked || currentServerInfo?.serverInfo?.installationType === InstallationType.ENTERPRISE
                    ? EDITOR_VIEW.ADVANCED
                    : EDITOR_VIEW.BASIC
            setIsBasicLocked(_isBasicViewLocked)
            setEditorView(_currentViewEditor)
            toggleYamlMode(_currentViewEditor === EDITOR_VIEW.BASIC ? false : true)
        }
        if (!_isBasicViewLocked) {
            const _basicFieldValues = getBasicFieldValue(template)
            if (
                _basicFieldValues[BASIC_FIELDS.HOSTS].length === 0 ||
                !_basicFieldValues[BASIC_FIELDS.PORT] ||
                !_basicFieldValues[BASIC_FIELDS.ENV_VARIABLES] ||
                !_basicFieldValues[BASIC_FIELDS.RESOURCES]
            ) {
                setIsBasicLocked(true)
                setEditorView(EDITOR_VIEW.ADVANCED)
                toggleYamlMode(true)
            } else {
                setIsBasicLocked(_isBasicViewLocked)
                setBasicFieldValues(_basicFieldValues)
                setBasicFieldValuesErrorObj(validateBasicView(_basicFieldValues))
            }
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
            if (selectedChart.name === ROLLOUT_DEPLOYMENT || selectedChart.name === DEPLOYMENT) {
                updateTemplateFromBasicValue(defaultAppOverride)
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
        if (
            (selectedChart.name === ROLLOUT_DEPLOYMENT || selectedChart.name === DEPLOYMENT) &&
            !yamlMode &&
            !basicFieldValuesErrorObj.isValid
        ) {
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
                valuesOverride: obj,
                defaultAppOverride: template,
                isAppMetricsEnabled,
            }
            if (selectedChart.name === ROLLOUT_DEPLOYMENT || selectedChart.name === DEPLOYMENT) {
                requestBody.isBasicViewLocked = isBasicLocked
                requestBody.currentViewEditor = isBasicLocked ? EDITOR_VIEW.ADVANCED : currentEditorView
                if (!yamlMode) {
                    requestBody.valuesOverride = patchBasicData(obj, basicFieldValues)
                }
            }
            const api = chartConfig.id ? updateDeploymentTemplate : saveDeploymentTemplate
            await api(requestBody)
            reloadEnvironments()
            fetchDeploymentTemplate()
            respondOnSuccess()
            setFetchedValues({})
            toast.success(
                <div className="toast">
                    <div
                        className="toast__title"
                        data-testid={`${
                            chartConfig.id
                                ? 'update-base-deployment-template-popup'
                                : 'saved-base-deployment-template-popup'
                        }`}
                    >
                        {chartConfig.id ? 'Updated' : 'Saved'}
                    </div>
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
        if (
            selectedChart &&
            (selectedChart.name === ROLLOUT_DEPLOYMENT || selectedChart.name === DEPLOYMENT) &&
            str &&
            currentEditorView &&
            !isBasicLocked &&
            !fromBasic
        ) {
            try {
                setIsBasicLocked(isBasicValueChanged(YAML.parse(str)))
            } catch (error) {}
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
        if (isBasicLocked) {
            return
        }

        try {
            const parsedCodeEditorValue = YAML.parse(tempFormData)
            if (yamlMode) {
                const _basicFieldValues = getBasicFieldValue(parsedCodeEditorValue)
                setBasicFieldValues(_basicFieldValues)
                setBasicFieldValuesErrorObj(validateBasicView(_basicFieldValues))
            } else {
                const newTemplate = patchBasicData(parsedCodeEditorValue, basicFieldValues)
                updateTemplateFromBasicValue(newTemplate)
                editorOnChange(YAML.stringify(newTemplate), !yamlMode)
            }
            toggleYamlMode(not)
        } catch (error) {}
    }

    const appMetricsEnvironmentVariableEnabled = window._env_ && window._env_.APPLICATION_METRICS_ENABLED

    return (
        <div className={`app-compose__deployment-config ${openComparison || showReadme ? 'full-view' : 'h-100'}`}>
            {/* WIP - toolbar implementation */}
            {ConfigToolbar && (
                <ConfigToolbar
                    selectedTabIndex={selectedTabIndex}
                    setSelectedTabIndex={setSelectedTabIndex}
                    isDraftMode={true}
                    handleDiscardDraft={handleReadMeClick}
                    noReadme={!yamlMode}
                    showReadme={showReadme}
                    handleReadMeClick={handleReadMeClick}
                    handleCommentClick={handleReadMeClick}
                    isApprovalPending={true}
                    approvalUsers={[]}
                    activityHistory={[]}
                />
            )}
            <form
                action=""
                className={`white-card__deployment-config p-0 bcn-0 h-100 ${openComparison ? 'comparison-view' : ''}`}
                onSubmit={handleSubmit}
            >
                <DeploymentTemplateOptionsTab
                    isComparisonAvailable={true}
                    openComparison={openComparison}
                    handleComparisonClick={handleComparisonClick}
                    chartConfigLoading={chartConfigLoading}
                    isReadMeAvailable={!!readme}
                    openReadMe={showReadme}
                    handleReadMeClick={handleReadMeClick}
                    isUnSet={isUnSet}
                    charts={charts}
                    chartsMetadata={chartsMetadata}
                    selectedChart={selectedChart}
                    selectChart={selectChart}
                    selectedChartRefId={selectedChartRefId}
                    yamlMode={yamlMode}
                    isBasicViewLocked={isBasicLocked}
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
                        toggleAppMetrics={toggleAppMetrics}
                        selectedChart={selectedChart}
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
                        <button
                            data-testid="base-deployment-template-cancel-button"
                            type="button"
                            className="cta cancel"
                            onClick={closeConfirmationDialog}
                        >
                            Cancel
                        </button>
                        <button
                            data-testid="base_deployment_template_update_button"
                            type="button"
                            className="cta"
                            onClick={save}
                        >
                            {loading ? <Progressing /> : chartConfig.id ? 'Update' : 'Save'}
                        </button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            )}
        </div>
    )
}
