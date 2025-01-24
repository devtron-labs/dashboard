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

import { useState, useEffect, useMemo } from 'react'
import {
    showError,
    Progressing,
    Reload,
    GenericEmptyState,
    useAsync,
    PipelineType,
    Sidebar,
    LogResizeButton,
    CICDSidebarFilterOptionType,
    History,
    HistoryComponentType,
    FetchIdDataStatus,
    Scroller,
    GitChanges,
    TriggerDetails,
    useScrollable,
    useInterval,
    mapByKey,
    asyncWrap,
    Artifacts,
    LogsRenderer,
    ModuleNameMap,
    EMPTY_STATE_STATUS,
    TabGroup,
    TRIGGER_STATUS_PROGRESSING,
    ErrorScreenManager,
    SecurityDetailsCards,
    sanitizeTargetPlatforms,
} from '@devtron-labs/devtron-fe-common-lib'
import { Switch, Route, Redirect, useRouteMatch, useParams, useHistory, generatePath } from 'react-router-dom'
import {
    getCIPipelines,
    getCIHistoricalStatus,
    getTriggerHistory,
    getTagDetails,
    getArtifactForJobCi,
} from '../../service'
import { URLS, Routes } from '../../../../config'
import { BuildDetails, CIDetailsProps, CIPipeline, HistoryLogsType, SecurityTabType } from './types'
import { ImageNotScannedView, CIRunningView } from './cIDetails.util'
import './ciDetails.scss'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../../../v2/devtronStackManager/DevtronStackManager.type'
import { getModuleConfigured } from '../appDetails/appDetails.service'
import { CIPipelineBuildType } from '../../../ciPipeline/types'
import { renderCIListHeader, renderDeploymentHistoryTriggerMetaText } from '../cdDetails/utils'
import { importComponentFromFELibrary } from '@Components/common'
import { useGetAppSecurityDetails } from '../appDetails/AppSecurity'

const SecurityModalSidebar = importComponentFromFELibrary('SecurityModalSidebar', null, 'function')
const terminalStatus = new Set(['succeeded', 'failed', 'error', 'cancelled', 'nottriggered', 'notbuilt'])
const statusSet = new Set(['starting', 'running', 'pending'])

