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

import { useState, useEffect } from 'react'
import {
    Progressing,
    showError,
    sortCallback,
    useAsync,
    Sidebar,
    TriggerOutput,
    LogResizeButton,
    CICDSidebarFilterOptionType,
    History,
    HistoryComponentType,
    FetchIdDataStatus,
    useInterval,
    mapByKey,
    asyncWrap,
    getTriggerHistory,
    useScrollable,
    TRIGGER_STATUS_PROGRESSING,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory, useRouteMatch, useParams, generatePath, Route } from 'react-router-dom'
import { useAppContext } from '../../../common'
import { ModuleNameMap } from '../../../../config'
import { getModuleConfigured } from '../../../app/details/appDetails/appDetails.service'
import { getAppsCDConfigMin } from '../../AppGroup.service'
import { EmptyView } from '../../../app/details/cicdHistory/History.components'
import { DeploymentTemplateList } from '../../../app/details/cdDetails/cd.type'
import { AppNotConfigured } from '../../../app/details/appDetails/AppDetails'
import { AppGroupDetailDefaultType } from '../../AppGroup.types'
import { APP_GROUP_CD_DETAILS } from '../../../../config/constantMessaging'
import '../../../app/details/appDetails/appDetails.scss'
import '../../../app/details/cdDetails/cdDetail.scss'
import {
    processVirtualEnvironmentDeploymentData,
    renderCIListHeader,
    renderDeploymentApprovalInfo,
    renderDeploymentHistoryTriggerMetaText,
    renderRunSource,
    renderVirtualHistoryArtifacts,
} from '../../../app/details/cdDetails/utils'

