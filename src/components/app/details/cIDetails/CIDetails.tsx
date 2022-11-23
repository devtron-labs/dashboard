import React, { useState, useEffect, useMemo } from 'react'
import { getCIPipelines, cancelCiTrigger, getCIHistoricalStatus, getTriggerHistory, getArtifact } from '../../service'
import {
    Progressing,
    useScrollable,
    showError,
    useAsync,
    useInterval,
    createGitCommitUrl,
    mapByKey,
    copyToClipboard,
    asyncWrap,
    ConfirmationDialog,
} from '../../../common'
import { URLS, ModuleNameMap, TERMINAL_STATUS_MAP } from '../../../../config'
import { toast } from 'react-toastify'
import { NavLink, Switch, Route, Redirect, Link } from 'react-router-dom'
import { useRouteMatch, useParams, useLocation, useHistory, generatePath } from 'react-router'
import { CIPipeline, History, GitTriggers, CiMaterial } from './types'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import { ReactComponent as CopyIcon } from '../../../../assets/icons/ic-copy.svg'
import { ReactComponent as Download } from '../../../../assets/icons/ic-download.svg'
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg'
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
import Tippy from '@tippyjs/react'
import './ciDetails.scss'
import GitCommitInfoGeneric from '../../../common/GitCommitInfoGeneric'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../../../v2/devtronStackManager/DevtronStackManager.type'
import { getModuleConfigured } from '../appDetails/appDetails.service'
import { OptionType } from '../../types'
import { STAGE_TYPE } from '../triggerView/types'
import Sidebar from '../cicdHistory/Sidebar'
import { LogsRenderer, Scroller, LogResizeButton } from '../cicdHistory/History.components'
import { PROGRESSING_STATUS, TERMINAL_STATUS_COLOR_CLASS_MAP } from '../cicdHistory/types'

const terminalStatus = new Set(['succeeded', 'failed', 'error', 'cancelled', 'nottriggered', 'notbuilt'])
let statusSet = new Set(['starting', 'running', 'pending'])

