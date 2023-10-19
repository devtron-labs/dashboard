import React, { useState, useEffect, useMemo } from 'react'
import { showError, Progressing, Reload, GenericEmptyState, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import { getCIPipelines, getCIHistoricalStatus, getTriggerHistory, getArtifact, getTagDetails, getArtifactForJobCi } from '../../service'
import { useScrollable, useInterval, mapByKey, asyncWrap } from '../../../common'
import { URLS, ModuleNameMap } from '../../../../config'
import { NavLink, Switch, Route, Redirect } from 'react-router-dom'
import { useRouteMatch, useParams, useHistory, generatePath } from 'react-router'
import { BuildDetails, CIPipeline, HistoryLogsType, SecurityTabType } from './types'
import { ReactComponent as Down } from '../../../../assets/icons/ic-dropdown-filled.svg'
import { getLastExecutionByArtifactId } from '../../../../services/service'
import { ScanDisabledView, ImageNotScannedView, CIRunningView } from './cIDetails.util'
import './ciDetails.scss'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../../../v2/devtronStackManager/DevtronStackManager.type'
import { getModuleConfigured } from '../appDetails/appDetails.service'
import Sidebar from '../cicdHistory/Sidebar'
import { Scroller, LogResizeButton, GitChanges } from '../cicdHistory/History.components'
import { TriggerDetails } from '../cicdHistory/TriggerDetails'
import Artifacts from '../cicdHistory/Artifacts'
import { CICDSidebarFilterOptionType, History, HistoryComponentType, FetchIdDataStatus } from '../cicdHistory/types'
import LogsRenderer from '../cicdHistory/LogsRenderer'
import { EMPTY_STATE_STATUS } from '../../../../config/constantMessaging'
import { ReactComponent as NoVulnerability } from '../../../../assets/img/ic-vulnerability-not-found.svg'
import { ScannedByToolModal } from '../../../common/security/ScannedByToolModal'
import { CIPipelineBuildType } from '../../../ciPipeline/types'
import { toast } from 'react-toastify'


const terminalStatus = new Set(['succeeded', 'failed', 'error', 'cancelled', 'nottriggered', 'notbuilt'])
let statusSet = new Set(['starting', 'running', 'pending'])

export default function CIDetails({ isJobView, filteredEnvIds }: { isJobView?: boolean, filteredEnvIds?: string }) {
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

    const [initDataLoading, initDataResults] = useAsync(
        () =>
            Promise.allSettled([
                getCIPipelines(+appId, filteredEnvIds),
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
        if (!pipelineId || !fetchBuildIdData || fetchBuildIdData !== FetchIdDataStatus.SUSPEND) return

        const [error, result] = await asyncWrap(
            getTriggerHistory(+pipelineId, { offset: 0, size: pagination.offset + pagination.size }),
        )
        if (error) {
            if(error.code === 403) {
                toast.error("Not authorized user")
                return
            }
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
    } else if (!buildId && triggerHistory.size > 0) {
        replace(generatePath(path, { buildId: triggerHistory.entries().next().value[0], appId, pipelineId }))
    }
    const pipelines: CIPipeline[] = (initDataResults[0]?.['value']?.['result'] || [])?.filter(
        (pipeline) => pipeline.pipelineType !== 'EXTERNAL',
    ) // external pipelines not visible in dropdown
    const selectedPipelineExist = !pipelineId || pipelines.find((pipeline) => pipeline.id === +pipelineId)
    if ((pipelines.length === 1 && !pipelineId) || (!selectedPipelineExist)) {
        replace(generatePath(path, { appId, pipelineId: pipelines[0].id }))
    }
    const pipelineOptions: CICDSidebarFilterOptionType[] = (pipelines || []).map((item) => {
        return { value: `${item.id}`, label: item.name, pipelineId: item.id, pipelineType: item.pipelineType}
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
        <>
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
                                        />
                                    </Route>
                                ) : pipeline.parentCiPipeline || pipeline.pipelineType === 'LINKED' ? (
                                    // Empty state if there is no linked pipeline
                                    <GenericEmptyState
                                        title={EMPTY_STATE_STATUS.CI_BUILD_HISTORY_LINKED_PIPELINE.TITLE}
                                        subTitle={EMPTY_STATE_STATUS.CI_BUILD_HISTORY_LINKED_PIPELINE.SUBTITLE}
                                        isButtonAvailable={true}
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
                    <LogResizeButton fullScreenView={fullScreenView} setFullScreenView={setFullScreenView} />
                </div>
            </div>
        </>
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
}: BuildDetails) => {
    const isJobCard: boolean = isJobView || isJobCI
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
        if (triggerDetailsLoading) return
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
        if (tagDetailsLoading || !triggerDetailsResult || !areTagDetailsRequired) return
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
        )
            return null // no interval
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
    )
        return <Progressing pageLoader />
    if (triggerDetailsError?.code === 404) {
        return (
            <GenericEmptyState
                title={`${isJobView ? 'Job' : 'Build'} ID ${EMPTY_STATE_STATUS.CI_DETAILS_NOT_FOUND.TITLE}`}
                subTitle={`The ${isJobView ? 'Job' : 'Build'} ID ${EMPTY_STATE_STATUS.CI_DETAILS_NOT_FOUND.SUBTITLE}`}
            />
        )
    }

    if (!areTagDetailsRequired && !triggerDetailsLoading && !triggerDetails) return <Reload />
    if (areTagDetailsRequired && !(tagDetailsLoading || triggerDetailsLoading) && !triggerDetails) return <Reload />
    if (triggerDetails.id !== +buildId) return null
    return (
        <>
            <div className="trigger-details-container">
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
                        />
                        <ul className="tab-list dc__border-bottom pl-20 pr-20">
                            <li className="tab-list__tab">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link"
                                    activeClassName="active"
                                    to={`logs`}
                                    data-testid="logs-link"
                                >
                                    Logs
                                </NavLink>
                            </li>
                            <li className="tab-list__tab">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link"
                                    activeClassName="active"
                                    to={`source-code`}
                                    data-testid="source-code-link"
                                >
                                    Source
                                </NavLink>
                            </li>
                            <li className="tab-list__tab">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link"
                                    activeClassName="active"
                                    to={`artifacts`}
                                    data-testid="artifacts-link"
                                >
                                    Artifacts
                                </NavLink>
                            </li>
                            {!isJobCard && isSecurityModuleInstalled && (
                                <li className="tab-list__tab">
                                    <NavLink
                                        replace
                                        className="tab-list__tab-link"
                                        activeClassName="active"
                                        to={`security`}
                                        data-testid="security_link"
                                    >
                                        Security
                                    </NavLink>
                                </li>
                            )}
                        </ul>
                    </>
                )}
            </div>
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
}: HistoryLogsType) => {
    let { path } = useRouteMatch()
    const isJobCard: boolean = isJobCI || isJobView
    const { pipelineId, buildId } = useParams<{ buildId: string; pipelineId: string }>()
    const [ref, scrollToTop, scrollToBottom] = useScrollable({
        autoBottomScroll: triggerDetails.status.toLowerCase() !== 'succeeded',
    })
    const _getArtifactPromise = () => getArtifact(pipelineId, buildId)
    const [ciJobArtifact, setciJobArtifact] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(false)
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
        return (
            <Artifacts
                status={triggerDetails.status}
                artifact={ciJobArtifact[index]}
                blobStorageEnabled={triggerDetails.blobStorageEnabled}
                getArtifactPromise={_getArtifactPromise}
                isArtifactUploaded={triggerDetails.isArtifactUploaded}
                isJobView={isJobView}
                isJobCI={isJobCI}
                imageComment={triggerDetails.imageComment}
                imageReleaseTags={triggerDetails.imageReleaseTags}
                ciPipelineId={triggerDetails.ciPipelineId}
                artifactId={triggerDetails.artifactId}
                tagsEditable={tagsEditable}
                appReleaseTagNames={appReleaseTags}
                hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                type={HistoryComponentType.CI}
                jobCIClass="pb-0-imp"
            />
        )
    })
    return (
        <div className="trigger-outputs-container">
            <Switch>
                <Route path={`${path}/logs`}>
                    <div ref={ref} className="dark-background h-100 dc__overflow-auto">
                        <LogsRenderer
                            triggerDetails={triggerDetails}
                            isBlobStorageConfigured={isBlobStorageConfigured}
                            parentType={HistoryComponentType.CI}
                        />
                    </div>
                    {(scrollToTop || scrollToBottom) && (
                        <Scroller
                            style={{ position: 'fixed', bottom: '25px', right: '32px' }}
                            {...{ scrollToTop, scrollToBottom }}
                        />
                    )}
                </Route>
                <Route path={`${path}/source-code`}>
                    <GitChanges gitTriggers={triggerDetails.gitTriggers} ciMaterials={triggerDetails.ciMaterials} />
                </Route>
                <Route path={`${path}/artifacts`}>
                    {loading && <Progressing pageLoader />}
                    {isJobCI && !loading && CiArtifactsArrayCards}
                    {!loading && (
                        <Artifacts
                            status={triggerDetails.status}
                            artifact={triggerDetails.artifact}
                            blobStorageEnabled={triggerDetails.blobStorageEnabled}
                            getArtifactPromise={_getArtifactPromise}
                            isArtifactUploaded={triggerDetails.isArtifactUploaded}
                            isJobView={isJobView}
                            isJobCI={isJobCI}
                            imageComment={triggerDetails.imageComment}
                            imageReleaseTags={triggerDetails.imageReleaseTags}
                            ciPipelineId={triggerDetails.ciPipelineId}
                            artifactId={triggerDetails.artifactId}
                            tagsEditable={tagsEditable}
                            appReleaseTagNames={appReleaseTags}
                            hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                            type={HistoryComponentType.CI}
                        />
                    )}
                </Route>
                {!isJobCard && (
                    <Route path={`${path}/security`}>
                        <SecurityTab
                            ciPipelineId={triggerDetails.ciPipelineId}
                            artifactId={triggerDetails.artifactId}
                            status={triggerDetails.status}
                            appIdFromParent={appIdFromParent}
                        />
                    </Route>
                )}
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
export function NoVulnerabilityViewWithTool({ scanToolId }: { scanToolId: number }) {
    return (
        <div className="flex h-100 dc__position-rel">
            <GenericEmptyState
                SvgImage={NoVulnerability}
                title={EMPTY_STATE_STATUS.CI_DEATILS_NO_VULNERABILITY_FOUND.TITLE}
                subTitle={EMPTY_STATE_STATUS.CI_DEATILS_NO_VULNERABILITY_FOUND.SUBTITLE}
                children={
                    <span className="flex dc__border-radius-24 bcn-0 pl-16 pr-16 pt-8 pb-8 en-1 bw-1">
                        <ScannedByToolModal scanToolId={scanToolId} />
                    </span>
                }
            />
        </div>
    )
}

const SecurityTab = ({ ciPipelineId, artifactId, status, appIdFromParent }: SecurityTabType) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [securityData, setSecurityData] = useState({
        vulnerabilities: [],
        lastExecution: '',
        severityCount: {
            critical: 0,
            moderate: 0,
            low: 0,
        },
        scanEnabled: false,
        scanned: false,
        isLoading: !!artifactId,
        isError: false,
        ScanToolId: null,
    })
    const { appId } = useParams<{ appId: string }>()
    const { push } = useHistory()
    async function callGetSecurityIssues() {
        try {
            const { result } = await getLastExecutionByArtifactId(appId ?? appIdFromParent, artifactId)
            setSecurityData({
                vulnerabilities: result.vulnerabilities,
                lastExecution: result.lastExecution,
                severityCount: result.severityCount,
                scanEnabled: result.scanEnabled,
                scanned: result.scanned,
                isLoading: false,
                isError: false,
                ScanToolId: result.scanToolId,
            })
        } catch (error) {
            // showError(error);
            setSecurityData({
                ...securityData,
                isLoading: false,
                isError: true,
            })
        }
    }

    function toggleCollapse() {
        setIsCollapsed(!isCollapsed)
    }

    useEffect(() => {
        if (artifactId) {
            callGetSecurityIssues()
        }
    }, [artifactId])

    const redirectToCreate = () => {
        if (!ciPipelineId) return
        push(
            `${URLS.APP}/${appId ?? appIdFromParent}/${URLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}/${ciPipelineId}/${
                URLS.APP_CI_CONFIG
            }/${ciPipelineId}/build`,
        )
    }

    const severityCount = securityData.severityCount
    const total = severityCount.critical + severityCount.moderate + severityCount.low

    if (['failed', 'cancelled'].includes(status.toLowerCase())) {
        return (
            <GenericEmptyState
                title={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsGenerated}
                subTitle={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsError}
            />
        )
    } else if (['starting', 'running'].includes(status.toLowerCase())) {
        return <CIRunningView isSecurityTab={true} />
    } else if (securityData.isLoading) {
        return <Progressing pageLoader />
    } else if (securityData.isError) {
        return <Reload />
    } else if (artifactId && !securityData.scanned) {
        if (!securityData.scanEnabled) {
            return <ScanDisabledView redirectToCreate={redirectToCreate} />
        } else {
            return <ImageNotScannedView />
        }
    } else if (artifactId && securityData.scanned && !securityData.vulnerabilities.length) {
        return <NoVulnerabilityViewWithTool scanToolId={securityData.ScanToolId} />
    }
    const scanToolId = securityData.ScanToolId

    return (
        <>
            <div className="security__top" data-testid="security-scan-execution-heading">
                Latest Scan Execution
            </div>
            <div className="white-card white-card--ci-scan" data-testid="last-scan-execution">
                <div className="security-scan__header" onClick={toggleCollapse}>
                    <Down
                        style={{ ['--rotateBy' as any]: isCollapsed ? '0deg' : '180deg' }}
                        className="icon-dim-24 rotate fcn-9 mr-12"
                    />
                    <div className="security-scan__last-scan dc__ellipsis-right">{securityData.lastExecution}</div>
                    {total === 0 ? <span className="dc__fill-pass">Passed</span> : null}
                    {severityCount.critical !== 0 ? (
                        <span className="dc__fill-critical">{severityCount.critical} Critical</span>
                    ) : null}
                    {severityCount.critical === 0 && severityCount.moderate !== 0 ? (
                        <span className="dc__fill-moderate">{severityCount.moderate} Moderate</span>
                    ) : null}
                    {severityCount.critical === 0 && severityCount.moderate === 0 && severityCount.low !== 0 ? (
                        <span className="dc__fill-low">{severityCount.low} Low</span>
                    ) : null}
                    <div className="security-scan__type flex">
                        <ScannedByToolModal scanToolId={scanToolId} />
                    </div>
                </div>
                {isCollapsed ? (
                    ''
                ) : (
                    <>
                        <table className="security-scan-table">
                            <tr className="security-scan-table__header">
                                <th className="security-scan-table__title security-scan-table__cve">CVE</th>
                                <th className="security-scan-table__title">SEVERITY</th>
                                <th className="security-scan-table__title security-scan-table--w-18">PACKAGE</th>
                                <th className="security-scan-table__title security-scan-table--w-18">
                                    CURRENT VERSION
                                </th>
                                <th className="security-scan-table__title security-scan-table--w-18">
                                    FIXED IN VERSION
                                </th>
                            </tr>
                            {securityData.vulnerabilities.map((item) => {
                                return (
                                    <tr className="security-scan-table__row">
                                        <td className="security-scan-table__data security-scan-table__pl security-scan-table__cve dc__cve-cell">
                                            <a
                                                href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${item.name}`}
                                                target="_blank"
                                            >
                                                {item.name}
                                            </a>
                                        </td>
                                        <td className="security-scan-table__data security-scan-table__pl">
                                            <span className={`fill-${item.severity}`} data-testid="severity-check">
                                                {item.severity}
                                            </span>
                                        </td>
                                        <td className="security-scan-table__data security-scan-table__pl security-scan-table--w-18">
                                            {item.package}
                                        </td>
                                        <td className="security-scan-table__data security-scan-table__pl security-scan-table--w-18">
                                            {item.version}
                                        </td>
                                        <td className="security-scan-table__data security-scan-table__pl security-scan-table--w-18">
                                            {item.fixedVersion}
                                        </td>
                                    </tr>
                                )
                            })}
                        </table>
                    </>
                )}
            </div>
        </>
    )
}
