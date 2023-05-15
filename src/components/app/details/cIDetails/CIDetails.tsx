import React, { useState, useEffect, useMemo } from 'react'
import { showError, Progressing, Reload } from '@devtron-labs/devtron-fe-common-lib'
import { getCIPipelines, getCIHistoricalStatus, getTriggerHistory, getArtifact } from '../../service'
import { useScrollable, useAsync, useInterval, mapByKey, asyncWrap } from '../../../common'
import { URLS, ModuleNameMap } from '../../../../config'
import { NavLink, Switch, Route, Redirect } from 'react-router-dom'
import { useRouteMatch, useParams, useHistory, generatePath } from 'react-router'
import { BuildDetails, CIPipeline, HistoryLogsType, SecurityTabType } from './types'
import { ReactComponent as Down } from '../../../../assets/icons/ic-dropdown-filled.svg'
import { getLastExecutionByArtifactId } from '../../../../services/service'
import { ScanDisabledView, ImageNotScannedView, NoVulnerabilityView, CIRunningView } from './cIDetails.util'
import './ciDetails.scss'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../../../v2/devtronStackManager/DevtronStackManager.type'
import { getModuleConfigured } from '../appDetails/appDetails.service'
import Sidebar from '../cicdHistory/Sidebar'
import { Scroller, LogResizeButton, GitChanges, EmptyView } from '../cicdHistory/History.components'
import { TriggerDetails } from '../cicdHistory/TriggerDetails'
import Artifacts from '../cicdHistory/Artifacts'
import { CICDSidebarFilterOptionType, History, HistoryComponentType } from '../cicdHistory/types'
import LogsRenderer from '../cicdHistory/LogsRenderer'

const terminalStatus = new Set(['succeeded', 'failed', 'error', 'cancelled', 'nottriggered', 'notbuilt'])
let statusSet = new Set(['starting', 'running', 'pending'])