export default function CIDetails() {
    const { appId, pipelineId } = useParams<{ appId: string; pipelineId: string }>()
    const [pagination, setPagination] = useState<{ offset: number; size: number }>({ offset: 0, size: 20 })
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [triggerHistory, setTriggerHistory] = useState<Map<number, History>>(new Map())
    const [fullScreenView, setFullScreenView] = useState<boolean>(false)
    const [hasMoreLoading, setHasMoreLoading] = useState<boolean>(false)
    const [pipelinesLoading, result, pipelinesError] = useAsync(() => getCIPipelines(+appId), [appId])
    const [, securityModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.SECURITY), [appId])
    const [, blobStorageConfiguration] = useAsync(() => getModuleConfigured(ModuleNameMap.BLOB_STORAGE), [appId])
    const [loading, triggerHistoryResult, triggerHistoryError, reloadTriggerHistory, , dependencyState] = useAsync(
        () => getTriggerHistory(+pipelineId, pagination),
        [pipelineId, pagination],
        !!pipelineId,
    )
    const { path } = useRouteMatch()
    const { pathname } = useLocation()
    useInterval(pollHistory, 30000)

    useEffect(() => {
        if (loading || !triggerHistoryResult) {
            setTriggerHistory(new Map())
        }
        if (triggerHistoryResult?.result?.length !== pagination.size) {
            setHasMore(false)
        } else {
            setHasMore(true)
            setHasMoreLoading(true)
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

    function synchroniseState(triggerId: number, triggerDetails: History) {
        setTriggerHistory((triggerHistory) => {
            triggerHistory.set(triggerId, triggerDetails)
            console.log(triggerHistory)
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

    if ((!hasMoreLoading && loading) || pipelinesLoading) return <Progressing pageLoader />
    const pipelines: CIPipeline[] = (result?.result || [])?.filter((pipeline) => pipeline.pipelineType !== 'EXTERNAL') // external pipelines not visible in dropdown
    const pipelineOptions: OptionType[] = (pipelines || []).map((item) => {
        return { value: `${item.id}`, label: item.name }
    })
    const pipelinesMap = mapByKey(pipelines, 'id')
    const pipeline = pipelinesMap.get(+pipelineId)
    return (
        <>
            <div className={`ci-details ${fullScreenView ? 'ci-details--full-screen' : ''}`}>
                <div className="ci-details__history">
                    {!fullScreenView && (
                        <Sidebar
                            filterOptions={pipelineOptions}
                            parentType={STAGE_TYPE.CI}
                            hasMore={hasMore}
                            triggerHistory={triggerHistory}
                            setPagination={setPagination}
                        />
                    )}
                </div>
                <div className="ci-details__body">
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
                                isSecurityModuleInstalled={
                                    securityModuleStatus?.result?.status === ModuleStatus.INSTALLED || false
                                }
                                isBlobStorageConfigured={blobStorageConfiguration?.result?.enabled || false}
                            />
                        </Route>
                    )}
                    {pipelineId && dependencyState[0] !== pipelineId && <Progressing pageLoader />}
                    {<LogResizeButton fullScreenView={fullScreenView} setFullScreenView={setFullScreenView} />}
                </div>
            </div>
        </>
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
    isSecurityModuleInstalled: boolean
    isBlobStorageConfigured: boolean
}
const BuildDetails: React.FC<BuildDetails> = ({
    triggerHistory,
    pipeline,
    fullScreenView,
    setFullScreenView,
    synchroniseState,
    isSecurityModuleInstalled,
    isBlobStorageConfigured,
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
            isSecurityModuleInstalled={isSecurityModuleInstalled}
            isBlobStorageConfigured={isBlobStorageConfigured}
        />
    )
}

const Details: React.FC<BuildDetails> = ({
    pipeline,
    fullScreenView,
    setFullScreenView,
    synchroniseState,
    triggerHistory,
    isSecurityModuleInstalled,
    isBlobStorageConfigured,
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
        !pipeline?.parentCiPipeline && !terminalStatus.has(triggerDetails?.status?.toLowerCase()),
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
                        <ul className="ml-20 tab-list dc__border-bottom mr-20">
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
                            {isSecurityModuleInstalled && (
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
                            )}
                        </ul>
                    </>
                )}
            </div>
            <HistoryLogs
                key={triggerDetails.id}
                pipeline={pipeline}
                triggerDetails={triggerDetails}
                isBlobStorageConfigured={isBlobStorageConfigured}
            />
        </>
    )
}

export const TriggerDetails = React.memo(
    ({ triggerDetails, abort, type }: { triggerDetails: History; abort?: () => Promise<any>; type: 'CI' | 'CD' }) => {
        const { url, path } = useRouteMatch()
        const { pathname } = useLocation()
        return (
            <div
                className="trigger-details"
                style={{ height: '137px', display: 'grid', gridTemplateColumns: '60px 1fr' }}
            >
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
                            <div className="dc__bullet mr-6 ml-6"></div>
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
                                                    className="dc__app-commit__hash mr-12 bcn-1 cn-7"
                                                >
                                                    {gitDetail?.Commit?.substr(0, 8)}
                                                </a>
                                            )}
                                            {ciMaterial.type == 'WEBHOOK' &&
                                                gitDetail.WebhookData &&
                                                gitDetail.WebhookData.Data && (
                                                    <span className="dc__app-commit__hash">
                                                        {gitDetail.WebhookData.EventActionType == 'merged'
                                                            ? gitDetail.WebhookData.Data['target checkout']?.substr(
                                                                  0,
                                                                  8,
                                                              )
                                                            : gitDetail.WebhookData.Data['target checkout']}
                                                    </span>
                                                )}
                                        </>
                                    )
                                })}
                            {type === 'CD' && (
                                <div className="dc__app-commit__hash ">
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
                    <CurrentStatus triggerDetails={triggerDetails} type={type} abort={abort} />
                </div>
            </div>
        )
    },
)

const Finished = React.memo(
    ({ status, finishedOn, artifact }: { status: string; finishedOn: string; artifact: string }) => {
        return (
            <div className="flex column left">
                <div
                    className={`${status} fs-14 fw-6 ${
                        TERMINAL_STATUS_COLOR_CLASS_MAP[status.toLowerCase()] || 'cn-5'
                    }`}
                >
                    {status && status.toLowerCase() === 'cancelled' ? 'ABORTED' : status}
                </div>
                <div className="flex left">
                    {finishedOn && finishedOn !== '0001-01-01T00:00:00Z' && (
                        <time className="cn-7 fs-12 mr-12">
                            {moment(finishedOn, 'YYYY-MM-DDTHH:mm:ssZ').format(Moment12HourFormat)}
                        </time>
                    )}
                    {artifact && (
                        <div className="dc__app-commit__hash ">
                            <img src={docker} className="commit-hash__icon grayscale" />
                            {artifact.split(':')[1]}
                        </div>
                    )}
                </div>
            </div>
        )
    },
)

