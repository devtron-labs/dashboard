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

import { useEffect, useState } from 'react'
import { generatePath, useLocation, useNavigate, useParams } from 'react-router-dom'

import {
    asyncWrap,
    CICDSidebarFilterOptionType,
    DeploymentAppTypes,
    EMPTY_STATE_STATUS,
    FetchIdDataStatus,
    GenericEmptyState,
    getTriggerHistory,
    History,
    HistoryComponentType,
    LogResizeButton,
    mapByKey,
    ModuleNameMap,
    Progressing,
    showError,
    Sidebar,
    TRIGGER_STATUS_PROGRESSING,
    AppEnvironment,
    TriggerOutput,
    useAsync,
    useInterval,
    useScrollable,
    ROUTER_URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { useAppContext } from '@Components/common'

import { getAppOtherEnvironmentMin, getCDConfig as getCDPipelines } from '../../../../services/service'
import { AppNotConfigured } from '../appDetails/AppDetails'
import { getModuleConfigured } from '../appDetails/appDetails.service'
import {
    getUpdatedTriggerId,
    processVirtualEnvironmentDeploymentData,
    renderCIListHeader,
    renderDeploymentApprovalInfo,
    renderDeploymentHistoryTriggerMetaText,
    renderRunSource,
    renderRunSourceInDropdown,
    renderVirtualHistoryArtifacts,
} from './utils'

import './cdDetail.scss'

export default function CDDetails({ filteredEnvIds }: { filteredEnvIds: string }) {
    const location = useLocation()
    const { appId, envId, triggerId, pipelineId } = useParams<{
        appId: string
        envId: string
        triggerId: string
        pipelineId: string
    }>()
    const { currentAppName, environmentId, setEnvironmentId } = useAppContext()
    const [pagination, setPagination] = useState<{ offset: number; size: number }>({ offset: 0, size: 20 })
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [hasMoreLoading, setHasMoreLoading] = useState<boolean>(false)
    const [triggerHistory, setTriggerHistory] = useState<Map<number, History>>(new Map())
    const [fullScreenView, setFullScreenView] = useState<boolean>(false)
    const [appReleaseTags, setAppReleaseTags] = useState<string[]>([])
    const [tagsEditable, setTagsEditable] = useState<boolean>(false)
    const [hideImageTaggingHardDelete, setHideImageTaggingHardDelete] = useState<boolean>(false)
    const [loading, result] = useAsync(
        () =>
            Promise.allSettled([
                getAppOtherEnvironmentMin(appId, false),
                getCDPipelines(appId, false),
                getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
            ]),
        [appId, filteredEnvIds],
    )
    const [loadingDeploymentHistory, deploymentHistoryResult, deploymentHistoryError, , , dependencyState] = useAsync(
        () => getTriggerHistory({ appId: Number(appId), envId: Number(envId), pagination }),
        [pagination, appId, envId],
        !!envId && !!pipelineId,
    )
    const [envOptions, setEnvOptions] = useState<CICDSidebarFilterOptionType[]>([])
    const [selectedEnv, setSelectedEnv] = useState<AppEnvironment>(null)
    const [deploymentAppType, setDeploymentAppType] = useState<DeploymentAppTypes>(null)
    const navigate = useNavigate()
    useInterval(pollHistory, 30000)
    const [fetchTriggerIdData, setFetchTriggerIdData] = useState<FetchIdDataStatus>(null)

    const triggerDetails = triggerHistory?.get(+triggerId)
    const [scrollableRef, scrollToTop, scrollToBottom] = useScrollable({
        autoBottomScroll: triggerDetails && TRIGGER_STATUS_PROGRESSING.includes(triggerDetails.status.toLowerCase()),
    })

    useEffect(() => {
        // check for more
        if (loading || !deploymentHistoryResult) {
            return
        }
        if (!deploymentHistoryResult?.result?.cdWorkflows?.length) {
            return
        }
        if (fetchTriggerIdData === FetchIdDataStatus.FETCHING || fetchTriggerIdData === FetchIdDataStatus.SUCCESS) {
            return
        }
        if (deploymentHistoryResult.result?.cdWorkflows?.length !== pagination.size) {
            setHasMore(false)
        } else {
            setHasMore(true)
            setHasMoreLoading(true)
        }

        const queryString = new URLSearchParams(location.search)
        const queryParam = queryString.get('type')
        const _triggerId = getUpdatedTriggerId(
            deploymentHistoryResult.result?.cdWorkflows?.[0]?.id,
            queryParam,
            deploymentHistoryResult.result?.cdWorkflows,
        )

        const newTriggerHistory = (deploymentHistoryResult.result?.cdWorkflows || []).reduce((agg, curr) => {
            agg.set(curr.id, curr)
            return agg
        }, triggerHistory)

        setAppReleaseTags(deploymentHistoryResult?.result?.appReleaseTagNames || [])
        setTagsEditable(deploymentHistoryResult?.result?.tagsEditable || false)
        setHideImageTaggingHardDelete(deploymentHistoryResult?.result?.hideImageTaggingHardDelete || false)

        if (!triggerId && envId && pipelineId && deploymentHistoryResult.result?.cdWorkflows?.length) {
            navigate(
                generatePath(`${ROUTER_URLS.DEVTRON_APP_DETAILS.CD_DETAILS}/:envId/:pipelineId/:triggerId`, {
                    appId,
                    envId,
                    pipelineId,
                    triggerId: String(_triggerId),
                }),
                {
                    replace: true,
                },
            )
        }

        if (triggerId && !newTriggerHistory.has(+triggerId) && fetchTriggerIdData !== FetchIdDataStatus.SUSPEND) {
            setFetchTriggerIdData(FetchIdDataStatus.FETCHING)
            newTriggerHistory.clear()
        } else {
            setFetchTriggerIdData(FetchIdDataStatus.SUSPEND)
        }
        setTriggerHistory(new Map(newTriggerHistory))
    }, [deploymentHistoryResult, loading])

    //Result Typing to be fixed here
    useEffect(() => {
        if (!envId && environmentId) {
            navigate(
                generatePath(`${ROUTER_URLS.DEVTRON_APP_DETAILS.CD_DETAILS}/:envId`, {
                    envId: String(environmentId),
                    appId,
                }),
                { replace: true },
            )
            return
        }
        if (result) {
            if (result[1] && pipelineId) {
                setDeploymentAppType(
                    result[1]['value']?.pipelines?.find((pipeline) => pipeline.id === Number(pipelineId))
                        ?.deploymentAppType,
                )
            }
            if (result[0]) {
                const filteredEnvMap = filteredEnvIds?.split(',').reduce((agg, curr) => agg.set(curr, true), new Map())
                const _selectedEnvironment = (result[0]['value']?.result || [])
                    .filter((env) => !filteredEnvMap || filteredEnvMap.get(env.environmentId))
                    .find((envData) => +envId === envData.environmentId)
                setSelectedEnv(_selectedEnvironment)
            }
            setEnvironmentId(+envId)
        }

        return () => {
            setTriggerHistory(new Map())
            setHasMoreLoading(false)
            setHasMore(false)
            setFetchTriggerIdData(null)
        }
    }, [envId, result, pipelineId])

    useEffect(() => {
        if (result) {
            const pipelines = result[1]['value']?.pipelines || []
            const _deploymentAppType = pipelines?.find(
                (pipeline) => pipeline.id === Number(pipelineId),
            )?.deploymentAppType
            const cdPipelinesMap = mapByKey(pipelines, 'environmentId')

            let _selectedEnvironment
            let isEnvDeleted = false
            const filteredEnvMap = filteredEnvIds?.split(',').reduce((agg, curr) => agg.set(+curr, true), new Map())
            const envOptions: CICDSidebarFilterOptionType[] = (result[0]['value']?.result || [])
                .filter((env) => !filteredEnvMap || filteredEnvMap.get(env.environmentId))
                .map((envData) => {
                    if (envData.environmentId === +envId) {
                        _selectedEnvironment = envData
                    }
                    if (envData.deploymentAppDeleteRequest) {
                        isEnvDeleted = true
                    }
                    return {
                        value: `${envData.environmentId}`,
                        label: envData.environmentName,
                        pipelineId: cdPipelinesMap.get(envData.environmentId)?.id,
                        deploymentAppDeleteRequest: envData.deploymentAppDeleteRequest,
                    }
                })

            if (
                (envOptions.length === 1 && !envId && !isEnvDeleted) ||
                (envId && envOptions.length && !_selectedEnvironment)
            ) {
                setEnvironmentId(+envOptions[0].value)
                navigate(
                    generatePath(`${ROUTER_URLS.DEVTRON_APP_DETAILS.CD_DETAILS}/:envId/:pipelineId`, {
                        appId,
                        envId: envOptions[0].value,
                        pipelineId: String(envOptions[0].pipelineId),
                    }),
                    { replace: true },
                )
            } else if (envId && !pipelineId && _selectedEnvironment) {
                // Update the pipeline id when the selected environment is available and pipeline id is not available
                setEnvironmentId(_selectedEnvironment.environmentId)
                navigate(
                    generatePath(`${ROUTER_URLS.DEVTRON_APP_DETAILS.CD_DETAILS}/:envId/:pipelineId`, {
                        appId,
                        envId: _selectedEnvironment.environmentId,
                        pipelineId: cdPipelinesMap.get(_selectedEnvironment.environmentId)?.id,
                    }),
                    { replace: true },
                )
            }
            setEnvOptions(envOptions)
            setSelectedEnv(_selectedEnvironment)
            setDeploymentAppType(_deploymentAppType)
        }
    }, [result])

    async function pollHistory() {
        if (!pipelineId || !envId || !fetchTriggerIdData || fetchTriggerIdData !== FetchIdDataStatus.SUSPEND) {
            return
        }
        const [error, result] = await asyncWrap(
            getTriggerHistory({
                appId: +appId,
                envId: +envId,
                pagination: { offset: 0, size: pagination.offset + pagination.size },
            }),
        )
        if (error) {
            showError(error)
            return
        }

        const triggerHistoryMap = mapByKey(result?.result.cdWorkflows || [], 'id')
        const newTriggerHistory = Array.from(triggerHistoryMap).reduce((agg, [triggerId, curr]) => {
            const detailedTriggerHistory = triggerHistory.has(triggerId) ? triggerHistory.get(triggerId) : {}
            agg.set(curr.id, { ...detailedTriggerHistory, ...curr })
            return agg
        }, triggerHistoryMap)
        setTriggerHistory(newTriggerHistory)
    }

    const handleViewAllHistory = () => {
        if (deploymentHistoryResult.result?.cdWorkflows?.length) {
            setTriggerHistory(mapByKey(deploymentHistoryResult.result.cdWorkflows, 'id'))
        }
        setFetchTriggerIdData(FetchIdDataStatus.SUSPEND)
        navigate(
            generatePath(`${ROUTER_URLS.DEVTRON_APP_DETAILS.CD_DETAILS}/:envId/:pipelineId/:triggerId`, {
                appId,
                envId,
                pipelineId,
                triggerId: String(deploymentHistoryResult.result?.cdWorkflows?.[0]?.id),
            }),
            { replace: true },
        )
    }

    if ((!hasMoreLoading && loading) || (loadingDeploymentHistory && triggerHistory.size === 0)) {
        return <Progressing pageLoader />
    }
    if (result && (!Array.isArray(result[0]?.['value']?.result) || !Array.isArray(result[1]?.['value']?.pipelines))) {
        return <AppNotConfigured />
    }
    if (!result || (envId && dependencyState[2] !== envId)) {
        return null
    }

    return (
        <div className={`ci-details  ${fullScreenView ? 'ci-details--full-screen' : ''}`}>
            {!fullScreenView && (
                <div className="ci-details__history">
                    <Sidebar
                        filterOptions={envOptions}
                        type={HistoryComponentType.CD}
                        hasMore={hasMore}
                        triggerHistory={triggerHistory}
                        setPagination={setPagination}
                        fetchIdData={fetchTriggerIdData}
                        handleViewAllHistory={handleViewAllHistory}
                        renderRunSource={renderRunSource}
                        path={`${ROUTER_URLS.DEVTRON_APP_DETAILS.CD_DETAILS}/:envId?/:pipelineId?/:triggerId?`}
                    />
                </div>
            )}
            <div className="ci-details__body">
                <div className="flexbox-col flex-grow-1 dc__overflow-auto h-100" ref={scrollableRef}>
                    {triggerHistory.size > 0 || fetchTriggerIdData ? (
                        envId &&
                        pipelineId && (
                            <TriggerOutput
                                fullScreenView={fullScreenView}
                                triggerHistory={triggerHistory}
                                deploymentHistoryResult={deploymentHistoryResult ?? null}
                                setTriggerHistory={setTriggerHistory}
                                setFullScreenView={setFullScreenView}
                                deploymentAppType={deploymentAppType}
                                isBlobStorageConfigured={result[2]?.['value']?.result?.enabled || false}
                                appReleaseTags={appReleaseTags}
                                tagsEditable={tagsEditable}
                                hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                                fetchIdData={fetchTriggerIdData}
                                setFetchTriggerIdData={setFetchTriggerIdData}
                                selectedEnvironmentName={selectedEnv?.environmentName}
                                renderRunSource={renderRunSourceInDropdown}
                                renderCIListHeader={renderCIListHeader}
                                renderDeploymentApprovalInfo={renderDeploymentApprovalInfo}
                                renderDeploymentHistoryTriggerMetaText={renderDeploymentHistoryTriggerMetaText}
                                renderVirtualHistoryArtifacts={renderVirtualHistoryArtifacts}
                                processVirtualEnvironmentDeploymentData={processVirtualEnvironmentDeploymentData}
                                scrollToTop={scrollToTop}
                                scrollToBottom={scrollToBottom}
                                appName={currentAppName}
                                pathPattern={`${ROUTER_URLS.DEVTRON_APP_DETAILS.CD_DETAILS}/:envId/:pipelineId/:triggerId?`}
                            />
                        )
                    ) : !envId ? (
                        <GenericEmptyState
                            title={EMPTY_STATE_STATUS.CD_DETAILS_NO_ENVIRONMENT.TITLE}
                            subTitle={EMPTY_STATE_STATUS.CD_DETAILS_NO_ENVIRONMENT.SUBTITLE}
                        />
                    ) : (
                        <GenericEmptyState
                            title={EMPTY_STATE_STATUS.CD_DETAILS_NO_DEPLOYMENT.TITLE}
                            subTitle={`${EMPTY_STATE_STATUS.CD_DETAILS_NO_DEPLOYMENT.SUBTITLE} ${selectedEnv?.environmentName} environment.`}
                        />
                    )}
                </div>
                <LogResizeButton fullScreenView={fullScreenView} setFullScreenView={setFullScreenView} />
            </div>
        </div>
    )
}