export default function CIDetails({ isJobView }: { isJobView?: boolean }) {
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
    const [initDataLoading, initDataResults] = useAsync(
        () =>
            Promise.allSettled([
                getCIPipelines(+appId),
                getModuleInfo(ModuleNameMap.SECURITY),
                getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
            ]),
        [appId],
    )
    const [loading, triggerHistoryResult, , , , dependencyState] = useAsync(
        () => getTriggerHistory(+pipelineId, pagination),
        [pipelineId, pagination],
        !!pipelineId,
    )
    const { path } = useRouteMatch()
    const { replace } = useHistory()
    useInterval(pollHistory, 30000)

    useEffect(() => {
        if (!triggerHistoryResult) {
            return
        }
        if (triggerHistoryResult.result?.length !== pagination.size) {
            setHasMore(false)
        } else {
            setHasMore(true)
            setHasMoreLoading(true)
        }
        const newTriggerHistory = (triggerHistoryResult.result || []).reduce((agg, curr) => {
            agg.set(curr.id, curr)
            return agg
        }, triggerHistory)
        setTriggerHistory(new Map(newTriggerHistory))
    }, [triggerHistoryResult])

    useEffect(() => {
        return () => {
            setTriggerHistory(new Map())
            setHasMoreLoading(false)
        }
    }, [pipelineId])

    function synchroniseState(triggerId: number, triggerDetails: History) {
        if (triggerId === triggerDetails.id) {
            setTriggerHistory((triggerHistory) => {
                triggerHistory.set(triggerId, triggerDetails)
                return new Map(triggerHistory)
            })
        }
    }

    async function pollHistory() {
        if (!pipelineId) return
        const [error, result] = await asyncWrap(
            getTriggerHistory(+pipelineId, { offset: 0, size: pagination.offset + pagination.size }),
        )
        if (error) {
            showError(error)
            return
        }
        setTriggerHistory(mapByKey(result?.result || [], 'id'))
    }

    if ((!hasMoreLoading && loading) || initDataLoading || (pipelineId && dependencyState[0] !== pipelineId)) {
        return <Progressing pageLoader />
    } else if (!buildId && triggerHistory.size > 0) {
        replace(generatePath(path, { buildId: triggerHistory.entries().next().value[0], appId, pipelineId }))
    }
    const pipelines: CIPipeline[] = (initDataResults[0]?.['value']?.['result'] || [])?.filter(
        (pipeline) => pipeline.pipelineType !== 'EXTERNAL',
    ) // external pipelines not visible in dropdown
    if (pipelines.length === 1 && !pipelineId) {
        replace(generatePath(path, { appId, pipelineId: pipelines[0].id }))
    }
    const pipelineOptions: CICDSidebarFilterOptionType[] = (pipelines || []).map((item) => {
        return { value: `${item.id}`, label: item.name, pipelineId: item.id }
    })
    const pipelinesMap = mapByKey(pipelines, 'id')
    const pipeline = pipelinesMap.get(+pipelineId)
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
                        />
                    </div>
                )}
                <div className="ci-details__body">
                    {!pipelineId ? (
                        <EmptyView
                            title="No pipeline selected"
                            subTitle={`Please select a pipeline ${
                                isJobView ? 'to see execution details' : 'to start seeing CI builds'
                            }.`}
                        />
                    ) : (
                        pipeline && (
                            <>
                                {triggerHistory.size > 0 ? (
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
                                        />
                                    </Route>
                                ) : pipeline.parentCiPipeline || pipeline.pipelineType === 'LINKED' ? (
                                    <EmptyView
                                        title="This is a Linked CI Pipeline"
                                        subTitle="This is a Linked CI Pipeline"
                                        link={`${URLS.APP}/${pipeline.parentAppId}/${URLS.APP_CI_DETAILS}/${pipeline.parentCiPipeline}/logs`}
                                        linkText="View Source Pipeline"
                                    />
                                ) : (
                                    !loading && (
                                        <EmptyView
                                            title={`${isJobView ? 'Job' : 'Build'} pipeline not triggered`}
                                            subTitle="Pipeline trigger history, details and logs will be available here."
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
    appIdFromParent,
}: BuildDetails) => {
    const { pipelineId, appId, buildId } = useParams<{ appId: string; buildId: string; pipelineId: string }>()
    const triggerDetails = triggerHistory.get(+buildId)
    const [
        triggerDetailsLoading,
        triggerDetailsResult,
        triggerDetailsError,
        reloadTriggerDetails,
        setTriggerDetails,
        dependency,
    ] = useAsync(
        () => getCIHistoricalStatus({ appId: appId ?? appIdFromParent, pipelineId, buildId }),
        [pipelineId, buildId, appId ?? appIdFromParent],
        !!buildId && !terminalStatus.has(triggerDetails?.status?.toLowerCase()),
    )
    useEffect(() => {
        if (triggerDetailsLoading || triggerDetailsError) return
        if (triggerDetailsResult?.result) synchroniseState(+buildId, triggerDetailsResult?.result)
    }, [triggerDetailsLoading, triggerDetailsResult, triggerDetailsError])

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

    if ((triggerDetailsLoading && !triggerDetails) || !buildId) return <Progressing pageLoader />
    if (!triggerDetailsLoading && !triggerDetails) return <Reload />
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
                            {!isJobView && isSecurityModuleInstalled && (
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
                appIdFromParent={appIdFromParent}
            />
        </>
    )
}

const HistoryLogs = ({ triggerDetails, isBlobStorageConfigured, isJobView, appIdFromParent }: HistoryLogsType) => {
    let { path } = useRouteMatch()
    const { pipelineId, buildId } = useParams<{ buildId: string; pipelineId: string }>()
    const [ref, scrollToTop, scrollToBottom] = useScrollable({
        autoBottomScroll: triggerDetails.status.toLowerCase() !== 'succeeded',
    })
    const _getArtifactPromise = () => getArtifact(pipelineId, buildId)

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
                    <Artifacts
                        status={triggerDetails.status}
                        artifact={triggerDetails.artifact}
                        blobStorageEnabled={triggerDetails.blobStorageEnabled}
                        getArtifactPromise={_getArtifactPromise}
                        isArtifactUploaded={triggerDetails.isArtifactUploaded}
                        isJobView={isJobView}
                        type={HistoryComponentType.CI}
                    />
                </Route>
                {!isJobView && (
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
        return <EmptyView title="No artifacts generated" subTitle="Errr..!! We couldn’t build your code." />
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
        return <NoVulnerabilityView />
    }

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
                    <div className="security-scan__type">post build execution</div>
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