export default function CIDetails({
    isJobView,
    filteredEnvIds,
    clearEnvListSelection,
}: CIDetailsProps) {
    const { appId, pipelineId, buildId } = useParams<{
        appId: string
        pipelineId: string
        buildId: string
    }>()
    const [pagination, setPagination] = useState<{ offset: number; size: number }>({ offset: 0, size: 20 })
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [triggerHistory, setTriggerHistory] = useState<Map<number, History>>(new Map())
    const [fullScreenView, setFullScreenView] = useState<boolean>(false)
    const [hasMoreLoading, setHasMoreLoading] = useState<boolean>(false)
    const [appReleaseTags, setAppReleaseTags] = useState<[]>([])
    const [tagsEditable, setTagsEditable] = useState<boolean>(false)
    const [hideImageTaggingHardDelete, setHideImageTaggingHardDelete] = useState<boolean>(false)
    const [fetchBuildIdData, setFetchBuildIdData] = useState<FetchIdDataStatus>(null)

    const triggerDetails = triggerHistory?.get(+buildId)
    // This is only meant for logsRenderer
    const [scrollableParentRef, scrollToTop, scrollToBottom] = useScrollable({
        autoBottomScroll: triggerDetails && TRIGGER_STATUS_PROGRESSING.includes(triggerDetails.status.toLowerCase()),
    })

    const [initDataLoading, initDataResults] = useAsync(
        () =>
            Promise.allSettled([
                getCIPipelines(+appId, filteredEnvIds, showError),
                getModuleInfo(ModuleNameMap.SECURITY),
                getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
            ]),
        [appId, filteredEnvIds],
    )

    const [loading, triggerHistoryResult, , , , dependencyState] = useAsync(
        () => getTriggerHistory(+pipelineId, pagination),
        [pipelineId, pagination],
        !!pipelineId,
    )

    const { path } = useRouteMatch()
    const { push, replace } = useHistory()
    useInterval(pollHistory, 30000)

    useEffect(() => {
        if (!triggerHistoryResult?.result?.ciWorkflows?.length) {
            return
        }
        if (fetchBuildIdData === FetchIdDataStatus.FETCHING || fetchBuildIdData === FetchIdDataStatus.SUCCESS) {
            return
        }
        if (triggerHistoryResult.result.ciWorkflows?.length !== pagination.size) {
            setHasMore(false)
        } else {
            setHasMore(true)
            setHasMoreLoading(true)
        }

        const newTriggerHistory = (triggerHistoryResult.result.ciWorkflows || []).reduce((agg, curr) => {
            agg.set(curr.id, curr)
            return agg
        }, triggerHistory)

        setAppReleaseTags(triggerHistoryResult?.result?.appReleaseTagNames || [])
        setTagsEditable(triggerHistoryResult?.result?.tagsEditable || false)
        setHideImageTaggingHardDelete(triggerHistoryResult?.result?.hideImageTaggingHardDelete || false)

        if (buildId && !newTriggerHistory.has(+buildId) && fetchBuildIdData !== FetchIdDataStatus.SUSPEND) {
            setFetchBuildIdData(FetchIdDataStatus.FETCHING)
            newTriggerHistory.clear()
        } else {
            setFetchBuildIdData(FetchIdDataStatus.SUSPEND)
        }

        setTriggerHistory(new Map(newTriggerHistory))
    }, [triggerHistoryResult])

    useEffect(() => {
        return () => {
            setTriggerHistory(new Map())
            setHasMoreLoading(false)
            setHasMore(false)
            setFetchBuildIdData(null)
        }
    }, [pipelineId])

    function synchroniseState(triggerId: number, triggerDetails: History, triggerDetailsError: any) {
        if (triggerDetailsError) {
            if (triggerHistoryResult?.result?.ciWorkflows) {
                setTriggerHistory(new Map(mapByKey(triggerHistoryResult.result.ciWorkflows, 'id')))
            }
            setFetchBuildIdData(FetchIdDataStatus.SUSPEND)
            return
        }

        if (triggerId === triggerDetails?.id) {
            setTriggerHistory((triggerHistory) => {
                triggerHistory.set(triggerId, triggerDetails)
                return new Map(triggerHistory)
            })
            if (fetchBuildIdData === FetchIdDataStatus.FETCHING) {
                setFetchBuildIdData(FetchIdDataStatus.SUCCESS)
            }
        }
    }

    async function pollHistory() {
        if (!pipelineId || !fetchBuildIdData || fetchBuildIdData !== FetchIdDataStatus.SUSPEND) {
            return
        }

        const [error, result] = await asyncWrap(
            getTriggerHistory(+pipelineId, { offset: 0, size: pagination.offset + pagination.size }),
        )
        if (error) {
            showError(error)
            return
        }
        setTriggerHistory(mapByKey(result?.result?.ciWorkflows || [], 'id'))
    }

    const handleViewAllHistory = () => {
        if (triggerHistoryResult?.result?.ciWorkflows) {
            setTriggerHistory(new Map(mapByKey(triggerHistoryResult.result.ciWorkflows, 'id')))
        }
        setFetchBuildIdData(FetchIdDataStatus.SUSPEND)
        replace(generatePath(path, { appId, pipelineId }))
    }

    if ((!hasMoreLoading && loading) || initDataLoading || (pipelineId && dependencyState[0] !== pipelineId)) {
        return <Progressing pageLoader />
    }
    if (pipelineId && !buildId && triggerHistory.size > 0) {
        replace(generatePath(path, { buildId: triggerHistory.entries().next().value[0], appId, pipelineId }))
    }
    const pipelines: CIPipeline[] = (initDataResults[0]?.['value']?.['result'] || [])?.filter(
        (pipeline) => pipeline.pipelineType !== 'EXTERNAL' && pipeline.pipelineType !== PipelineType.LINKED_CD,
    ) // external and LINKED_CD pipelines not visible in dropdown
    const selectedPipelineExist = !pipelineId || pipelines.find((pipeline) => pipeline.id === +pipelineId)

    if ((!pipelines.length || !selectedPipelineExist) && filteredEnvIds) {
        clearEnvListSelection()
    } else if (!pipelines.length && pipelineId && !filteredEnvIds) {
        // reason is un-required params like logs were leaking
        replace(generatePath(path, { appId }))
    } else if (
        (pipelines.length === 1 && !pipelineId) ||
        (!selectedPipelineExist && pipelines.length && !filteredEnvIds)
    ) {
        replace(generatePath(path, { appId, pipelineId: pipelines[0].id }))
    }
    const pipelineOptions: CICDSidebarFilterOptionType[] = (pipelines || []).map((item) => {
        return { value: `${item.id}`, label: item.name, pipelineId: item.id, pipelineType: item.pipelineType }
    })
    const pipelinesMap = mapByKey(pipelines, 'id')
    const pipeline = pipelinesMap.get(+pipelineId)

    const redirectToArtifactLogs = () => {
        push(`${URLS.APP}/${pipeline.parentAppId}/${URLS.APP_CI_DETAILS}/${pipeline.parentCiPipeline}/logs`)
    }
    const renderSourcePipelineButton = () => {
        return (
            <button className="flex cta h-32" onClick={redirectToArtifactLogs}>
                View Source Pipeline
            </button>
        )
    }
    return (
        <div className={`ci-details ${fullScreenView ? 'ci-details--full-screen' : ''}`}>
            {!fullScreenView && (
                <div className="ci-details__history">
                    <Sidebar
                        filterOptions={pipelineOptions}
                        type={HistoryComponentType.CI}
                        hasMore={hasMore}
                        triggerHistory={triggerHistory}
                        setPagination={setPagination}
                        fetchIdData={fetchBuildIdData}
                        handleViewAllHistory={handleViewAllHistory}
                    />
                </div>
            )}
            <div className="ci-details__body">
                <div className="flexbox-col flex-grow-1 dc__overflow-auto" ref={scrollableParentRef}>
                    {!pipelineId ? (
                        // Empty state if there is no pipeline
                        <GenericEmptyState
                            title={EMPTY_STATE_STATUS.CI_BUILD_HISTORY_NO_PIPELINE.TITLE}
                            subTitle={`${EMPTY_STATE_STATUS.CI_BUILD_HISTORY_NO_PIPELINE.SUBTITLE} ${
                                isJobView ? 'to see execution details' : 'to start seeing CI builds'
                            }.`}
                        />
                    ) : (
                        pipeline && (
                            <>
                                {triggerHistory.size > 0 || fetchBuildIdData ? (
                                    <Route
                                        path={`${path
                                            .replace(':pipelineId(\\d+)?', ':pipelineId(\\d+)')
                                            .replace(':buildId(\\d+)?', ':buildId(\\d+)')}`}
                                    >
                                        <Details
                                            fullScreenView={fullScreenView}
                                            synchroniseState={synchroniseState}
                                            triggerHistory={triggerHistory}
                                            isSecurityModuleInstalled={
                                                initDataResults[1]?.['value']?.['result']?.status ===
                                                    ModuleStatus.INSTALLED || false
                                            }
                                            isBlobStorageConfigured={
                                                initDataResults[2]?.['value']?.['result']?.enabled || false
                                            }
                                            isJobView={isJobView}
                                            tagsEditable={tagsEditable}
                                            appReleaseTags={appReleaseTags}
                                            hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                                            fetchIdData={fetchBuildIdData}
                                            isJobCI={pipeline.pipelineType === CIPipelineBuildType.CI_JOB}
                                            scrollToTop={scrollToTop}
                                            scrollToBottom={scrollToBottom}
                                        />
                                    </Route>
                                ) : pipeline.parentCiPipeline || pipeline.pipelineType === 'LINKED' ? (
                                    // Empty state if there is no linked pipeline
                                    <GenericEmptyState
                                        title={EMPTY_STATE_STATUS.CI_BUILD_HISTORY_LINKED_PIPELINE.TITLE}
                                        subTitle={EMPTY_STATE_STATUS.CI_BUILD_HISTORY_LINKED_PIPELINE.SUBTITLE}
                                        isButtonAvailable
                                        renderButton={renderSourcePipelineButton}
                                    />
                                ) : (
                                    !loading && (
                                        // Empty state if there is no pipeline
                                        <GenericEmptyState
                                            title={`${isJobView ? 'Job' : 'Build'} ${
                                                EMPTY_STATE_STATUS.CI_BUILD_HISTORY_PIPELINE_TRIGGER.TITLE
                                            }`}
                                            subTitle={EMPTY_STATE_STATUS.CI_BUILD_HISTORY_PIPELINE_TRIGGER.SUBTITLE}
                                        />
                                    )
                                )}
                            </>
                        )
                    )}
                </div>
                <LogResizeButton fullScreenView={fullScreenView} setFullScreenView={setFullScreenView} />
            </div>
        </div>
    )
}