const WorkerStatus = React.memo(
    ({ message, podStatus, stage }: { message: string; podStatus: string; stage: 'POST' | 'DEPLOY' | 'PRE' }) => {
        if (!message && !podStatus) return null
        return (
            <>
                <span style={{ height: '80%', borderRight: '1px solid var(--N100)', margin: '0 16px' }} />
                <div className="flex left column">
                    <div className="flex left fs-14">
                        <div className="mr-10">{stage === 'DEPLOY' ? 'Message' : 'Worker'}</div>
                        {podStatus && (
                            <div className="fw-6" style={{ color: colorMap[podStatus.toLowerCase()] }}>
                                {podStatus}
                            </div>
                        )}
                    </div>
                    {message && <div className="fs-12 cn-7">{message || ''}</div>}
                </div>
            </>
        )
    },
)

const ProgressingStatus: React.FC<{
    status: string
    message: string
    podStatus: string
    stage: 'POST' | 'DEPLOY' | 'PRE'
    abort?: () => Promise<any>
    type: 'CI' | 'CD'
}> = ({ status, message, podStatus, stage, abort, type }) => {
    const [aborting, setAborting] = useState(false)
    const [abortConfirmation, setAbortConfiguration] = useState(false)

    async function abortRunning(e) {
        setAborting(true)
        const [error, result] = await asyncWrap(abort())
        setAborting(false)
        if (error) {
            showError(error)
        } else {
            toast.success('Build Aborted')
            setAbortConfiguration(false)
        }
    }
    return (
        <>
            <div className="trigger-details__current flex left">
                <div style={{ color: '#ff7e5b' }} className={`${status} fs-14 fw-6 flex left`}>
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
                <WorkerStatus message={message} podStatus={podStatus} stage={stage} />
            </div>
            {abortConfirmation && (
                <ConfirmationDialog>
                    <ConfirmationDialog.Icon src={warn} />
                    <ConfirmationDialog.Body
                        title={type === 'CD' ? `Abort ${stage.toLowerCase()}-deployment?` : 'Abort build?'}
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

const CurrentStatus = React.memo(
    ({ triggerDetails, type, abort }: { triggerDetails: History; type: 'CI' | 'CD'; abort?: () => Promise<any> }) => {
        if (PROGRESSING_STATUS[triggerDetails.status.toLowerCase()]) {
            return (
                <ProgressingStatus
                    status={triggerDetails.status}
                    message={triggerDetails.message}
                    podStatus={triggerDetails.podStatus}
                    stage={triggerDetails.stage}
                    abort={abort}
                    type={type}
                />
            )
        } else {
            return (
                <div className="trigger-details__current flex left">
                    <Finished
                        status={triggerDetails.status}
                        finishedOn={triggerDetails.finishedOn}
                        artifact={type === 'CI' ? triggerDetails.artifact : null}
                    />
                    <WorkerStatus
                        message={triggerDetails.message}
                        podStatus={triggerDetails.podStatus}
                        stage={triggerDetails.stage}
                    />
                </div>
            )
        }
    },
)

const HistoryLogs = React.memo(
    ({
        pipeline,
        triggerDetails,
        isBlobStorageConfigured,
    }: {
        pipeline: CIPipeline
        triggerDetails: History
        isBlobStorageConfigured?: boolean
    }) => {
        let { path } = useRouteMatch()
        const { pipelineId, buildId } = useParams<{ buildId: string; pipelineId: string }>()
        const [ref, scrollToTop, scrollToBottom] = useScrollable({
            autoBottomScroll: triggerDetails.status.toLowerCase() !== 'succeeded',
        })

        return (
            <div className="trigger-outputs-container">
                {pipeline?.pipelineType === 'LINKED' ? (
                    <LinkedCIPipelineView pipeline={pipeline} />
                ) : (
                    <Switch>
                        <Route path={`${path}/logs`}>
                            <div ref={ref} style={{ height: '100%', overflow: 'auto', background: '#0b0f22' }}>
                                <LogsRenderer
                                    triggerDetails={triggerDetails}
                                    isBlobStorageConfigured={isBlobStorageConfigured}
                                    parentType={STAGE_TYPE.CI}
                                />
                            </div>
                            {(scrollToTop || scrollToBottom) && (
                                <Scroller
                                    style={{ position: 'fixed', bottom: '25px', right: '32px' }}
                                    {...{ scrollToTop, scrollToBottom }}
                                />
                            )}
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
        )
    },
)

export const GitChanges = React.memo(({ triggerDetails }: { triggerDetails: History }) => {
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
})

const LinkedCIPipelineView = React.memo(({ pipeline }: { pipeline: CIPipeline }) => {
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
})

const SelectPipelineView = React.memo((): JSX.Element => {
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
})

const NoTriggersView = React.memo((): JSX.Element => {
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
})

const CIProgressView = React.memo((): JSX.Element => {
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
})

const NoArtifactsView = React.memo((): JSX.Element => {
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
})

export const Artifacts = React.memo(
    ({ triggerDetails, getArtifactPromise }: { triggerDetails: History; getArtifactPromise?: () => Promise<any> }) => {
        const { buildId, triggerId } = useParams<{ buildId: string; triggerId: string }>()
        async function handleArtifact(e) {
            try {
                const response = await getArtifactPromise()
                const b = await (response as any).blob()
                let a = document.createElement('a')
                let url = URL.createObjectURL(b)
                a.href = url
                a.download = `${buildId || triggerId}.zip`
                a.click()
            } catch (err) {
                showError(err)
            }
        }
        if (triggerDetails.status.toLowerCase() === 'running') return <CIProgressView />
        if (['failed', 'cancelled'].includes(triggerDetails.status.toLowerCase())) return <NoArtifactsView />
        return (
            <div style={{ padding: '16px' }} className="flex left column">
                <CIListItem type="artifact">
                    <div className="flex column left">
                        <div className="cn-9 fs-14 flex left dc__visible-hover dc__visible-hover--parent">
                            {triggerDetails.artifact.split(':')[1]}
                            <Tippy content={'Copy to clipboard'}>
                                <CopyIcon
                                    className="pointer dc__visible-hover--child ml-6 icon-dim-16"
                                    onClick={() =>
                                        copyToClipboard(triggerDetails.artifact.split(':')[1], () =>
                                            toast.info('copied to clipboard'),
                                        )
                                    }
                                />
                            </Tippy>
                        </div>
                        <div className="cn-7 fs-12 flex left dc__visible-hover dc__visible-hover--parent">
                            {triggerDetails.artifact}
                            <Tippy content={'Copy to clipboard'}>
                                <CopyIcon
                                    className="pointer dc__visible-hover--child ml-6 icon-dim-16"
                                    onClick={() =>
                                        copyToClipboard(triggerDetails.artifact, () =>
                                            toast.info('copied to clipboard'),
                                        )
                                    }
                                />
                            </Tippy>
                        </div>
                    </div>
                </CIListItem>
                {triggerDetails.blobStorageEnabled && getArtifactPromise && (
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
    },
)

const MaterialHistory = React.memo(
    ({ gitTrigger, ciMaterial }: { gitTrigger: GitTriggers; ciMaterial: CiMaterial }) => {
        return (
            gitTrigger &&
            (gitTrigger.Commit || gitTrigger.WebhookData?.Data) && (
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
        )
    },
)

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
    const { push } = useHistory()
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

    const redirectToCreate = () => {
        const ciPipelineId = props?.triggerHistory?.ciPipelineId
        if (!ciPipelineId) return
        push(
            `${URLS.APP}/${appId}/${URLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}/${ciPipelineId}/${URLS.APP_CI_CONFIG}/${ciPipelineId}/build`,
        )
    }

    const severityCount = securityData.severityCount
    const total = severityCount.critical + severityCount.moderate + severityCount.low

    if (['failed', 'cancelled'].includes(props.triggerHistory.status.toLowerCase())) return <NoArtifactsView />
    if (['starting', 'running'].includes(props.triggerHistory.status.toLowerCase()))
        return <CIRunningView isSecurityTab={true} />
    if (securityData.isLoading) return <Progressing pageLoader />
    if (securityData.isError) return <Reload />
    if (props.triggerHistory.artifactId && !securityData.scanned) {
        if (!securityData.scanEnabled) return <ScanDisabledView redirectToCreate={redirectToCreate} />
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
