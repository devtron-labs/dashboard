import React, { useState, useRef, useEffect, useMemo } from 'react'
import { getCIPipelines, cancelCiTrigger, getCIHistoricalStatus, getTriggerHistory, getArtifact } from '../../service'
import {
    Progressing,
    useScrollable,
    showError,
    Select,
    useAsync,
    useInterval,
    createGitCommitUrl,
    mapByKey,
    useIntersection,
    copyToClipboard,
    asyncWrap,
    ConfirmationDialog,
    useKeyDown,
    not,
    ConditionalWrap,
} from '../../../common'
import { Host, Routes, URLS, SourceTypeMap } from '../../../../config'
import { toast } from 'react-toastify'
import { NavLink, Switch, Route, Redirect, Link } from 'react-router-dom'
import { useRouteMatch, useParams, useLocation, useHistory, generatePath } from 'react-router'
import { default as AnsiUp } from 'ansi_up'
import { CIPipeline, History, GitTriggers, CiMaterial } from './types'
import { ReactComponent as DropDownIcon } from '../../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import { ReactComponent as CopyIcon } from '../../../../assets/icons/ic-copy.svg'
import { ReactComponent as Download } from '../../../../assets/icons/ic-download.svg'
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg'
import { ReactComponent as ZoomIn } from '../../../../assets/icons/ic-fullscreen.svg'
import { ReactComponent as ZoomOut } from '../../../../assets/icons/ic-exit-fullscreen.svg'
import { ReactComponent as Down } from '../../../../assets/icons/ic-dropdown-filled.svg'
import { statusColor as colorMap } from '../../config'
import { getLastExecutionByArtifactId } from '../../../../services/service'
import { ScanDisabledView, ImageNotScannedView, NoVulnerabilityView, CIRunningView } from './cIDetails.util'
import { Moment12HourFormat } from '../../../../config'
import EmptyState from '../../../EmptyState/EmptyState'
import AppNotDeployed from '../../../../assets/img/app-not-deployed.png'
import Reload from '../../../Reload/Reload'
import moment from 'moment'
import docker from '../../../../assets/icons/misc/docker.svg'
import folder from '../../../../assets/icons/ic-folder.svg'
import warn from '../../../../assets/icons/ic-warning.svg'
import TippyHeadless from '@tippyjs/react/headless'
import Tippy from '@tippyjs/react'
import ReactGA from 'react-ga'
import './ciDetails.scss'
import { CiPipelineSourceConfig } from '../../../ciPipeline/CiPipelineSourceConfig'
import GitCommitInfoGeneric from '../../../common/GitCommitInfoGeneric'

const terminalStatus = new Set(['succeeded', 'failed', 'error', 'cancelled', 'nottriggered', 'notbuilt'])
let statusSet = new Set(['starting', 'running', 'pending'])

function useCIEventSource(url: string, maxLength?: number) {
    const [data, setData] = useState([])
    const [interval, setInterval] = useState(1000)
    const buffer = useRef([])
    const eventSourceRef = useRef(null)
    useInterval(populateData, interval)

    function populateData() {
        setData((data) => [...data, ...buffer.current])
        buffer.current = []
    }
    function closeEventSource() {
        if (eventSourceRef.current && eventSourceRef.current.close) eventSourceRef.current.close()
    }

    function handleMessage(event) {
        if (event.type === 'message') {
            buffer.current.push(event.data)
        }
    }

    function handleStreamStart() {
        buffer.current = []
        setData([])
    }

    function handleStreamEnd() {
        setData((data) => [...data, ...buffer.current])
        buffer.current = []
        eventSourceRef.current.close()
        setInterval(null)
    }

    useEffect(() => {
        buffer.current = []
        eventSourceRef.current = new EventSource(url, { withCredentials: true })
        eventSourceRef.current.addEventListener('message', handleMessage)
        eventSourceRef.current.addEventListener('START_OF_STREAM', handleStreamStart)
        eventSourceRef.current.addEventListener('END_OF_STREAM', handleStreamEnd)
        return closeEventSource
    }, [url, maxLength])

    return [data, eventSourceRef.current]
}

interface Pipelines {
    pipelines: CIPipeline[]
}

interface TriggerDetails {
    triggerDetails: any
}