export const Details = ({
    fullScreenView,
    synchroniseState,
    triggerHistory,
    isSecurityModuleInstalled,
    isBlobStorageConfigured,
    isJobView,
    isJobCI,
    appIdFromParent,
    tagsEditable,
    appReleaseTags,
    hideImageTaggingHardDelete,
    fetchIdData,
    scrollToTop,
    scrollToBottom,
}: BuildDetails) => {
    const { pipelineId, appId, buildId } = useParams<{ appId: string; buildId: string; pipelineId: string }>()
    const triggerDetails = triggerHistory.get(+buildId)
    const [triggerDetailsLoading, triggerDetailsResult, triggerDetailsError, reloadTriggerDetails] = useAsync(
        () => getCIHistoricalStatus({ appId: appId ?? appIdFromParent, pipelineId, buildId }),
        [pipelineId, buildId, appId ?? appIdFromParent],
        !!buildId && !terminalStatus.has(triggerDetails?.status?.toLowerCase()),
    )

    let areTagDetailsRequired = !!fetchIdData && fetchIdData !== FetchIdDataStatus.SUSPEND
    if (triggerDetailsResult?.result?.artifactId === 0 || triggerDetails?.artifactId === 0) {
        areTagDetailsRequired = false
    }

    const [tagDetailsLoading, tagDetailsResult, tagDetailsError] = useAsync(
        () =>
            getTagDetails({
                pipelineId,
                artifactId: triggerDetailsResult?.result?.artifactId || triggerDetails?.artifactId,
            }),
        [pipelineId, buildId],
        areTagDetailsRequired &&
            !!pipelineId &&
            (!!triggerDetailsResult?.result?.artifactId || !!triggerDetails?.artifactId),
    )

    useEffect(() => {
        if (triggerDetailsLoading) {
            return
        }
        let triggerDetailsWithTags = {
            ...triggerDetailsResult?.result,
            imageReleaseTags: triggerDetails?.imageReleaseTags,
            imageComment: triggerDetails?.imageComment,
        }
        if (areTagDetailsRequired) {
            triggerDetailsWithTags = null
        }
        synchroniseState(+buildId, triggerDetailsWithTags, triggerDetailsError)
    }, [triggerDetailsLoading, triggerDetailsResult, triggerDetailsError])

    useEffect(() => {
        if (tagDetailsLoading || !triggerDetailsResult || !areTagDetailsRequired) {
            return
        }
        const triggerDetailsWithTags = {
            ...triggerDetailsResult?.result,
            imageReleaseTags: tagDetailsResult?.result?.imageReleaseTags,
            imageComment: tagDetailsResult?.result?.imageComment,
        }
        synchroniseState(+buildId, triggerDetailsWithTags, tagDetailsError)
    }, [tagDetailsLoading, tagDetailsResult, tagDetailsError])

    const timeout = useMemo(() => {
        if (
            !triggerDetails ||
            terminalStatus.has(triggerDetails.podStatus?.toLowerCase() || triggerDetails.status?.toLowerCase())
        ) {
            return null
        } // no interval
        if (
            statusSet.has(triggerDetails.status?.toLowerCase()) ||
            (triggerDetails.podStatus && statusSet.has(triggerDetails.podStatus.toLowerCase()))
        ) {
            // 10s because progressing
            return 10000
        }
        return 30000 // 30s for normal
    }, [triggerDetails])
    useInterval(reloadTriggerDetails, timeout)

    if (
        (!areTagDetailsRequired && triggerDetailsLoading && !triggerDetails) ||
        !buildId ||
        (areTagDetailsRequired && (tagDetailsLoading || triggerDetailsLoading) && !triggerDetails)
    ) {
        return <Progressing pageLoader />
    }
    if (triggerDetailsError?.code === 404) {
        return (
            <GenericEmptyState
                title={`${isJobView ? 'Job' : 'Build'} ID ${EMPTY_STATE_STATUS.CI_DETAILS_NOT_FOUND.TITLE}`}
                subTitle={`The ${isJobView ? 'Job' : 'Build'} ID ${EMPTY_STATE_STATUS.CI_DETAILS_NOT_FOUND.SUBTITLE}`}
            />
        )
    }

    if (!areTagDetailsRequired && !triggerDetailsLoading && !triggerDetails) {
        return <Reload />
    }
    if (areTagDetailsRequired && !(tagDetailsLoading || triggerDetailsLoading) && !triggerDetails) {
        return <Reload />
    }
    if (triggerDetails.id !== +buildId) {
        return null
    }
    return (
        <>
            {!fullScreenView && (
                <>
                    <TriggerDetails
                        type={HistoryComponentType.CI}
                        status={triggerDetails.status}
                        startedOn={triggerDetails.startedOn}
                        finishedOn={triggerDetails.finishedOn}
                        triggeredBy={triggerDetails.triggeredBy}
                        triggeredByEmail={triggerDetails.triggeredByEmail}
                        ciMaterials={triggerDetails.ciMaterials}
                        gitTriggers={triggerDetails.gitTriggers}
                        message={triggerDetails.message}
                        podStatus={triggerDetails.podStatus}
                        stage={triggerDetails.stage}
                        artifact={triggerDetails.artifact}
                        environmentName={triggerDetails.environmentName}
                        isJobView={isJobView}
                        workerPodName={triggerDetails.podName}
                        renderDeploymentHistoryTriggerMetaText={renderDeploymentHistoryTriggerMetaText}
                    />
                    <div className="dc__border-bottom pl-50 pr-20 dc__position-sticky dc__top-0 bg__primary dc__zi-3">
                        <TabGroup
                            tabs={[
                                {
                                    id: 'logs-tab',
                                    label: 'Logs',
                                    tabType: 'navLink',
                                    props: {
                                        to: 'logs',
                                        replace: true,
                                        'data-testid': 'logs-link',
                                    },
                                },
                                {
                                    id: 'source-tab',
                                    label: 'Source',
                                    tabType: 'navLink',
                                    props: {
                                        to: 'source-code',
                                        replace: true,
                                        'data-testid': 'source-code-link',
                                    },
                                },
                                {
                                    id: 'artifacts-tab',
                                    label: 'Artifacts',
                                    tabType: 'navLink',
                                    props: {
                                        to: 'artifacts',
                                        replace: true,
                                        'data-testid': 'artifacts-link',
                                    },
                                },
                                ...(isSecurityModuleInstalled
                                    ? [
                                          {
                                              id: 'security-tab',
                                              label: 'Security',
                                              tabType: 'navLink' as const,
                                              props: {
                                                  to: 'security',
                                                  replace: true,
                                                  'data-testid': 'security_link',
                                              },
                                          },
                                      ]
                                    : []),
                            ]}
                            alignActiveBorderWithContainer
                        />
                    </div>
                </>
            )}

            <HistoryLogs
                key={triggerDetails.id}
                triggerDetails={triggerDetails}
                isBlobStorageConfigured={isBlobStorageConfigured}
                isJobView={isJobView}
                isJobCI={isJobCI}
                appIdFromParent={appIdFromParent}
                appReleaseTags={appReleaseTags}
                tagsEditable={tagsEditable}
                hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                scrollToTop={scrollToTop}
                scrollToBottom={scrollToBottom}
                fullScreenView={fullScreenView}
            />
        </>
    )
}

