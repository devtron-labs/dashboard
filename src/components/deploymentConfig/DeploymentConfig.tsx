import React, { Reducer, createContext, useContext, useEffect, useReducer } from 'react'
import { useHistory, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { getDeploymentTemplate, updateDeploymentTemplate, saveDeploymentTemplate } from './service'
import { getAppOtherEnvironmentMin, getChartReferences } from '../../services/service'
import { useJsonYaml, useAsync, importComponentFromFELibrary } from '../common'
import { showError, useEffectAfterMount, not, noop } from '@devtron-labs/devtron-fe-common-lib'
import {
    DeploymentConfigContextType,
    DeploymentConfigProps,
    DeploymentConfigStateAction,
    DeploymentConfigStateActionTypes,
    DeploymentConfigStateType,
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

const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar', DeploymentConfigToolbar)

export const DeploymentConfigContext = createContext<DeploymentConfigContextType>(null)

export default function DeploymentConfig({
    respondOnSuccess,
    isUnSet,
    navItems,
    isCiPipeline,
    environments,
    setEnvironments,
}: DeploymentConfigProps) {
    const history = useHistory()
    const { appId, envId } = useParams<{ appId: string; envId: string }>()
    const { currentServerInfo } = useContext(mainContext)
    const [state, dispatch] = useReducer<Reducer<DeploymentConfigStateType, DeploymentConfigStateAction>>(
        deploymentConfigReducer,
        initDeploymentConfigState,
    )
    const [obj, , , error] = useJsonYaml(state.tempFormData, 4, 'yaml', true)
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
    }, [state.selectedChart])

    useEffect(() => {
        if (!environmentsLoading && environmentResult?.result) {
            setEnvironments(environmentResult.result)
        }
    }, [environmentsLoading, environmentResult])

    async function initialise() {
        dispatch({
            type: DeploymentConfigStateActionTypes.chartConfigLoading,
            payload: true,
        })
        try {
            const {
                result: { chartRefs, latestAppChartRef, latestChartRef, chartMetadata },
            } = await getChartReferences(+appId)
            const selectedChartId: number = latestAppChartRef || latestChartRef
            const chart = chartRefs.find((chart) => chart.id === selectedChartId)

            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: {
                    charts: chartRefs,
                    chartsMetadata: chartMetadata,
                    selectedChartRefId: selectedChartId,
                    selectedChart: chart,
                },
            })
        } catch (err) {
        } finally {
            dispatch({
                type: DeploymentConfigStateActionTypes.chartConfigLoading,
                payload: false,
            })
        }
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
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: {
                    isBasicLocked: _isBasicViewLocked,
                    currentEditorView: _currentViewEditor,
                    yamlMode: _currentViewEditor === EDITOR_VIEW.BASIC ? false : true,
                },
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
                dispatch({
                    type: DeploymentConfigStateActionTypes.multipleOptions,
                    payload: {
                        isBasicLocked: true,
                        currentEditorView: EDITOR_VIEW.ADVANCED,
                        yamlMode: true,
                    },
                })
            } else {
                dispatch({
                    type: DeploymentConfigStateActionTypes.multipleOptions,
                    payload: {
                        isBasicLocked: _isBasicViewLocked,
                        basicFieldValues: _basicFieldValues,
                        basicFieldValuesErrorOb: validateBasicView(_basicFieldValues),
                    },
                })
            }
        }
    }

    async function fetchDeploymentTemplate() {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
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
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: {
                    template: defaultAppOverride,
                    schema,
                    readme,
                    chartConfig: { id, refChartTemplate, refChartTemplateVersion, chartRefId, readme },
                    isAppMetricsEnabled: isAppMetricsEnabled,
                    tempFormData: YAML.stringify(defaultAppOverride, null),
                },
            })

            if (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) {
                updateTemplateFromBasicValue(defaultAppOverride)
                parseDataForView(isBasicViewLocked, currentViewEditor, defaultAppOverride)
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
        }
        if (
            (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) &&
            !state.yamlMode &&
            !state.basicFieldValuesErrorObj.isValid
        ) {
            toast.error('Some required fields are missing')
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
            const requestBody = {
                ...(state.chartConfig.chartRefId === state.selectedChart.id ? state.chartConfig : {}),
                appId: +appId,
                chartRefId: state.selectedChart.id,
                valuesOverride: obj,
                defaultAppOverride: state.template,
                isAppMetricsEnabled: state.isAppMetricsEnabled,
            }
            if (state.selectedChart.name === ROLLOUT_DEPLOYMENT || state.selectedChart.name === DEPLOYMENT) {
                requestBody.isBasicViewLocked = state.isBasicLocked
                requestBody.currentViewEditor = state.isBasicLocked ? EDITOR_VIEW.ADVANCED : state.currentEditorView
                if (!state.yamlMode) {
                    requestBody.valuesOverride = patchBasicData(obj, state.basicFieldValues)
                }
            }
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
                openComparison: state.showReadme && state.selectedTabIndex === 2 ? true : false,
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
                        basicFieldValuesErrorOb: validateBasicView(_basicFieldValues),
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
                if (state.openComparison) {
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
            case 3:
                break
            default:
                break
        }
    }

    const appMetricsEnvironmentVariableEnabled = window._env_ && window._env_.APPLICATION_METRICS_ENABLED

    return (
        <DeploymentConfigContext.Provider
            value={{
                isUnSet,
                state,
                dispatch,
                environments: environments || [],
                changeEditorMode: changeEditorMode,
            }}
        >
            <div
                className={`app-compose__deployment-config dc__window-bg ${
                    state.openComparison || state.showReadme ? 'full-view' : 'h-100'
                }`}
            >
                <div className="dc__border br-4 m-12 dc__overflow-hidden h-100">
                    <ConfigToolbar
                        loading={state.loading || state.chartConfigLoading}
                        selectedTabIndex={state.selectedTabIndex}
                        handleTabSelection={handleTabSelection}
                        noReadme={!state.yamlMode}
                        showReadme={state.showReadme}
                        handleReadMeClick={handleReadMeClick}
                        handleCommentClick={noop}
                        isDraftMode={false}
                        handleDiscardDraft={noop}
                        isApprovalPending={false}
                        approvalUsers={[]}
                        activityHistory={[]}
                    />
                    <form
                        action=""
                        className={`white-card__deployment-config p-0 bcn-0 ${
                            state.openComparison ? 'comparison-view' : ''
                        }`}
                        onSubmit={handleSubmit}
                    >
                        <DeploymentTemplateOptionsTab codeEditorValue={state.tempFormData} />
                        <DeploymentTemplateEditorView value={state.tempFormData} editorOnChange={editorOnChange} />
                        {!state.openComparison && !state.showReadme && (
                            <DeploymentConfigFormCTA
                                loading={state.loading || state.chartConfigLoading}
                                showAppMetricsToggle={
                                    state.charts &&
                                    state.selectedChart &&
                                    appMetricsEnvironmentVariableEnabled &&
                                    grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED &&
                                    state.yamlMode
                                }
                                isAppMetricsEnabled={state.isAppMetricsEnabled}
                                isCiPipeline={isCiPipeline}
                                toggleAppMetrics={toggleAppMetrics}
                                selectedChart={state.selectedChart}
                            />
                        )}
                    </form>
                    {state.showConfirmation && <SaveConfirmationDialog save={save} />}
                </div>
            </div>
        </DeploymentConfigContext.Provider>
    )
}
