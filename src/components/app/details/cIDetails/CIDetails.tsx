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

import { useEffect, useMemo, useState } from 'react'
import { generatePath, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'

import {
    Artifacts,
    asyncWrap,
    CICDSidebarFilterOptionType,
    EMPTY_STATE_STATUS,
    ErrorScreenManager,
    FetchIdDataStatus,
    GenericEmptyState,
    GitChanges,
    History,
    HistoryComponentType,
    LogResizeButton,
    LogsRenderer,
    mapByKey,
    ModuleNameMap,
    PipelineType,
    Progressing,
    Reload,
    sanitizeTargetPlatforms,
    Scroller,
    SecurityDetailsCards,
    showError,
    Sidebar,
    TabGroup,
    TRIGGER_STATUS_PROGRESSING,
    TriggerDetails,
    useAsync,
    useInterval,
    useScrollable,
    ROUTER_URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { Routes as ROUTES } from '../../../../config'
import { CIPipelineBuildType } from '../../../ciPipeline/types'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../../../v2/devtronStackManager/DevtronStackManager.type'
import {
    getArtifactForJobCi,
    getCIHistoricalStatus,
    getCIPipelines,
    getTagDetails,
    getTriggerHistory,
} from '../../service'
import { getModuleConfigured } from '../appDetails/appDetails.service'
import { useGetAppSecurityDetails } from '../appDetails/AppSecurity'
import { renderCIListHeader, renderDeploymentHistoryTriggerMetaText } from '../cdDetails/utils'
import { CIRunningView, ImageNotScannedView } from './cIDetails.util'
import { BuildDetails, CIPipeline, HistoryLogsType, SecurityTabType } from './types'

import './ciDetails.scss'

const SecurityModalSidebar = importComponentFromFELibrary('SecurityModalSidebar', null, 'function')
const terminalStatus = new Set(['succeeded', 'failed', 'error', 'cancelled', 'nottriggered', 'notbuilt'])
const statusSet = new Set(['starting', 'running', 'pending'])

export default function CIDetails({ isJobView, filteredEnvIds }: { isJobView?: boolean; filteredEnvIds?: string }) {
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

    const ciDetailsPath = isJobView ? ROUTER_URLS.JOB_DETAIL.CI_DETAILS : ROUTER_URLS.DEVTRON_APP_DETAILS.CI_DETAILS

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

    const navigate = useNavigate()
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

    useEffect(
        () => () => {
            setTriggerHistory(new Map())
            setHasMoreLoading(false)
            setHasMore(false)
            setFetchBuildIdData(null)
        },
        [pipelineId],
    )

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
        navigate(
            generatePath(`${ciDetailsPath}/:pipelineId`, {
                appId,
                pipelineId,
            }),
            { replace: true },
        )
    }

    if ((!hasMoreLoading && loading) || initDataLoading || (pipelineId && dependencyState[0] !== pipelineId)) {
        return <Progressing pageLoader />
    }
    if (pipelineId && !buildId && triggerHistory.size > 0) {
        navigate(
            generatePath(`${ciDetailsPath}/:pipelineId/:buildId`, {
                buildId: triggerHistory.entries().next().value[0],
                appId,
                pipelineId,
            }),
            {
                replace: true,
            },
        )
    }
    const pipelines: CIPipeline[] = (initDataResults[0]?.['value']?.result || [])?.filter(
        (pipeline) => pipeline.pipelineType !== 'EXTERNAL' && pipeline.pipelineType !== PipelineType.LINKED_CD,
    ) // external and LINKED_CD pipelines not visible in dropdown
    const selectedPipelineExist = !pipelineId || pipelines.find((pipeline) => pipeline.id === +pipelineId)

    if (!pipelines.length && pipelineId) {
        // reason is un-required params like logs were leaking
        navigate(generatePath(ciDetailsPath, { appId }), { replace: true })
    } else if ((pipelines.length === 1 && !pipelineId) || (!selectedPipelineExist && pipelines.length)) {
        navigate(
            generatePath(`${ciDetailsPath}/:pipelineId`, {
                appId,
                pipelineId: String(pipelines[0].id),
            }),
            { replace: true },
        )
    }
    const pipelineOptions: CICDSidebarFilterOptionType[] = (pipelines || []).map((item) => ({
        value: `${item.id}`,
        label: item.name,
        pipelineId: item.id,
        pipelineType: item.pipelineType,
    }))
    const pipelinesMap = mapByKey(pipelines, 'id')
    const pipeline = pipelinesMap.get(+pipelineId)

    const redirectToArtifactLogs = () => {
        navigate(generatePath(`${ROUTER_URLS.DEVTRON_APP_DETAILS.CI_DETAILS}/logs`, { appId: pipeline.parentAppId }))
    }

    const renderSourcePipelineButton = () => (
        <button className="flex cta h-32" onClick={redirectToArtifactLogs}>
            View Source Pipeline
        </button>
    )
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
                        path={`${ROUTER_URLS.DEVTRON_APP_DETAILS.CI_DETAILS}/:pipelineId?/:buildId?`}
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
                                    pipelineId &&
                                    buildId && (
                                        <Details
                                            fullScreenView={fullScreenView}
                                            synchroniseState={synchroniseState}
                                            triggerHistory={triggerHistory}
                                            isSecurityModuleInstalled={
                                                initDataResults[1]?.['value']?.result?.status ===
                                                    ModuleStatus.INSTALLED || false
                                            }
                                            isBlobStorageConfigured={
                                                initDataResults[2]?.['value']?.result?.enabled || false
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
                                    )
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
                        namespace={triggerDetails.namespace}
                        environmentName={triggerDetails.environmentName}
                        isJobView={isJobView}
                        workerPodName={triggerDetails.podName}
                        renderDeploymentHistoryTriggerMetaText={renderDeploymentHistoryTriggerMetaText}
                        workflowExecutionStages={triggerDetails.workflowExecutionStages}
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
    const { pipelineId, buildId } = useParams<{ buildId: string; pipelineId: string }>()

    const [ciJobArtifact, setciJobArtifact] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const downloadArtifactUrl = `${ROUTES.CI_CONFIG_GET}/${pipelineId}/artifacts/${buildId}`
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

    const CiArtifactsArrayCards = Array.from({ length: ciJobArtifact?.length }, (_, index) => (
        // TargetPlatforms are not supported for Artifacts in case of JobCI
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
    ))
    return (
        <div className="trigger-outputs-container flexbox-col flex-grow-1">
            <Routes>
                <Route
                    path="logs"
                    element={
                        <>
                            <LogsRenderer
                                triggerDetails={triggerDetails}
                                isBlobStorageConfigured={isBlobStorageConfigured}
                                parentType={HistoryComponentType.CI}
                                fullScreenView={fullScreenView}
                            />
                            {(scrollToTop || scrollToBottom) && (
                                <Scroller
                                    style={{ position: 'absolute', bottom: '52px', right: '12px', zIndex: '4' }}
                                    {...{ scrollToTop, scrollToBottom }}
                                />
                            )}
                        </>
                    }
                />
                <Route
                    path="source-code"
                    element={
                        <GitChanges gitTriggers={triggerDetails.gitTriggers} ciMaterials={triggerDetails.ciMaterials} />
                    }
                />
                <Route
                    path="artifacts"
                    element={
                        loading ? (
                            <Progressing pageLoader />
                        ) : (
                            <div className="p-16 flexbox-col dc__gap-8 flex-grow-1">
                                {isJobCI && CiArtifactsArrayCards}
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
                        )
                    }
                />
                <Route
                    path="security"
                    element={
                        <SecurityTab
                            artifactId={triggerDetails.artifactId}
                            status={triggerDetails.status}
                            appIdFromParent={appIdFromParent}
                        />
                    }
                />
                <Route
                    path="*"
                    element={
                        <Navigate
                            to={
                                !isJobView && triggerDetails.status.toLowerCase() === 'succeeded' ? 'artifacts' : 'logs'
                            }
                        />
                    }
                />
            </Routes>
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

    if (!artifactId) {
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
