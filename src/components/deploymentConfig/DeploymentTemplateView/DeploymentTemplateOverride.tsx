/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useReducer, Reducer, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
    showError,
    useAsync,
    useMainContext,
    YAMLStringify,
    ModuleNameMap,
    ModuleStatus,
} from '@devtron-labs/devtron-fe-common-lib'
import { getDeploymentTemplate, chartRefAutocomplete } from '../../../Pages/Shared/EnvironmentOverride/service'
import { getOptions } from '../service'
import { importComponentFromFELibrary } from '../../common'
import { DeploymentConfigStateAction, DeploymentConfigStateActionTypes, DeploymentConfigStateWithDraft } from '../types'
import {
    ComponentStates,
    DeploymentTemplateOverrideProps,
} from '../../../Pages/Shared/EnvironmentOverride/EnvironmentOverrides.types'
import { getModuleInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'
import { groupDataByType } from '../DeploymentConfig.utils'
import { deploymentConfigReducer, initDeploymentConfigState } from '../DeploymentConfigReducer'
import DeploymentTemplateOverrideForm from './DeploymentTemplateOverrideForm'
import '../deploymentConfig.scss'

const DraftComments = importComponentFromFELibrary('DraftComments')
const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')

export default function DeploymentTemplateOverride({
    setParentState,
    environments,
    environmentName,
    isProtected,
    reloadEnvironments,
    fetchEnvConfig,
}: DeploymentTemplateOverrideProps) {
    const { isSuperAdmin } = useMainContext()
    const { appId, envId } = useParams<{ appId; envId }>()
    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [appId])
    const [state, dispatch] = useReducer<Reducer<DeploymentConfigStateWithDraft, DeploymentConfigStateAction>>(
        deploymentConfigReducer,
        { ...initDeploymentConfigState, yamlMode: isSuperAdmin },
    )
    const baseDeploymentAbortController = useRef(null)

    const setIsValuesOverride = (value: boolean) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.isValuesOverride,
            payload: value,
        })
    }

    const setManifestDataRHSOverride = (value: string) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.manifestDataRHSOverride,
            payload: value,
        })
    }

    const setManifestDataLHSOverride = (value: string) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.manifestDataLHSOverride,
            payload: value,
        })
    }

    const setGroupedOptionsDataOverride = (value: Array<Object>) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.groupedOptionsDataOverride,
            payload: value,
        })
    }

    useEffect(() => {
        const fetchOptionsList = async () => {
            const { result } = await getOptions(+appId, +envId)
            const _groupedData = groupDataByType(result)
            setGroupedOptionsDataOverride(_groupedData)
        }
        fetchOptionsList()
    }, [environments])

    useEffect(() => {
        dispatch({ type: DeploymentConfigStateActionTypes.reset, payload: { isSuperAdmin } })
        reloadEnvironments()
        setTimeout(() => {
            baseDeploymentAbortController.current = new AbortController()
            initialise()
        }, 100)

        return () => {
            baseDeploymentAbortController.current?.abort()
        }
    }, [envId, appId])

    useEffect(() => {
        if (state.selectedChart) {
            fetchDeploymentTemplate()
        }
    }, [state.selectedChart])

    const updateRefsData = (chartRefsData, clearPublishedState?) => {
        const payload = {
            ...chartRefsData,
            chartConfigLoading: false,
        }

        if (clearPublishedState) {
            payload.publishedState = null
            payload.selectedTabIndex = 1 // to have same behaviour as when we discard draft in base deployment template
            payload.openComparison = false // to have same behaviour as when we discard draft in base deployment template
            payload.showReadme = false
            payload.showComments = false
            payload.latestDraft = null
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload,
        })
    }

    async function initialise(
        selectedChartRefId?: string,
        forceReloadEnvironments?: boolean,
        updateChartRefOnly?: boolean,
    ) {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: {
                chartConfigLoading: true,
                loading: true,
            },
        })
        chartRefAutocomplete(Number(appId), Number(envId), baseDeploymentAbortController.current.signal)
            .then((chartRefResp) => {
                // Use other latest ref id instead of selectedChartRefId on delete override action
                const _selectedChartId =
                    selectedChartRefId ||
                    chartRefResp.result.latestEnvChartRef ||
                    chartRefResp.result.latestAppChartRef ||
                    chartRefResp.result.latestChartRef

                const chartRefsData = {
                    charts: chartRefResp.result.chartRefs,
                    selectedChart: chartRefResp.result.chartRefs?.find((chart) => chart.id === _selectedChartId),
                    selectedChartRefId: _selectedChartId,
                    latestAppChartRef: chartRefResp.result.latestAppChartRef,
                    latestChartRef: chartRefResp.result.latestChartRef,
                }

                if (!updateChartRefOnly && isProtected && typeof getDraftByResourceName === 'function') {
                    fetchAllDrafts(chartRefsData)
                } else {
                    updateRefsData(chartRefsData)
                }

                if (selectedChartRefId || forceReloadEnvironments) {
                    setParentState(ComponentStates.reloading)
                }
            })
            .catch((e) => {
                if (!baseDeploymentAbortController.current.signal.aborted) {
                    setParentState(ComponentStates.failed)
                    showError(e)
                }
            })
            .finally(() => {
                dispatch({
                    type: DeploymentConfigStateActionTypes.chartConfigLoading,
                    payload: false,
                })
            })
    }

    const fetchAllDrafts = (chartRefsData) => {
        getDraftByResourceName(appId, Number(envId), 3, `${environmentName}-DeploymentTemplateOverride`)
            .then((draftsResp) => {
                if (draftsResp.result && (draftsResp.result.draftState === 1 || draftsResp.result.draftState === 4)) {
                    processDraftData(draftsResp.result, chartRefsData)
                } else {
                    updateRefsData(chartRefsData, !!state.publishedState)
                }
            })
            .catch(() => {
                updateRefsData(chartRefsData)
            })
    }
    const processDraftData = (latestDraft, chartRefsData) => {
        const {
            envOverrideValues,
            id,
            isDraftOverriden,
            isAppMetricsEnabled,
            chartRefId,
            status,
            manualReviewed,
            active,
            namespace,
        } = JSON.parse(latestDraft.data)

        const isApprovalPending = latestDraft.draftState === 4
        const payload = {
            chartConfigLoading: false,
            duplicate: envOverrideValues,
            draftValues: YAMLStringify(envOverrideValues),
            environmentConfig: {
                id,
                status,
                manualReviewed,
                active,
                namespace,
            },
            isAppMetricsEnabled,
            latestDraft,
            selectedTabIndex: isApprovalPending ? 2 : 3,
            openComparison: isApprovalPending,
            showReadme: false,
            showDraftOverriden: isDraftOverriden,
            ...{
                ...chartRefsData,
                selectedChartRefId: chartRefId,
                selectedChart: chartRefsData?.charts?.find((chart) => chart.id === chartRefId),
            },
        }

        if (chartRefsData) {
            payload['publishedState'] = {
                ...state.publishedState,
                ...chartRefsData,
            }
        } else if (!state.publishedState) {
            payload['publishedState'] = state
        }

        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload,
        })

        parseDataForView(payload, false)
    }

    async function handleAppMetrics() {
        if (state.latestDraft && state.selectedTabIndex !== 1) {
            dispatch({
                type: DeploymentConfigStateActionTypes.isAppMetricsEnabled,
                payload: !state.isAppMetricsEnabled,
            })
        } else {
            dispatch({
                type: DeploymentConfigStateActionTypes.appMetrics,
                payload: !state.data.appMetrics,
            })
        }
    }

    async function fetchDeploymentTemplate() {
        try {
            const { result } = await getDeploymentTemplate(
                +appId,
                +envId,
                state.selectedChartRefId || state.latestAppChartRef || state.latestChartRef,
                state.selectedChart.name,
            )

            const _duplicateFromResp =
                result.IsOverride || state.duplicate
                    ? result.environmentConfig.envOverrideValues || result.globalConfig
                    : null
            const payload = {
                data: result,
                duplicate: state.latestDraft ? state.duplicate : _duplicateFromResp,
                readme: result.readme,
                schema: result.schema,
                guiSchema: result.guiSchema,
                ...(result.guiSchema === '{}' ? { yamlMode: true } : {}),
            }

            if (isProtected && state.latestDraft) {
                payload['publishedState'] = {
                    ...state.publishedState,
                    ...result,
                    isOverride: result.IsOverride,
                }
            }

            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload,
            })

            parseDataForView(payload, true)

            setParentState(ComponentStates.loaded)
        } catch (err) {
            setParentState(ComponentStates.failed)
            showError(err)
        } finally {
            dispatch({ type: DeploymentConfigStateActionTypes.loading, payload: false })
        }
    }

    async function handleOverride(e) {
        e.preventDefault()
        if (state.duplicate && (!state.latestDraft || state.isDraftOverriden)) {
            const showDeleteModal = state.latestDraft ? state.latestDraft.action !== 3 : state.data.IsOverride
            // permanent delete
            if (isProtected && showDeleteModal) {
                dispatch({ type: DeploymentConfigStateActionTypes.toggleDeleteOverrideDraftModal })
            } else if (showDeleteModal) {
                dispatch({ type: DeploymentConfigStateActionTypes.toggleDialog })
            } else {
                // remove copy
                dispatch({
                    type: DeploymentConfigStateActionTypes.multipleOptions,
                    payload: { duplicate: null, isDraftOverriden: false },
                })
                parseDataForView({}, false)
            }
        } else {
            // create copy
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: {
                    duplicate: state.data.globalConfig,
                    selectedChartRefId: state.data.globalChartRefId,
                    isDraftOverriden: !!state.latestDraft,
                },
            })
        }
    }

    const parseDataForView = async (templateData, updatePublishedState): Promise<void> => {
        const statesToUpdate = {}

        // Override yamlMode state to advanced when draft state is 4 (approval pending)
        if (templateData.latestDraft?.draftState === 4) {
            statesToUpdate['yamlMode'] = true
        }

        if (updatePublishedState && templateData['publishedState']) {
            dispatch({
                type: DeploymentConfigStateActionTypes.publishedState,
                payload: {
                    ...templateData['publishedState'],
                    ...statesToUpdate,
                },
            })
        } else {
            dispatch({
                type: DeploymentConfigStateActionTypes.multipleOptions,
                payload: statesToUpdate,
            })
        }
    }

    const toggleDraftComments = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleDraftComments })
    }

    return (
        <div
            className={`app-compose__deployment-config dc__window-bg ${
                state.openComparison || state.showReadme ? 'full-view' : ''
            } ${state.showComments ? 'comments-view' : ''}`}
        >
            <div className="bcn-0 dc__border br-4 m-8 dc__overflow-hidden" style={{ height: 'calc(100vh - 92px)' }}>
                {state.data && state.charts && (
                    <DeploymentTemplateOverrideForm
                        state={state}
                        isConfigProtectionEnabled={isProtected}
                        environments={environments}
                        environmentName={environmentName}
                        reloadEnvironments={reloadEnvironments}
                        fetchEnvConfig={fetchEnvConfig}
                        handleOverride={handleOverride}
                        dispatch={dispatch}
                        initialise={initialise}
                        handleAppMetrics={handleAppMetrics}
                        toggleDraftComments={toggleDraftComments}
                        isGrafanaModuleInstalled={grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED}
                        isValuesOverride={state.isValuesOverride}
                        setIsValuesOverride={setIsValuesOverride}
                        groupedData={state.groupedOptionsDataOverride}
                        manifestDataRHS={state.manifestDataRHSOverride}
                        manifestDataLHS={state.manifestDataLHSOverride}
                        setManifestDataRHS={setManifestDataRHSOverride}
                        setManifestDataLHS={setManifestDataLHSOverride}
                        convertVariablesOverride={state.convertVariablesOverride}
                    />
                )}
            </div>
            {DraftComments && state.showComments && (
                <DraftComments
                    draftId={state.latestDraft?.draftId}
                    draftVersionId={state.latestDraft?.draftVersionId}
                    toggleDraftComments={toggleDraftComments}
                />
            )}
        </div>
    )
}