const HistoryLogs = ({
    triggerDetails,
    isBlobStorageConfigured,
    isJobView,
    isJobCI,
    appIdFromParent,
    appReleaseTags,
    tagsEditable,
    hideImageTaggingHardDelete,
    scrollToTop,
    scrollToBottom,
    fullScreenView,
}: HistoryLogsType) => {
    const { path } = useRouteMatch()
    const { pipelineId, buildId } = useParams<{ buildId: string; pipelineId: string }>()

    const [ciJobArtifact, setciJobArtifact] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const downloadArtifactUrl = `${Routes.CI_CONFIG_GET}/${pipelineId}/artifacts/${buildId}`
    const targetPlatforms = sanitizeTargetPlatforms(triggerDetails.targetPlatforms)

    useEffect(() => {
        if (isJobCI) {
            setLoading(true)
            getArtifactsForCiJobRes()
        }
    }, [triggerDetails])

    const getArtifactsForCiJobRes = async () => {
        try {
            const { result } = await getArtifactForJobCi(pipelineId, buildId)
            if (result) {
                setciJobArtifact(result.artifacts)
            }
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    const CiArtifactsArrayCards = Array.from({ length: ciJobArtifact?.length }, (_, index) => {
        // TargetPlatforms are not supported for Artifacts in case of JobCI
        return (
            <Artifacts
                status={triggerDetails.status}
                artifact={ciJobArtifact[index]}
                blobStorageEnabled={triggerDetails.blobStorageEnabled}
                downloadArtifactUrl={downloadArtifactUrl}
                isArtifactUploaded={triggerDetails.isArtifactUploaded}
                isJobCI={isJobCI}
                imageComment={triggerDetails.imageComment}
                imageReleaseTags={triggerDetails.imageReleaseTags}
                ciPipelineId={triggerDetails.ciPipelineId}
                artifactId={triggerDetails.artifactId}
                tagsEditable={tagsEditable}
                appReleaseTagNames={appReleaseTags}
                hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                rootClassName="pb-0-imp"
                renderCIListHeader={renderCIListHeader}
                targetPlatforms={[]}
            />
        )
    })
    return (
        <div className="trigger-outputs-container flexbox-col flex-grow-1">
            <Switch>
                <Route path={`${path}/logs`}>
                    <LogsRenderer
                        triggerDetails={triggerDetails}
                        isBlobStorageConfigured={isBlobStorageConfigured}
                        parentType={HistoryComponentType.CI}
                        fullScreenView={fullScreenView}
                    />
                    {(scrollToTop || scrollToBottom) && (
                        <Scroller
                            style={{ position: 'fixed', bottom: '52px', right: '12px', zIndex: '4' }}
                            {...{ scrollToTop, scrollToBottom }}
                        />
                    )}
                </Route>
                <Route path={`${path}/source-code`}>
                    <GitChanges gitTriggers={triggerDetails.gitTriggers} ciMaterials={triggerDetails.ciMaterials} />
                </Route>
                <Route path={`${path}/artifacts`}>
                    {loading && <Progressing pageLoader />}
                    {isJobCI && !loading && <div className="p-16 flexbox-col dc__gap-8">{CiArtifactsArrayCards}</div>}
                    {!loading && (
                        <div className="p-16 flex-grow-1">
                            <Artifacts
                                status={triggerDetails.status}
                                artifact={triggerDetails.artifact}
                                blobStorageEnabled={triggerDetails.blobStorageEnabled}
                                downloadArtifactUrl={downloadArtifactUrl}
                                isArtifactUploaded={triggerDetails.isArtifactUploaded}
                                isJobCI={isJobCI}
                                imageComment={triggerDetails.imageComment}
                                imageReleaseTags={triggerDetails.imageReleaseTags}
                                ciPipelineId={triggerDetails.ciPipelineId}
                                artifactId={triggerDetails.artifactId}
                                tagsEditable={tagsEditable}
                                appReleaseTagNames={appReleaseTags}
                                hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                                renderCIListHeader={renderCIListHeader}
                                targetPlatforms={targetPlatforms}
                            />
                        </div>
                    )}
                </Route>
                {
                    <Route path={`${path}/security`}>
                        <SecurityTab
                            artifactId={triggerDetails.artifactId}
                            status={triggerDetails.status}
                            appIdFromParent={appIdFromParent}
                        />
                    </Route>
                }
                <Redirect
                    to={
                        !isJobView && triggerDetails.status.toLowerCase() === 'succeeded'
                            ? `${path}/artifacts`
                            : `${path}/logs`
                    }
                />
            </Switch>
        </div>
    )
}

const SecurityTab = ({ artifactId, status, appIdFromParent }: SecurityTabType) => {
    const { appId } = useParams<{ appId: string }>()

    const computedAppId = appId ?? appIdFromParent

    const { scanResultLoading, scanResultResponse, scanResultError, reloadScanResult } = useGetAppSecurityDetails({
        appId: +computedAppId,
        artifactId,
    })

    if (['starting', 'running'].includes(status.toLowerCase())) {
        return <CIRunningView isSecurityTab />
    }

    if (!artifactId || ['failed', 'cancelled'].includes(status.toLowerCase())) {
        return (
            <GenericEmptyState
                title={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsGenerated}
                subTitle={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsError}
            />
        )
    }

    if (scanResultLoading) {
        return (
            <div className="bg__primary flex-grow-1">
                <Progressing pageLoader />
            </div>
        )
    }
    if (scanResultError) {
        return <ErrorScreenManager code={scanResultError.code} reload={reloadScanResult} />
    }
    if (!scanResultResponse?.result.scanned) {
        return <ImageNotScannedView />
    }

    return (
        <div className="p-20 bg__primary flex-grow-1">
            <SecurityDetailsCards scanResult={scanResultResponse?.result} Sidebar={SecurityModalSidebar} />
        </div>
    )
}