export default function EnvCDDetails({ filteredAppIds }: AppGroupDetailDefaultType) {
    const { appId, envId, triggerId, pipelineId } = useParams<{
        appId: string
        envId: string
        triggerId: string
        pipelineId: string
    }>()
    const [pagination, setPagination] = useState<{ offset: number; size: number }>({ offset: 0, size: 20 })
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [hasMoreLoading, setHasMoreLoading] = useState<boolean>(false)
    const [triggerHistory, setTriggerHistory] = useState<Map<number, History>>(new Map())
    const [pipelineList, setPipelineList] = useState([])
    const [fullScreenView, setFullScreenView] = useState<boolean>(false)
    const [appReleaseTags, setAppReleaseTags] = useState<string[]>([])
    const [tagsEditable, setTagsEditable] = useState<boolean>(false)
    const [hideImageTaggingHardDelete, setHideImageTaggingHardDelete] = useState<boolean>(false)
    const [fetchTriggerIdData, setFetchTriggerIdData] = useState<FetchIdDataStatus>(null)

    const triggerDetails = triggerHistory?.get(+triggerId)
    const [scrollableRef, scrollToTop, scrollToBottom] = useScrollable({
        autoBottomScroll: triggerDetails && TRIGGER_STATUS_PROGRESSING.includes(triggerDetails.status.toLowerCase()),
    })

    const [loading, result] = useAsync(
        () =>
            Promise.allSettled([
                getAppsCDConfigMin(envId, filteredAppIds),
                getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
            ]),
        [filteredAppIds],
    )
    const [loadingDeploymentHistory, deploymentHistoryResult, , , , dependencyState] = useAsync(
        () => getTriggerHistory({ appId: Number(appId), envId: Number(envId), pagination }),
        [pagination, appId, envId],
        !!appId && !!pipelineId,
    )
    const { path } = useRouteMatch()
    const { replace } = useHistory()
    const { currentEnvironmentName } = useAppContext()
    useInterval(pollHistory, 30000)


    useEffect(() => {
        if (result?.[0]?.['value']?.result?.length) {
            const selectedPipelineExist = result[0]['value'].result.some((pipeline) => pipeline.id === +pipelineId)
            result[0]['value'].result.sort((a, b) => sortCallback('appName', a, b))
            if (!selectedPipelineExist) {
                replace(
                    generatePath(path, {
                        envId,
                        appId: result[0]['value'].result[0].appId,
                        pipelineId: result[0]['value'].result[0].id,
                    }),
                )
            }
            setPipelineList(result[0]['value'].result)
        }
    }, [result?.[0]?.['value']?.result])

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
        const newTriggerHistory = (deploymentHistoryResult.result?.cdWorkflows || []).reduce((agg, curr) => {
            agg.set(curr.id, curr)
            return agg
        }, triggerHistory)

        setHideImageTaggingHardDelete(deploymentHistoryResult?.result?.hideImageTaggingHardDelete || false)
        setTagsEditable(deploymentHistoryResult?.result?.tagsEditable || false)
        setAppReleaseTags(deploymentHistoryResult?.result?.appReleaseTagNames || [])

        if (triggerId && !newTriggerHistory.has(+triggerId) && fetchTriggerIdData !== FetchIdDataStatus.SUSPEND) {
            setFetchTriggerIdData(FetchIdDataStatus.FETCHING)
            newTriggerHistory.clear()
        } else {
            setFetchTriggerIdData(FetchIdDataStatus.SUSPEND)
        }
        setTriggerHistory(new Map(newTriggerHistory))
    }, [deploymentHistoryResult, loading])

    useEffect(() => {
        return () => {
            setTriggerHistory(new Map())
            setHasMoreLoading(false)
            setHasMore(false)
            setFetchTriggerIdData(null)
        }
    }, [appId])

    async function pollHistory() {
        // polling
        if (!pipelineId || !appId || !fetchTriggerIdData || fetchTriggerIdData !== FetchIdDataStatus.SUSPEND) {
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

        const triggerHistoryMap = mapByKey(result?.result?.cdWorkflows || [], 'id')
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
        replace(
            generatePath(path, {
                appId,
                envId,
                pipelineId,
                triggerId: deploymentHistoryResult.result?.cdWorkflows?.[0]?.id,
            }),
        )
    }

    if ((!hasMoreLoading && loading) || (loadingDeploymentHistory && triggerHistory.size === 0)) {
        return <Progressing pageLoader />
    }
    if (result && !Array.isArray(result[0]?.['value']?.result)) {
        return <AppNotConfigured />
    }
    if (!result || (appId && dependencyState[1] !== appId)) {
        return null
    }

    if (!triggerId && appId && pipelineId && deploymentHistoryResult?.result?.cdWorkflows?.length) {
        replace(
            generatePath(path, {
                appId,
                envId,
                pipelineId,
                triggerId: deploymentHistoryResult.result.cdWorkflows?.[0].id,
            }),
        )
    }

    const envOptions: CICDSidebarFilterOptionType[] = pipelineList.map((item) => {
        return {
            value: `${item.appId}`,
            label: item.appName,
            pipelineId: item.id,
        }
    })

    const selectedApp = pipelineList.find((envData) => envData.appId === +appId)

    const renderDetail = (): JSX.Element => {
        if (triggerHistory.size > 0 || fetchTriggerIdData) {
            const deploymentAppType = pipelineList.find(
                (pipeline) => pipeline.id === Number(pipelineId),
            )?.deploymentAppType
            return (
                <Route
                    path={`${path
                        .replace(':pipelineId(\\d+)?', ':pipelineId(\\d+)')
                        .replace(':appId(\\d+)?', ':appId(\\d+)')}`}
                >
                    <TriggerOutput
                        fullScreenView={fullScreenView}
                        deploymentHistoryResult={deploymentHistoryResult ?? null}
                        triggerHistory={triggerHistory}
                        setTriggerHistory={setTriggerHistory}
                        setFullScreenView={setFullScreenView}
                        deploymentAppType={deploymentAppType}
                        isBlobStorageConfigured={result[1]?.['value']?.result?.enabled || false}
                        appReleaseTags={appReleaseTags}
                        tagsEditable={tagsEditable}
                        hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                        fetchIdData={fetchTriggerIdData}
                        setFetchTriggerIdData={setFetchTriggerIdData}
                        selectedEnvironmentName={currentEnvironmentName}
                        renderRunSource={renderRunSource}
                        renderCIListHeader={renderCIListHeader}
                        renderDeploymentApprovalInfo={renderDeploymentApprovalInfo}
                        renderDeploymentHistoryTriggerMetaText={renderDeploymentHistoryTriggerMetaText}
                        renderVirtualHistoryArtifacts={renderVirtualHistoryArtifacts}
                        processVirtualEnvironmentDeploymentData={processVirtualEnvironmentDeploymentData}
                        scrollToTop={scrollToTop}
                        scrollToBottom={scrollToBottom}
                        appName={selectedApp?.appName}
                    />
                </Route>
            )
        }
        if (!appId) {
            return (
                <EmptyView
                    title={APP_GROUP_CD_DETAILS.noSelectedApp.title}
                    subTitle={APP_GROUP_CD_DETAILS.noSelectedApp.subTitle}
                />
            )
        }
        return (
            <EmptyView
                title={APP_GROUP_CD_DETAILS.noDeployment.title}
                subTitle={APP_GROUP_CD_DETAILS.noDeployment.getSubtitle(selectedApp?.appName)}
            />
        )
    }

    return (
        <div className={`ci-details  ${fullScreenView ? 'ci-details--full-screen' : ''}`}>
            {!fullScreenView && (
                <div className="ci-details__history">
                    <Sidebar
                        filterOptions={envOptions}
                        type={HistoryComponentType.GROUP_CD}
                        hasMore={hasMore}
                        triggerHistory={triggerHistory}
                        setPagination={setPagination}
                        fetchIdData={fetchTriggerIdData}
                        handleViewAllHistory={handleViewAllHistory}
                        renderRunSource={renderRunSource}
                    />
                </div>
            )}
            <div className="ci-details__body">
                <div className="flexbox-col flex-grow-1 dc__overflow-scroll h-100" ref={scrollableRef}>
                    {renderDetail()}
                </div>
                <LogResizeButton fullScreenView={fullScreenView} setFullScreenView={setFullScreenView} />
            </div>
        </div>
    )
}