export default function CIDetails() {
    const { appId, pipelineId } = useParams<{ appId: string; pipelineId: string }>()
    const [pagination, setPagination] = useState<{ offset: number; size: number }>({ offset: 0, size: 20 })
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [triggerHistory, setTriggerHistory] = useState<Map<number, History>>(new Map())
    const [fullScreenView, setFullScreenView] = useState<boolean>(false)
    const [pipelinesLoading, result, pipelinesError] = useAsync(() => getCIPipelines(+appId), [appId])
    const [loading, triggerHistoryResult, triggerHistoryError, reloadTriggerHistory, , dependencyState] = useAsync(
        () => getTriggerHistory(+pipelineId, pagination),
        [pipelineId, pagination],
        !!pipelineId,
    )
    const { path } = useRouteMatch()
    const { pathname } = useLocation()
    useInterval(pollHistory, 30000)
    const [ref, scrollToTop, scrollToBottom] = useScrollable({ autoBottomScroll: true })

    useEffect(() => {
        if (loading || !triggerHistoryResult) {
            setTriggerHistory(new Map())
        }
        if (triggerHistoryResult?.result?.length !== pagination.size) {
            setHasMore(false)
        } else {
            setHasMore(true)
        }
        const newTriggerHistory = (triggerHistoryResult?.result || []).reduce((agg, curr) => {
            agg.set(curr.id, curr)
            return agg
        }, triggerHistory)
        setTriggerHistory(new Map(newTriggerHistory))
    }, [triggerHistoryResult, loading])

    useEffect(() => {
        setTriggerHistory(new Map())
    }, [pipelineId])

    function reloadNextAfterBottom(e) {
        ReactGA.event({
            category: 'pagination',
            action: 'scroll',
            label: 'ci-history',
            value: triggerHistory.size,
        })
        setPagination((pagination) => ({ offset: triggerHistory.size, size: 20 }))
    }

    function synchroniseState(triggerId: number, triggerDetails: History) {
        setTriggerHistory((triggerHistory) => {
            triggerHistory.set(triggerId, triggerDetails)
            return new Map(triggerHistory)
        })
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

    if (loading || pipelinesLoading) return <Progressing pageLoader />
    const pipelines: CIPipeline[] = (result?.result || [])?.filter((pipeline) => pipeline.pipelineType !== 'EXTERNAL') // external pipelines not visible in dropdown
    const pipelinesMap = mapByKey(pipelines, 'id')
    const pipeline = pipelinesMap.get(+pipelineId)
    return (
        <>
            <div className={`ci-details ${fullScreenView ? 'ci-details--full-screen' : ''}`}>
                <div className="ci-details__history">
                    {!fullScreenView && (
                        <>
                            <SelectPipeline pipelines={pipelines} />
                            <div className="flex column top left" style={{ overflowY: 'auto' }}>
                                {Array.from(triggerHistory)
                                    .sort(([a], [b]) => b - a)
                                    .map(([triggerId, trigger]) => (
                                        <BuildCard key={trigger.id} triggerDetails={trigger} />
                                    ))}
                                {hasMore && <DetectBottom callback={reloadNextAfterBottom} />}
                            </div>
                        </>
                    )}
                </div>
                <div ref={ref} className="ci-details__body">
                    {!pipelineId && (
                        <>
                            <div />
                            <SelectPipelineView />
                        </>
                    )}
                    {!!pipeline && (
                        <>
                            <div />
                            {pipeline.parentCiPipeline ? (
                                <LinkedCIPipelineView pipeline={pipeline} />
                            ) : (
                                !loading && triggerHistory?.size === 0 && <NoTriggersView />
                            )}
                        </>
                    )}
                    {!!pipelineId && pipelineId === dependencyState[0] && triggerHistory?.size > 0 && (
                        <Route path={`${path.replace(':pipelineId(\\d+)?', ':pipelineId(\\d+)')}/:buildId(\\d+)?`}>
                            <BuildDetails
                                fullScreenView={fullScreenView}
                                triggerHistory={triggerHistory}
                                pipeline={pipeline}
                                setFullScreenView={setFullScreenView}
                                synchroniseState={synchroniseState}
                            />
                        </Route>
                    )}
                    {pipelineId && dependencyState[0] !== pipelineId && <Progressing pageLoader />}
                    {pathname.includes('/logs') && (
                        <Tippy
                            placement="top"
                            arrow={false}
                            className="default-tt"
                            content={fullScreenView ? 'Exit fullscreen (f)' : 'Enter fullscreen (f)'}
                        >
                            {fullScreenView ? (
                                <ZoomOut className="zoom zoom--out pointer" onClick={(e) => setFullScreenView(false)} />
                            ) : (
                                <ZoomIn className="zoom zoom--in pointer" onClick={(e) => setFullScreenView(true)} />
                            )}
                        </Tippy>
                    )}
                </div>
            </div>
            {(scrollToTop || scrollToBottom) && (
                <Scroller
                    style={{ position: 'fixed', bottom: '25px', right: '32px' }}
                    {...{ scrollToTop, scrollToBottom }}
                />
            )}
        </>
    )
}

export function DetectBottom({ callback }) {
    const target = useRef<HTMLSpanElement>(null)
    const intersected = useIntersection(target, {
        rootMargin: '0px',
        once: false,
    })

    useEffect(() => {
        if (intersected) {
            callback()
        }
    }, [intersected])

    return <span ref={target}></span>
}

export const BuildCard: React.FC<{ triggerDetails: History }> = React.memo(({ triggerDetails }) => {
    const { url, path } = useRouteMatch()
    return (
        <ConditionalWrap
            condition={Array.isArray(triggerDetails?.ciMaterials)}
            wrap={(children) => (
                <TippyHeadless
                    placement="right"
                    interactive
                    render={() => <BuildCardPopup triggerDetails={triggerDetails} />}
                >
                    {children}
                </TippyHeadless>
            )}
        >
            <NavLink
                to={`${url}/${triggerDetails.id}`}
                className="w-100 ci-details__build-card"
                activeClassName="active"
            >
                <div
                    className="w-100"
                    style={{
                        height: '64px',
                        display: 'grid',
                        gridTemplateColumns: '20px 1fr',
                        padding: '12px 0',
                        gridColumnGap: '12px',
                    }}
                >
                    <div
                        className={`app-summary__icon icon-dim-20 ${triggerDetails.status
                            ?.toLocaleLowerCase()
                            .replace(/\s+/g, '')}`}
                    ></div>
                    <div className="flex column left ellipsis-right">
                        <div className="cn-9 fs-14">{moment(triggerDetails.startedOn).format(Moment12HourFormat)}</div>
                        <div className="cn-7 fs-12">
                            {triggerDetails.triggeredBy === 1 ? 'auto trigger' : triggerDetails.triggeredByEmail}
                        </div>
                    </div>
                </div>
            </NavLink>
        </ConditionalWrap>
    )
})

export const BuildCardPopup: React.FC<{ triggerDetails: History }> = ({ triggerDetails }) => {
    return (
        <div className="build-card-popup p-16 br-4 flex column left" style={{ width: '400px', background: 'white' }}>
            <span className="fw-6 fs-16 mb-4" style={{ color: colorMap[triggerDetails.status.toLowerCase()] }}>
                {triggerDetails.status.toLowerCase() === 'cancelled' ? 'Aborted' : triggerDetails.status}
            </span>
            <div className="flex column left ">
                <div className="flex left fs-12 cn-7">
                    <div>{moment(triggerDetails.startedOn).format(Moment12HourFormat)}</div>
                    <div className="bullet ml-6 mr-6"></div>
                    <div>{triggerDetails.triggeredBy === 1 ? 'auto trigger' : triggerDetails.triggeredByEmail}</div>
                </div>
                {triggerDetails?.ciMaterials?.map((ciMaterial) => {
                    const gitDetail: GitTriggers = triggerDetails.gitTriggers[ciMaterial.id]
                    const sourceType = gitDetail?.CiConfigureSourceType
                        ? gitDetail?.CiConfigureSourceType
                        : ciMaterial?.type
                    const sourceValue = gitDetail?.CiConfigureSourceValue
                        ? gitDetail?.CiConfigureSourceValue
                        : ciMaterial?.value
                    const gitMaterialUrl = gitDetail?.GitRepoUrl ? gitDetail?.GitRepoUrl : ciMaterial?.url
                    return (
                        <div
                            className="mt-22"
                            key={ciMaterial.id}
                            style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gridColumnGap: '8px' }}
                        >
                            {sourceType != SourceTypeMap.WEBHOOK && (
                                <>
                                    <div className="git-logo"> </div>
                                    <div className="flex left column">
                                        <a
                                            href={createGitCommitUrl(gitMaterialUrl, gitDetail?.Commit)}
                                            target="_blank"
                                            rel="noopener noreferer"
                                            className="fs-12 fw-6 cn-9 pointer"
                                        >
                                            /{sourceValue}
                                        </a>
                                        <p className="fs-12 cn-7">{gitDetail?.Message}</p>
                                    </div>
                                </>
                            )}
                            {sourceType == SourceTypeMap.WEBHOOK && (
                                <div className="flex left column">
                                    <CiPipelineSourceConfig
                                        sourceType={sourceType}
                                        sourceValue={sourceValue}
                                        showTooltip={false}
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export const CIListItem: React.FC<{ type: 'report' | 'artifact'; children: any }> = ({ type, children }) => {
    return (
        <div className={`mb-16 ci-artifact ci-artifact--${type}`}>
            <div className="bcn-1 flex br-4">
                <img src={type === 'artifact' ? docker : folder} className="icon-dim-24" />
            </div>
            {children}
        </div>
    )
}

interface BuildDetails {
    triggerHistory: Map<number, History>
    pipeline: CIPipeline
    fullScreenView: boolean
    setFullScreenView: React.Dispatch<React.SetStateAction<boolean>>
    synchroniseState: (triggerId: number, triggerDetails: History) => void
}
const BuildDetails: React.FC<BuildDetails> = ({
    triggerHistory,
    pipeline,
    fullScreenView,
    setFullScreenView,
    synchroniseState,
}) => {
    const { buildId, appId, pipelineId, envId } = useParams<{
        appId: string
        envId: string
        buildId: string
        pipelineId: string
    }>()

    const history = useHistory()
    const { url, path } = useRouteMatch()
    useEffect(() => {
        if (buildId) return
        const lastestBuild = Array.from(triggerHistory)[0][1]
        history.replace(generatePath(path, { buildId: lastestBuild.id, appId, pipelineId, envId }))
    }, [buildId])

    if (!buildId) return null
    return (
        <Details
            pipeline={pipeline}
            fullScreenView={fullScreenView}
            setFullScreenView={setFullScreenView}
            synchroniseState={synchroniseState}
            triggerHistory={triggerHistory}
        />
    )
}

const Details: React.FC<BuildDetails> = ({
    pipeline,
    fullScreenView,
    setFullScreenView,
    synchroniseState,
    triggerHistory,
}) => {
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
        () => getCIHistoricalStatus({ appId, pipelineId, buildId }),
        [pipelineId, buildId, appId],
        !pipeline.parentCiPipeline && !terminalStatus.has(triggerDetails?.status?.toLowerCase()),
    )

    useEffect(() => {
        if (triggerDetailsLoading || triggerDetailsError) return
        if (triggerDetailsResult?.result) synchroniseState(+buildId, triggerDetailsResult?.result)
    }, [triggerDetailsLoading, triggerDetailsResult, triggerDetailsError])

    const timeout = useMemo(() => {
        if (!triggerDetails) return null // no interval
        if (
            statusSet.has(triggerDetails.status.toLowerCase()) ||
            (triggerDetails.podStatus && statusSet.has(triggerDetails.podStatus.toLowerCase()))
        ) {
            // 10s because progressing
            return 10000
        } else if (triggerDetails.podStatus && terminalStatus.has(triggerDetails.podStatus.toLowerCase())) {
            return null
        } else if (terminalStatus.has(triggerDetails.status.toLowerCase())) {
            return null
        }
        return 30000 // 30s for normal
    }, [triggerDetails])
    useInterval(reloadTriggerDetails, timeout)

    if (triggerDetailsLoading && !triggerDetails) return <Progressing pageLoader />
    if (!triggerDetailsLoading && !triggerDetails) return <Reload />
    if (triggerDetails.id !== +buildId) return null
    return (
        <>
            <div className="trigger-details-container">
                {!fullScreenView && (
                    <>
                        <TriggerDetails
                            triggerDetails={triggerDetails}
                            type="CI"
                            abort={() => cancelCiTrigger({ pipelineId, workflowId: buildId })}
                        />
                        <ul className="ml-20 tab-list tab-list--borderd mr-20">
                            <li className="tab-list__tab">
                                <NavLink replace className="tab-list__tab-link" activeClassName="active" to={`logs`}>
                                    Logs
                                </NavLink>
                            </li>
                            <li className="tab-list__tab">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link"
                                    activeClassName="active"
                                    to={`source-code`}
                                >
                                    Source code
                                </NavLink>
                            </li>
                            <li className="tab-list__tab">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link"
                                    activeClassName="active"
                                    to={`artifacts`}
                                >
                                    Artifacts
                                </NavLink>
                            </li>
                            <li className="tab-list__tab">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link"
                                    activeClassName="active"
                                    to={`security`}
                                >
                                    Security
                                </NavLink>
                            </li>
                        </ul>
                    </>
                )}
            </div>
            <HistoryLogs
                key={triggerDetails.id}
                pipeline={pipeline}
                triggerDetails={triggerDetails}
                setFullScreenView={setFullScreenView}
            />
        </>
    )
}

export const TriggerDetails: React.FC<{ triggerDetails: History; abort?: () => Promise<any>; type: 'CI' | 'CD' }> = ({
    triggerDetails,
    abort,
    type,
}) => {
    const { url, path } = useRouteMatch()
    const { pathname } = useLocation()
    return (
        <div className="trigger-details" style={{ height: '137px', display: 'grid', gridTemplateColumns: '60px 1fr' }}>
            <div className="trigger-details__status flex">
                <svg width="25" height="87" viewBox="0 0 25 87" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12.5" cy="6.5" r="6" fill="white" stroke="#3B444C" />
                    <circle
                        cx="12.5"
                        cy="74.5"
                        r="6"
                        fill={colorMap[triggerDetails?.status?.toLowerCase()]}
                        stroke={colorMap[triggerDetails?.status?.toLowerCase()]}
                        strokeWidth="12"
                        strokeOpacity="0.3"
                    />
                    <line x1="12.5" y1="11.9997" x2="12.5362" y2="69" stroke="#3B444C" />
                </svg>
            </div>
            <div className="trigger-details__summary" style={{ display: 'grid', gridTemplateRows: '1fr 1fr' }}>
                <div className="trigger-details__start flex column left">
                    <div className="cn-9 fs-14 fw-6">Start</div>
                    <div className="flex left">
                        <time className="cn-7 fs-12">
                            {moment(triggerDetails.startedOn, 'YYYY-MM-DDTHH:mm:ssZ').format(Moment12HourFormat)}
                        </time>
                        <div className="bullet mr-6 ml-6"></div>
                        <div className="trigger-details__trigger-by cn-7 fs-12 mr-12">
                            {triggerDetails.triggeredBy === 1 ? 'auto trigger' : triggerDetails.triggeredByEmail}
                        </div>
                        {type === 'CI' &&
                            Array.isArray(triggerDetails.ciMaterials) &&
                            triggerDetails.ciMaterials.map((ciMaterial) => {
                                const gitDetail: GitTriggers = triggerDetails.gitTriggers[ciMaterial.id]
                                return (
                                    <>
                                        {ciMaterial.type != 'WEBHOOK' && (
                                            <a
                                                target="_blank"
                                                rel="noopener noreferer"
                                                key={ciMaterial.id}
                                                href={createGitCommitUrl(ciMaterial?.url, gitDetail?.Commit)}
                                                className="app-commit__hash mr-12 bcn-1 cn-7"
                                            >
                                                {gitDetail?.Commit?.substr(0, 8)}
                                            </a>
                                        )}
                                        {ciMaterial.type == 'WEBHOOK' &&
                                            gitDetail.WebhookData &&
                                            gitDetail.WebhookData.Data && (
                                                <span className="app-commit__hash">
                                                    {gitDetail.WebhookData.EventActionType == 'merged'
                                                        ? gitDetail.WebhookData.Data['target checkout']?.substr(0, 8)
                                                        : gitDetail.WebhookData.Data['target checkout']}
                                                </span>
                                            )}
                                    </>
                                )
                            })}
                        {type === 'CD' && (
                            <div className="app-commit__hash ">
                                <img src={docker} className="commit-hash__icon grayscale" />
                                {triggerDetails.artifact.split(':')[1]}
                            </div>
                        )}
                        {!pathname.includes('source-code') && (
                            <Link to={`${url}/source-code`} className="anchor ml-8">
                                Commit details
                            </Link>
                        )}
                    </div>
                </div>
                {
                    {
                        succeeded: <Succeeded triggerDetails={triggerDetails} type={type} />,
                        healthy: <Succeeded triggerDetails={triggerDetails} type={type} />,
                        running: <ProgressingStatus triggerDetails={triggerDetails} abort={abort} type={type} />,
                        progressing: <ProgressingStatus triggerDetails={triggerDetails} abort={abort} type={type} />,
                        starting: <ProgressingStatus triggerDetails={triggerDetails} abort={abort} type={type} />,
                        failed: <Failed triggerDetails={triggerDetails} type={type} />,
                    }[triggerDetails.status.toLowerCase()]
                }
                {!['succeeded', 'healthy', 'running', 'progressing', 'starting', 'failed'].includes(
                    triggerDetails.status.toLowerCase(),
                ) && <Generic triggerDetails={triggerDetails} type={type} />}
            </div>
        </div>
    )
}

const Succeeded: React.FC<{ triggerDetails: History; type: 'CI' | 'CD' }> = ({ triggerDetails, type }) => {
    return (
        <div className="flex left">
            <div className="trigger-details__current flex column left">
                <Finished triggerDetails={triggerDetails} colorClass="cg-5" type={type} />
            </div>
            <WorkerStatus triggerDetails={triggerDetails} />
        </div>
    )
}

const Finished: React.FC<{ triggerDetails: History; colorClass: string; type: 'CI' | 'CD' }> = ({
    triggerDetails,
    colorClass,
    type,
}) => {
    return (
        <div className="flex column left">
            <div className={`${triggerDetails.status} fs-14 fw-6 ${colorClass}`}>{triggerDetails.status}</div>
            <div className="flex left">
                {triggerDetails.finishedOn && (
                    <time className="cn-7 fs-12 mr-12">
                        {moment(triggerDetails.finishedOn, 'YYYY-MM-DDTHH:mm:ssZ').format(Moment12HourFormat)}
                    </time>
                )}
                {type === 'CI' && triggerDetails.artifact && (
                    <div className="app-commit__hash ">
                        <img src={docker} className="commit-hash__icon grayscale" />
                        {triggerDetails.artifact.split(':')[1]}
                    </div>
                )}
            </div>
        </div>
    )
}

const WorkerStatus: React.FC<{ triggerDetails: History }> = ({ triggerDetails }) => {
    if (!triggerDetails.message && !triggerDetails.podStatus) return null
    return (
        <>
            <span style={{ height: '80%', borderRight: '1px solid var(--N100)', margin: '0 16px' }} />
            <div className="flex left column">
                <div className="flex left fs-14">
                    <div className="mr-10">{triggerDetails.stage === 'DEPLOY' ? 'Message' : 'Worker'}</div>
                    {triggerDetails.podStatus && (
                        <div className="fw-6" style={{ color: colorMap[triggerDetails.podStatus.toLowerCase()] }}>
                            {triggerDetails.podStatus}
                        </div>
                    )}
                </div>
                {triggerDetails.message && <div className="fs-12 cn-7">{triggerDetails?.message || ''}</div>}
            </div>
        </>
    )
}

const ProgressingStatus: React.FC<{ triggerDetails: History; abort?: () => Promise<any>; type: 'CI' | 'CD' }> = ({
    triggerDetails,
    abort,
    type,
}) => {
    const [aborting, setAborting] = useState(false)
    const [abortConfirmation, setAbortConfiguration] = useState(false)

    async function abortRunning(e) {
        setAborting(true)
        const [error, result] = await asyncWrap(abort())
        setAborting(false)
        if (error) {
            showError(error)
        } else {
            toast.success('Build cancelled.')
            setAbortConfiguration(false)
        }
    }
    return (
        <>
            <div className="trigger-details__current flex left">
                <div style={{ color: '#ff7e5b' }} className={`${triggerDetails.status} fs-14 fw-6 flex left`}>
                    In progress
                </div>
                {abort && (
                    <button
                        className="cta cancel ml-16"
                        style={{ minWidth: '72px' }}
                        onClick={(e) => setAbortConfiguration(true)}
                    >
                        Abort
                    </button>
                )}
                <WorkerStatus triggerDetails={triggerDetails} />
            </div>
            {abortConfirmation && (
                <ConfirmationDialog>
                    <ConfirmationDialog.Icon src={warn} />
                    <ConfirmationDialog.Body
                        title={
                            type === 'CD' ? `Abort ${triggerDetails.stage.toLowerCase()}-deployment?` : 'Abort build?'
                        }
                    />
                    <p className="fs-13 cn-7 lh-1-54">
                        {type === 'CD'
                            ? 'Are you sure you want to abort this stage?'
                            : 'Are you sure you want to abort this build?'}
                    </p>
                    <ConfirmationDialog.ButtonGroup>
                        <button type="button" className="cta cancel" onClick={(e) => setAbortConfiguration(false)}>
                            Cancel
                        </button>
                        <button type="button" className="cta delete" onClick={abortRunning}>
                            {aborting ? <Progressing /> : 'Yes, Abort'}
                        </button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            )}
        </>
    )
}

const Failed: React.FC<{ triggerDetails: History; type: 'CI' | 'CD' }> = ({ triggerDetails, type }) => {
    return (
        <div className="trigger-details__current flex left">
            <Finished triggerDetails={triggerDetails} colorClass="cr-5" type={type} />
            <WorkerStatus triggerDetails={triggerDetails} />
        </div>
    )
}

const Generic: React.FC<{ triggerDetails: History; type: 'CI' | 'CD' }> = ({ triggerDetails, type }) => {
    return (
        <div className="trigger-details__current flex left">
            <Finished triggerDetails={triggerDetails} colorClass="cn-5" type={type} />
            <WorkerStatus triggerDetails={triggerDetails} />
        </div>
    )
}

const HistoryLogs: React.FC<{
    pipeline: CIPipeline
    triggerDetails: History
    setFullScreenView: (...args) => void
}> = ({ pipeline, triggerDetails, setFullScreenView }) => {
    let { path } = useRouteMatch()
    const { pipelineId, buildId } = useParams<{ buildId: string; pipelineId: string }>()
    const [autoBottomScroll, setAutoBottomScroll] = useState<boolean>(
        triggerDetails.status.toLowerCase() !== 'succeeded',
    )
    const [ref, scrollToTop, scrollToBottom] = useScrollable({ autoBottomScroll })

    return (
        <>
            <div className="trigger-outputs-container">
                {pipeline.pipelineType === 'LINKED' ? (
                    <LinkedCIPipelineView pipeline={pipeline} />
                ) : (
                    <Switch>
                        <Route path={`${path}/logs`}>
                            <div ref={ref} style={{ height: '100%', overflow: 'auto', background: '#0b0f22' }}>
                                <LogsRenderer triggerDetails={triggerDetails} setFullScreenView={setFullScreenView} />
                            </div>
                        </Route>
                        <Route
                            path={`${path}/source-code`}
                            render={(props) => <GitChanges triggerDetails={triggerDetails} />}
                        />
                        <Route
                            path={`${path}/artifacts`}
                            render={(props) => (
                                <Artifacts
                                    triggerDetails={triggerDetails}
                                    getArtifactPromise={() => getArtifact(pipelineId, buildId)}
                                />
                            )}
                        />
                        <Route
                            path={`${path}/security`}
                            render={(props) => <SecurityTab triggerHistory={triggerDetails} />}
                        />
                        <Redirect
                            to={
                                triggerDetails.status.toLowerCase() === 'succeeded'
                                    ? `${path}/artifacts`
                                    : `${path}/logs`
                            }
                        />
                    </Switch>
                )}
            </div>
            {(scrollToTop || scrollToBottom) && (
                <Scroller
                    style={{ position: 'fixed', bottom: '25px', right: '32px' }}
                    {...{ scrollToTop, scrollToBottom }}
                />
            )}
        </>
    )
}

const SelectPipeline: React.FC<Pipelines> = ({ pipelines }) => {
    const { pipelineId, appId, envId } = useParams<{ appId: string; envId: string; pipelineId: string }>()
    const { push } = useHistory()
    const { url, path } = useRouteMatch()
    function handlePipelineChange(event: React.ChangeEvent<HTMLInputElement>) {
        let id = +event.target.value
        if (id && id > 0) {
            const newUrl = generatePath(path, { appId, pipelineId: id, envId })
            push(newUrl)
        }
    }
    const pipeline = pipelines?.find((ci) => ci.id === +pipelineId)
    return (
        <div className="select-pipeline-wrapper w-100 pl-16 pr-16" style={{ overflow: 'hidden' }}>
            <label className="form__label">Select Pipeline</label>
            <Select onChange={handlePipelineChange} value={+pipelineId}>
                <Select.Button rootClassName="select-button--default">
                    <div className="ellipsis-left w-100 flex right">{pipeline ? pipeline.name : 'Select Pipeline'}</div>
                </Select.Button>
                {pipelines.map((item, idx) => {
                    return (
                        <Select.Option key={idx} value={item.id}>
                            <span className="ellipsis-left">{item.name}</span>
                        </Select.Option>
                    )
                })}
            </Select>
        </div>
    )
}

export const GitChanges: React.FC<{ triggerDetails: History }> = ({ triggerDetails }) => {
    return (
        <div className="flex column left w-100 p-16">
            {Array.isArray(triggerDetails.ciMaterials) &&
                triggerDetails.ciMaterials.map((ciMaterial) => (
                    <MaterialHistory
                        ciMaterial={ciMaterial}
                        key={ciMaterial.id}
                        gitTrigger={triggerDetails.gitTriggers[ciMaterial.id]}
                    />
                ))}
        </div>
    )
}

const LinkedCIPipelineView: React.FC<{ pipeline: CIPipeline }> = ({ pipeline }) => {
    const { pipelineId } = useParams<{ pipelineId: string }>()
    let link = `${URLS.APP}/${pipeline.parentAppId}/${URLS.APP_CI_DETAILS}/${pipeline.parentCiPipeline}/logs`
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={AppNotDeployed} alt="" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>This is a Linked CI Pipeline</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>To view logs and build history visit the Source CI Pipeline.</EmptyState.Subtitle>
            <EmptyState.Button>
                <NavLink to={link} className="cta cta--ci-details" target="_blank">
                    <OpenInNew className="mr-5" />
                    View Source Pipeline
                </NavLink>
            </EmptyState.Button>
        </EmptyState>
    )
}

function SelectPipelineView() {
    const { pipelineId } = useParams<{ pipelineId: string }>()
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={AppNotDeployed} alt="" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>No pipeline selected</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>Please select a pipeline to start seeing CI builds.</EmptyState.Subtitle>
        </EmptyState>
    )
}

function NoTriggersView() {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={AppNotDeployed} alt="" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>Build pipeline not triggered</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                Pipeline trigger history, details and logs will be available here.
            </EmptyState.Subtitle>
        </EmptyState>
    )
}

function CIProgressView() {
    return (
        <EmptyState>
            <EmptyState.Image>
                <MechanicalOperation />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>Building artifacts</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                Generated artifact(s) will be available here after the pipeline is executed.
            </EmptyState.Subtitle>
        </EmptyState>
    )
}

function NoArtifactsView() {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={AppNotDeployed} alt="" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>No artifacts generated</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>Errr..!! We couldn’t build your code.</EmptyState.Subtitle>
        </EmptyState>
    )
}

export const LogsRenderer: React.FC<{ triggerDetails: History; setFullScreenView: (...args) => void }> = ({
    triggerDetails,
    setFullScreenView,
}) => {
    const keys = useKeyDown()

    useEffect(() => {
        switch (keys.join('')) {
            case 'f':
                setFullScreenView(not)
                break
            case 'Escape':
                setFullScreenView(false)
                break
        }
    }, [keys])
    const { pipelineId } = useParams<{ pipelineId: string }>()
    const [logs, eventSource] = useCIEventSource(
        `${Host}/${Routes.CI_CONFIG_GET}/${pipelineId}/workflow/${triggerDetails.id}/logs`,
    )
    function createMarkup(log) {
        try {
            log = log.replace(/\[[.]*m/, (m) => '\x1B[' + m + 'm')
            const ansi_up = new AnsiUp()
            return { __html: ansi_up.ansi_to_html(log) }
        } catch (err) {
            return { __html: log }
        }
    }
    return (
        <>
            <div className="logs__body">
                {logs.map((log, index) => {
                    return <p className="mono fs-14" key={index} dangerouslySetInnerHTML={createMarkup(log)} />
                })}
                {eventSource && eventSource.readyState <= 1 && (
                    <div className="flex left event-source-status">
                        <Progressing />
                    </div>
                )}
            </div>
        </>
    )
}

export function Scroller({ scrollToTop, scrollToBottom, style }) {
    return (
        <div
            style={{ ...style, display: 'flex', flexDirection: 'column', justifyContent: 'top' }}
            className="element-scroller"
        >
            <Tippy className="default-tt" arrow={false} content="Scroll to Top">
                <button className="flex" disabled={!scrollToTop} type="button" onClick={scrollToTop}>
                    <DropDownIcon className="rotate" style={{ ['--rotateBy' as any]: '180deg' }} />
                </button>
            </Tippy>
            <Tippy className="default-tt" arrow={false} content="Scroll to Bottom">
                <button className="flex" disabled={!scrollToBottom} type="button" onClick={scrollToBottom}>
                    <DropDownIcon className="rotate" />
                </button>
            </Tippy>
        </div>
    )
}

export const Artifacts: React.FC<{ triggerDetails: History; getArtifactPromise?: () => Promise<any> }> = ({
    triggerDetails,
    getArtifactPromise,
}) => {
    const { buildId, triggerId } = useParams<{ buildId: string; triggerId: string }>()
    const [downloading, setDownloading] = useState(false)
    async function handleArtifact(e) {
        try {
            setDownloading(true)
            const response = await getArtifactPromise()
            const b = await (response as any).blob()
            let a = document.createElement('a')
            let url = URL.createObjectURL(b)
            a.href = url
            a.download = `${buildId || triggerId}.zip`
            a.click()
        } catch (err) {
            showError(err)
        } finally {
            setDownloading(false)
        }
    }
    if (triggerDetails.status.toLowerCase() === 'running') return <CIProgressView />
    if (['failed', 'cancelled'].includes(triggerDetails.status.toLowerCase())) return <NoArtifactsView />
    return (
        <div style={{ padding: '16px' }} className="flex left column">
            <CIListItem type="artifact">
                <div className="flex column left">
                    <div className="cn-9 fs-14 flex left visible-hover visible-hover--parent">
                        {triggerDetails.artifact.split(':')[1]}
                        <Tippy content={'Copy to clipboard'}>
                            <CopyIcon
                                className="pointer visible-hover--child ml-6 icon-dim-16"
                                onClick={(e) =>
                                    copyToClipboard(triggerDetails.artifact.split(':')[1], () =>
                                        toast.info('copied to clipboard'),
                                    )
                                }
                            />
                        </Tippy>
                    </div>
                    <div className="cn-7 fs-12 flex left visible-hover visible-hover--parent">
                        {triggerDetails.artifact}
                        <Tippy content={'Copy to clipboard'}>
                            <CopyIcon
                                className="pointer visible-hover--child ml-6 icon-dim-16"
                                onClick={(e) =>
                                    copyToClipboard(triggerDetails.artifact, () => toast.info('copied to clipboard'))
                                }
                            />
                        </Tippy>
                    </div>
                </div>
            </CIListItem>
            {getArtifactPromise && (
                <CIListItem type="report">
                    <div className="flex column left">
                        <div className="cn-9 fs-14">Reports.zip</div>
                        <button
                            type="button"
                            onClick={handleArtifact}
                            className="anchor p-0 cb-5 fs-12 flex left pointer"
                        >
                            Download
                            <Download className="ml-5 icon-dim-16" />
                        </button>
                    </div>
                </CIListItem>
            )}
        </div>
    )
}

const MaterialHistory: React.FC<{ gitTrigger: GitTriggers; ciMaterial: CiMaterial }> = ({ gitTrigger, ciMaterial }) => {
    return (
        <div
            key={gitTrigger?.Commit}
            className="bcn-0 pt-12 br-4 en-2 bw-1 pb-12 mb-12"
            style={{ width: 'min( 100%, 800px )' }}
        >
            <GitCommitInfoGeneric
                materialUrl={gitTrigger?.GitRepoUrl ? gitTrigger?.GitRepoUrl : ciMaterial?.url}
                showMaterialInfo={true}
                commitInfo={gitTrigger}
                materialSourceType={
                    gitTrigger?.CiConfigureSourceType ? gitTrigger?.CiConfigureSourceType : ciMaterial?.type
                }
                selectedCommitInfo={''}
                materialSourceValue={
                    gitTrigger?.CiConfigureSourceValue ? gitTrigger?.CiConfigureSourceValue : ciMaterial?.value
                }
            />
        </div>
    )
}

const SecurityTab: React.FC<{ triggerHistory: History }> = (props) => {
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
        isLoading: !!props.triggerHistory.artifactId,
        isError: false,
    })
    const { appId } = useParams<{ appId: string }>()
    async function callGetSecurityIssues() {
        try {
            const { result } = await getLastExecutionByArtifactId(appId, props.triggerHistory.artifactId)
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
        if (props.triggerHistory.artifactId) {
            callGetSecurityIssues()
        }
    }, [props.triggerHistory.artifactId])

    const severityCount = securityData.severityCount
    const total = severityCount.critical + severityCount.moderate + severityCount.low

    if (['failed', 'cancelled'].includes(props.triggerHistory.status.toLowerCase())) return <NoArtifactsView />
    if (['starting', 'running'].includes(props.triggerHistory.status.toLowerCase()))
        return <CIRunningView isSecurityTab={true} />
    if (securityData.isLoading) return <Progressing pageLoader />
    if (securityData.isError) return <Reload />
    if (props.triggerHistory.artifactId && !securityData.scanned) {
        if (!securityData.scanEnabled) return <ScanDisabledView />
        return <ImageNotScannedView />
    }
    if (props.triggerHistory.artifactId && securityData.scanned && !securityData.vulnerabilities.length)
        return <NoVulnerabilityView />

    return (
        <>
            <div className="security__top">Latest Scan Execution</div>
            <div className="white-card white-card--ci-scan">
                <div className="security-scan__header" onClick={toggleCollapse}>
                    <Down
                        style={{ ['--rotateBy' as any]: isCollapsed ? '0deg' : '180deg' }}
                        className="icon-dim-24 rotate fcn-9 mr-12"
                    />
                    <div className="security-scan__last-scan ellipsis-right">{securityData.lastExecution}</div>
                    {total === 0 ? <span className="fill-pass">Passed</span> : null}
                    {severityCount.critical !== 0 ? (
                        <span className="fill-critical">{severityCount.critical} Critical</span>
                    ) : null}
                    {severityCount.critical === 0 && severityCount.moderate !== 0 ? (
                        <span className="fill-moderate">{severityCount.moderate} Moderate</span>
                    ) : null}
                    {severityCount.critical === 0 && severityCount.moderate === 0 && severityCount.low !== 0 ? (
                        <span className="fill-low">{severityCount.low} Low</span>
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
                                        <td className="security-scan-table__data security-scan-table__pl security-scan-table__cve cve-cell">
                                            <a
                                                href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${item.name}`}
                                                target="_blank"
                                            >
                                                {item.name}
                                            </a>
                                        </td>
                                        <td className="security-scan-table__data security-scan-table__pl">
                                            <span className={`fill-${item.severity}`}>{item.severity}</span>
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
