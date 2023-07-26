import React, { Reducer, createContext, useContext, useEffect, useReducer } from 'react'
import { useHistory, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { getDeploymentTemplate, updateDeploymentTemplate, saveDeploymentTemplate } from './service'
import { getChartReferences } from '../../services/service'
import { useJsonYaml, useAsync, importComponentFromFELibrary } from '../common'
import { showError, useEffectAfterMount } from '@devtron-labs/devtron-fe-common-lib'
import {
    DeploymentConfigContextType,
    DeploymentConfigProps,
    DeploymentConfigStateAction,
    DeploymentConfigStateActionTypes,
    DeploymentConfigStateWithDraft,
} from './types'
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
import DeploymentConfigToolbar from './DeploymentTemplateView/DeploymentConfigToolbar'
import { SaveConfirmationDialog, SuccessToastBody } from './DeploymentTemplateView/DeploymentTemplateView.component'
import { deploymentConfigReducer, initDeploymentConfigState } from './DeploymentConfigReducer'
import DeploymentTemplateReadOnlyEditorView from './DeploymentTemplateView/DeploymentTemplateReadOnlyEditorView'

const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar', DeploymentConfigToolbar)
const SaveChangesModal = importComponentFromFELibrary('SaveChangesModal')
const DraftComments = importComponentFromFELibrary('DraftComments')
const getAllDrafts = importComponentFromFELibrary('getAllDrafts', null, 'function')
const getConfigProtections = importComponentFromFELibrary('getConfigProtections', null, 'function')
const getDraft = importComponentFromFELibrary('getDraft', null, 'function')

export const DeploymentConfigContext = createContext<DeploymentConfigContextType>(null)

export default function DeploymentConfig({
    respondOnSuccess,
    isUnSet,
    navItems,
    isCiPipeline,
    environments,
    isProtected,
    reloadEnvironments
}: DeploymentConfigProps) {
    const history = useHistory()
    const { appId } = useParams<{ appId: string }>()
    const { currentServerInfo } = useContext(mainContext)
    const [state, dispatch] = useReducer<Reducer<DeploymentConfigStateWithDraft, DeploymentConfigStateAction>>(
        deploymentConfigReducer,
        initDeploymentConfigState,
    )
    const [obj, , , error] = useJsonYaml(state.tempFormData, 4, 'yaml', true)
    // const [environmentsLoading, environmentResult, , reloadEnvironments] = useAsync(
    //     () => getAppOtherEnvironmentMin(appId),
    //     [appId],
    //     !!appId,
    // )
    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [appId])
    const appMetricsEnvironmentVariableEnabled = window._env_ && window._env_.APPLICATION_METRICS_ENABLED

    useEffect(() => {
        initialise()
    }, [])

    useEffectAfterMount(() => {
        fetchDeploymentTemplate()
    }, [state.selectedChart])

    // useEffect(() => {
    //     if (!environmentsLoading && environmentResult?.result) {
    //         setEnvironments(environmentResult.result)
    //     }
    // }, [environmentsLoading, environmentResult])

    const updateRefsData = (chartRefsData, clearPublishedState?) => {
        const payload = {
            ...chartRefsData,
            chartConfigLoading: false,
        }

        if (clearPublishedState) {
            payload.selectedTabIndex = state.selectedTabIndex === 3 ? 1 : state.selectedTabIndex
            payload.publishedState = null
            payload.allDrafts = []
            payload.latestDraft = null
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload,
        })
    }

    async function initialise() {
        dispatch({
            type: DeploymentConfigStateActionTypes.chartConfigLoading,
            payload: true,
        })
        Promise.all([
            getChartReferences(+appId),
            typeof getConfigProtections === 'function' ? getConfigProtections(Number(appId)) : { result: null },
        ])
            .then(([chartRefResp, configProtectionsResp]) => {
                const { chartRefs, latestAppChartRef, latestChartRef, chartMetadata } = chartRefResp.result
                const selectedChartId: number = latestAppChartRef || latestChartRef
                const chart = chartRefs.find((chart) => chart.id === selectedChartId)
                const isConfigProtectionEnabled =
                    configProtectionsResp.result?.find(
                        (config) => config.appId === Number(appId) && config.envId === -1,
                    )?.state === 1

                const chartRefsData = {
                    charts: chartRefs,
                    chartsMetadata: chartMetadata,
                    selectedChartRefId: selectedChartId,
                    selectedChart: chart,
                    isConfigProtectionEnabled,
                }

                if (isConfigProtectionEnabled && typeof getAllDrafts === 'function') {
                    fetchAllDrafts(chartRefsData)
                } else {
                    updateRefsData(chartRefsData)
                }
            })
            .catch((err) => {
                showError(err)
                dispatch({
                    type: DeploymentConfigStateActionTypes.chartConfigLoading,
                    payload: false,
                })
            })
    }

    const fetchAllDrafts = (chartRefsData) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.chartConfigLoading,
            payload: true,
        })
        getAllDrafts(Number(appId), -1, 3)
            .then((allDraftsResp) => {
                if (allDraftsResp.result) {
                    const allDrafts = allDraftsResp.result
                        .sort((draftA, draftB) => draftB.draftId - draftA.draftId)
                        .sort((draftA, draftB) => draftB.draftVersionId - draftA.draftVersionId)
                    const latestDraft = allDrafts[0]
                    if (
                        typeof getDraft === 'function' &&
                        latestDraft &&
                        (latestDraft.draftState === 1 || latestDraft.draftState === 4)
                    ) {
                        getDraftAndActivity(allDrafts, latestDraft, chartRefsData)
                    } else {
                        updateRefsData(chartRefsData)
                    }
                } else {
                    updateRefsData(chartRefsData, !!state.publishedState)
                }
            })
            .catch((e) => {
                updateRefsData(chartRefsData)
            })
    }

    const getDraftAndActivity = (allDrafts, latestDraft, chartRefsData) => {
        getDraft(latestDraft.draftId)
            .then((draftResp) => {
                const {
                    valuesOverride,
                    id,
                    refChartTemplate,
                    refChartTemplateVersion,
                    isAppMetricsEnabled,
                    chartRefId,
                    isBasicViewLocked,
                    currentViewEditor,
                } = JSON.parse(draftResp.result.data)

                const payload = {
                    template: valuesOverride,
                    chartConfig: {
                        id,
                        refChartTemplate,
                        refChartTemplateVersion,
                        chartRefId,
                    },
                    isAppMetricsEnabled: isAppMetricsEnabled,
                    tempFormData: YAML.stringify(valuesOverride, null),
                    latestDraft: draftResp.result,
                    allDrafts,
                    ...{
                        ...chartRefsData,
                        selectedChartRefId: chartRefId,
                        selectedChart: chartRefsData?.charts?.find((chart) => chart.id === chartRefId),
                    },
                }

                if (chartRefsData) {
                    payload['publishedState'] = chartRefsData
                } else if (!state.publishedState) {
                    payload['publishedState'] = state
                }

                dispatch({
                    type: DeploymentConfigStateActionTypes.multipleOptions,
                    payload,
                })

                if (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) {
                    updateTemplateFromBasicValue(valuesOverride)
                    parseDataForView(isBasicViewLocked, currentViewEditor, valuesOverride, payload)
                }
            })
            .catch((e) => {
                updateRefsData(chartRefsData)
            })
    }

    const toggleYamlMode = (yamlMode: boolean) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.yamlMode,
            payload: yamlMode,
        })
    }

    const parseDataForView = async (
        _isBasicViewLocked: boolean,
        _currentViewEditor: string,
        template,
        templateData,
    ): Promise<void> => {
        if (_currentViewEditor === EDITOR_VIEW.UNDEFINED) {
            const {
                result: { defaultAppOverride },
            } = await getDeploymentTemplate(+appId, +state.selectedChart.id, true)
            _isBasicViewLocked = isBasicValueChanged(defaultAppOverride, template)
        }

        if (!state.currentEditorView || !_currentViewEditor) {
            _currentViewEditor =
                _isBasicViewLocked || currentServerInfo?.serverInfo?.installationType === InstallationType.ENTERPRISE
                    ? EDITOR_VIEW.ADVANCED
                    : EDITOR_VIEW.BASIC

            const payload = {
                isBasicLocked: _isBasicViewLocked,
                currentEditorView: _currentViewEditor,
                yamlMode: _currentViewEditor === EDITOR_VIEW.ADVANCED,
            }

            if (templateData['publishedState']) {
                payload['publishedState'] = {
                    ...templateData['publishedState'],
                    ...payload,
                }
            }

            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload,
            })
        }
        if (!_isBasicViewLocked) {
            const _basicFieldValues = getBasicFieldValue(template)
            if (
                _basicFieldValues[BASIC_FIELDS.HOSTS].length === 0 ||
                !_basicFieldValues[BASIC_FIELDS.PORT] ||
                !_basicFieldValues[BASIC_FIELDS.ENV_VARIABLES] ||
                !_basicFieldValues[BASIC_FIELDS.RESOURCES]
            ) {
                const payload = {
                    isBasicLocked: true,
                    currentEditorView: EDITOR_VIEW.ADVANCED,
                    yamlMode: true,
                }

                if (templateData['publishedState']) {
                    payload['publishedState'] = {
                        ...templateData['publishedState'],
                        ...payload,
                    }
                }

                dispatch({
                    type: DeploymentConfigStateActionTypes.multipleOptions,
                    payload,
                })
            } else {
                const payload = {
                    isBasicLocked: _isBasicViewLocked,
                    basicFieldValues: _basicFieldValues,
                    basicFieldValuesErrorObj: validateBasicView(_basicFieldValues),
                }

                if (templateData['publishedState']) {
                    payload['publishedState'] = {
                        ...templateData['publishedState'],
                        ...payload,
                    }
                }

                dispatch({
                    type: DeploymentConfigStateActionTypes.multipleOptions,
                    payload,
                })
            }
        }
    }

    async function fetchDeploymentTemplate() {
        dispatch({
            type: DeploymentConfigStateActionTypes.chartConfigLoading,
            payload: true,
        })
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
            } = await getDeploymentTemplate(+appId, +state.selectedChart.id)

            const templateData = {
                template: defaultAppOverride,
                schema,
                readme,
                chartConfig: { id, refChartTemplate, refChartTemplateVersion, chartRefId, readme },
                isAppMetricsEnabled: isAppMetricsEnabled,
                tempFormData: YAML.stringify(defaultAppOverride, null),
            }

            let payload = {}
            if (state.publishedState) {
                payload['publishedState'] = {
                    ...state.publishedState,
                    ...templateData,
                }
                payload['readme'] = readme
                payload['schema'] = schema
                payload['chartConfig'] = {
                    ...state.publishedState?.chartConfig,
                    readme,
                }
            } else {
                payload = templateData
            }

            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload,
            })

            if (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) {
                updateTemplateFromBasicValue(defaultAppOverride)
                parseDataForView(isBasicViewLocked, currentViewEditor, defaultAppOverride, payload)
            }
        } catch (err) {
            showError(err)
        } finally {
            dispatch({
                type: DeploymentConfigStateActionTypes.chartConfigLoading,
                payload: false,
            })
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!obj) {
            toast.error(error)
            return
        } else if (
            (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) &&
            !state.yamlMode &&
            !state.basicFieldValuesErrorObj.isValid
        ) {
            toast.error('Some required fields are missing')
            return
        } else if (state.isConfigProtectionEnabled) {
            toggleSaveChangesModal()
            return
        }

        if (state.chartConfig.id) {
            //update flow, might have overridden
            dispatch({
                type: DeploymentConfigStateActionTypes.showConfirmation,
                payload: true,
            })
        } else {
            save()
        }
    }

    async function save() {
        dispatch({
            type: DeploymentConfigStateActionTypes.loading,
            payload: true,
        })
        try {
            const requestBody = prepareDataToSave()
            const api = state.chartConfig.id ? updateDeploymentTemplate : saveDeploymentTemplate
            await api(requestBody)
            reloadEnvironments()
            fetchDeploymentTemplate()
            respondOnSuccess()
            dispatch({
                type: DeploymentConfigStateActionTypes.fetchedValues,
                payload: {},
            })
            toast.success(<SuccessToastBody chartConfig={state.chartConfig} />)

            if (!isCiPipeline) {
                const stageIndex = navItems.findIndex((item) => item.stage === STAGE_NAME.DEPLOYMENT_TEMPLATE)
                history.push(navItems[stageIndex + 1].href)
            }
        } catch (err) {
            showError(err)
        } finally {
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: { loading: false, showConfirmation: false },
            })
        }
    }

    const toggleAppMetrics = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.isAppMetricsEnabled,
            payload: !state.isAppMetricsEnabled,
        })
    }

    const editorOnChange = (str: string, fromBasic?: boolean): void => {
        dispatch({
            type: DeploymentConfigStateActionTypes.tempFormData,
            payload: str,
        })
        if (
            state.selectedChart &&
            (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) &&
            str &&
            state.currentEditorView &&
            !state.isBasicLocked &&
            !fromBasic
        ) {
            try {
                dispatch({
                    type: DeploymentConfigStateActionTypes.isBasicLocked,
                    payload: isBasicValueChanged(YAML.parse(str)),
                })
            } catch (error) {}
        }
    }

    const handleReadMeClick = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: {
                showReadme: !state.showReadme,
                openComparison: state.showReadme && state.selectedTabIndex === 2,
            },
        })
    }

    const handleComparisonClick = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: { openComparison: !state.openComparison, showReadme: false },
        })
    }

    const changeEditorMode = (): void => {
        if (state.basicFieldValuesErrorObj && !state.basicFieldValuesErrorObj.isValid) {
            toast.error('Some required fields are missing')
            toggleYamlMode(false)
            return
        }
        if (state.isBasicLocked) {
            return
        }

        try {
            const parsedCodeEditorValue = YAML.parse(state.tempFormData)
            if (state.yamlMode) {
                const _basicFieldValues = getBasicFieldValue(parsedCodeEditorValue)
                dispatch({
                    type: DeploymentConfigStateActionTypes.multipleOptions,
                    payload: {
                        basicFieldValues: _basicFieldValues,
                        basicFieldValuesErrorObj: validateBasicView(_basicFieldValues),
                    },
                })
            } else {
                const newTemplate = patchBasicData(parsedCodeEditorValue, state.basicFieldValues)
                updateTemplateFromBasicValue(newTemplate)
                editorOnChange(YAML.stringify(newTemplate), !state.yamlMode)
            }
            toggleYamlMode(!state.yamlMode)
        } catch (error) {}
    }

    const handleTabSelection = (index: number) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.selectedTabIndex,
            payload: index,
        })

        switch (index) {
            case 1:
            case 3:
                if (state.selectedTabIndex == 2) {
                    toggleYamlMode(state.isBasicLocked)
                    handleComparisonClick()
                }
                break
            case 2:
                if (!state.openComparison) {
                    toggleYamlMode(true)
                    handleComparisonClick()
                }
                break
            default:
                break
        }
    }

    const toggleSaveChangesModal = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleSaveChangesModal })
    }

    const toggleDraftComments = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleDraftComments })
    }

    const prepareDataToSave = () => {
        const requestData = {
            ...(state.chartConfig.chartRefId === state.selectedChart.id ? state.chartConfig : {}),
            appId: +appId,
            chartRefId: state.selectedChart.id,
            valuesOverride: obj,
            defaultAppOverride: state.template,
            isAppMetricsEnabled: state.isAppMetricsEnabled,
        }
        if (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) {
            requestData.isBasicViewLocked = state.isBasicLocked
            requestData.currentViewEditor = state.isBasicLocked ? EDITOR_VIEW.ADVANCED : state.currentEditorView
            if (!state.yamlMode) {
                requestData.valuesOverride = patchBasicData(obj, state.basicFieldValues)
            }
        }
        return requestData
    }

    const renderValuesView = () => {
        const readOnlyPublishedMode =
            state.selectedTabIndex === 1 && state.isConfigProtectionEnabled && state.latestDraft

        return (
            <form
                action=""
                className={`white-card__deployment-config p-0 bcn-0 ${state.openComparison ? 'comparison-view' : ''} ${
                    state.showReadme ? 'readme-view' : ''
                }`}
                onSubmit={handleSubmit}
            >
                <DeploymentTemplateOptionsTab
                    codeEditorValue={readOnlyPublishedMode ? state.publishedState?.tempFormData : state.tempFormData}
                    disableVersionSelect={state.isConfigProtectionEnabled && !!state.latestDraft}
                />
                {readOnlyPublishedMode ? (
                    <DeploymentTemplateReadOnlyEditorView value={state.publishedState?.tempFormData} />
                ) : (
                    <DeploymentTemplateEditorView
                        defaultValue={state.publishedState?.tempFormData}
                        value={state.tempFormData}
                        globalChartRefId={state.publishedState?.selectedChartRefId}
                        editorOnChange={editorOnChange}
                        readOnly={
                            state.latestDraft?.draftState === 4 && (state.selectedTabIndex === 2 || state.showReadme)
                        }
                    />
                )}
                <DeploymentConfigFormCTA
                    loading={state.loading || state.chartConfigLoading}
                    showAppMetricsToggle={
                        state.charts &&
                        state.selectedChart &&
                        appMetricsEnvironmentVariableEnabled &&
                        grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED &&
                        state.yamlMode
                    }
                    isAppMetricsEnabled={
                        readOnlyPublishedMode ? state.publishedState?.isAppMetricsEnabled : state.isAppMetricsEnabled
                    }
                    isCiPipeline={isCiPipeline}
                    toggleAppMetrics={toggleAppMetrics}
                    isDraftMode={readOnlyPublishedMode}
                    reload={initialise}
                />
            </form>
        )
    }

    const getValueForContext = () => {
        return {
            isUnSet: state.latestDraft && state.selectedTabIndex === 1 ? false : isUnSet,
            state,
            dispatch,
            environments: environments || [],
            changeEditorMode: changeEditorMode,
        }
    }

    return (
        <DeploymentConfigContext.Provider value={getValueForContext()}>
            <div
                className={`app-compose__deployment-config dc__window-bg ${
                    state.openComparison || state.showReadme ? 'full-view' : ''
                } ${state.showComments ? 'comments-view' : ''}`}
            >
                <div className="dc__border br-4 m-12 dc__overflow-hidden" style={{ height: 'calc(100vh - 102px)' }}>
                    <ConfigToolbar
                        loading={state.loading || state.chartConfigLoading}
                        draftId={state.latestDraft?.draftId}
                        draftVersionId={state.latestDraft?.draftVersionId}
                        selectedTabIndex={state.selectedTabIndex}
                        handleTabSelection={handleTabSelection}
                        noReadme={!state.yamlMode}
                        showReadme={state.showReadme}
                        isReadmeAvailable={!!state.readme}
                        handleReadMeClick={handleReadMeClick}
                        handleCommentClick={toggleDraftComments}
                        isDraftMode={state.isConfigProtectionEnabled && !!state.latestDraft}
                        isApprovalPending={state.latestDraft?.draftState === 4}
                        approvalUsers={state.latestDraft?.approvers}
                        reload={initialise}
                    />
                    {renderValuesView()}
                    {SaveChangesModal && state.showSaveChangsModal && (
                        <SaveChangesModal
                            appId={Number(appId)}
                            envId={-1}
                            resourceType={3}
                            resourceName="BaseDeploymentTemplate"
                            prepareDataToSave={prepareDataToSave}
                            toggleModal={toggleSaveChangesModal}
                            latestDraft={state.latestDraft}
                            reload={initialise}
                        />
                    )}
                    {state.showConfirmation && <SaveConfirmationDialog save={save} />}
                </div>
                {DraftComments && state.showComments && (
                    <DraftComments
                        draftId={state.latestDraft?.draftId}
                        draftVersionId={state.latestDraft?.draftVersionId}
                        toggleDraftComments={toggleDraftComments}
                    />
                )}
            </div>
        </DeploymentConfigContext.Provider>
    )
}
