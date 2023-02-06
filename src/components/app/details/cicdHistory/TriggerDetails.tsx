import React, { useEffect, useState } from 'react'
import { Progressing, showError, createGitCommitUrl, asyncWrap, ConfirmationDialog, not, formatDurationDiff } from '../../../common'
import { toast } from 'react-toastify'
import { useRouteMatch, useLocation, useParams } from 'react-router'
import { statusColor as colorMap } from '../../config'
import { Moment12HourFormat, ZERO_TIME_STRING } from '../../../../config'
import moment from 'moment'
import docker from '../../../../assets/icons/misc/docker.svg'
import { ReactComponent as TimerIcon } from '../../../../assets/icons/ic-timer.svg'

import warn from '../../../../assets/icons/ic-warning.svg'
import '../cIDetails/ciDetails.scss'
import {
    CurrentStatusType,
    FinishedType,
    GitTriggers,
    HistoryComponentType,
    ProgressingStatusType,
    PROGRESSING_STATUS,
    StartDetailsType,
    TERMINAL_STATUS_COLOR_CLASS_MAP,
    TriggerDetailsStatusIconType,
    TriggerDetailsType,
    WorkerStatusType,
} from '../cicdHistory/types'
import { Link } from 'react-router-dom'
import { cancelCiTrigger, cancelPrePostCdTrigger } from '../../service'

const TriggerDetailsStatusIcon = React.memo(({ status }: TriggerDetailsStatusIconType): JSX.Element => {
    return (
        <svg width="25" height="87" viewBox="0 0 25 87" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12.5" cy="6.5" r="6" fill="white" stroke="#3B444C" />
            <circle
                cx="12.5"
                cy="74.5"
                r="6"
                fill={colorMap[status]}
                stroke={colorMap[status]}
                strokeWidth="12"
                strokeOpacity="0.3"
            />
            <line x1="12.5" y1="11.9997" x2="12.5362" y2="69" stroke="#3B444C" />
        </svg>
    )
})

export const TriggerDetails = React.memo(
    ({
        status,
        startedOn,
        finishedOn,
        triggeredBy,
        triggeredByEmail,
        ciMaterials,
        gitTriggers,
        message,
        podStatus,
        type,
        stage,
        artifact,
    }: TriggerDetailsType): JSX.Element => {
        return (
            <div className="trigger-details">
                <div className="flex">
                    <TriggerDetailsStatusIcon status={status?.toLowerCase()} />
                </div>
                <div className="trigger-details__summary">
                    <StartDetails
                        startedOn={startedOn}
                        triggeredBy={triggeredBy}
                        triggeredByEmail={triggeredByEmail}
                        ciMaterials={ciMaterials}
                        gitTriggers={gitTriggers}
                        artifact={artifact}
                        type={type}
                    />
                    <CurrentStatus
                        status={status}
                        startedOn={startedOn}
                        finishedOn={finishedOn}
                        artifact={artifact}
                        message={message}
                        podStatus={podStatus}
                        stage={stage}
                        type={type}
                    />
                </div>
            </div>
        )
    },
)

const Finished = React.memo(({ status, startedOn, finishedOn, artifact }: FinishedType): JSX.Element => {
    return (
        <div className="flex column left">
            <div className={`${status} fs-14 fw-6 ${TERMINAL_STATUS_COLOR_CLASS_MAP[status.toLowerCase()] || 'cn-5'}`}>
                {status && status.toLowerCase() === 'cancelled' ? 'ABORTED' : status}
            </div>            
            <div className="flex left">
                {finishedOn && finishedOn !== ZERO_TIME_STRING && (
                    <>            
                        <time className="dc__vertical-align-middle">
                            {moment(finishedOn, 'YYYY-MM-DDTHH:mm:ssZ').format(Moment12HourFormat)}
                        </time>
                        <div className="dc__bullet mr-6 ml-6"/>
                        <TimerIcon className="mb-1 grace-period-timer-icon icon-dim-20 mr-4 scn-6 commit-hash__icon grayscale dc__vertical-align-middle" />
                        <time className="dc__vertical-align-middle mr-12">
                           { formatDurationDiff(startedOn, finishedOn) }
                        </time>                        
                    </>           
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
})

const WorkerStatus = React.memo(({ message, podStatus, stage }: WorkerStatusType): JSX.Element | null => {
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
                {message && <div className="fs-12 cn-7">{message}</div>}
            </div>
        </>
    )
})

const ProgressingStatus = React.memo(
    ({ status, startedOn, message, podStatus, stage, type }: ProgressingStatusType): JSX.Element => {
        const [aborting, setAborting] = useState(false)
        const [abortConfirmation, setAbortConfiguration] = useState(false)
        const [durationStr, setDurationStr] = useState<string>('');
        const { buildId, triggerId, pipelineId } = useParams<{
            buildId: string
            triggerId: string
            pipelineId: string
        }>()
        let abort = null
        if (type === HistoryComponentType.CI) {
            abort = () => cancelCiTrigger({ pipelineId, workflowId: buildId })
        } else if (stage !== 'DEPLOY') {
            abort = () => cancelPrePostCdTrigger(pipelineId, triggerId)
        }

        useEffect(() => {
            setDurationStr(formatDurationDiff(startedOn, Date()))
            const intervalTimer = setInterval(() => {
                setDurationStr(formatDurationDiff(startedOn, Date()))
            }, 1000) 

            return () => {
                if (intervalTimer) {
                    clearInterval(intervalTimer)
                }
            }
        }, [])

        async function abortRunning() {
            setAborting(true)
            const [error] = await asyncWrap(abort())
            setAborting(false)
            if (error) {
                showError(error)
            } else {
                toast.success('Build Aborted')
                setAbortConfiguration(false)
            }
        }

        const toggleAbortConfiguration = (): void => {
            setAbortConfiguration(not)
        }
        return (
            <>
                <div className="flex left">
                    <div>
                        <div className={`${status} fs-14 fw-6 flex left inprogress-status-color`}>
                            In progress
                        </div>
                        <TimerIcon className="mb-2 grace-period-timer-icon icon-dim-20 mr-6 scn-6 commit-hash__icon grayscale dc__vertical-align-middle" />
                        <time className="dc__vertical-align-middle">
                            {durationStr}
                        </time>
                    </div>
                    
                    {abort && (
                        <button
                            className="flex cta delete er-5 bw-1 fw-6 fs-13 h-28 ml-16"
                            onClick={toggleAbortConfiguration}
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
                            title={
                                type === HistoryComponentType.CD
                                    ? `Abort ${stage.toLowerCase()}-deployment?`
                                    : 'Abort build?'
                            }
                        />
                        <p className="fs-13 cn-7 lh-1-54">
                            {type === HistoryComponentType.CD
                                ? 'Are you sure you want to abort this stage?'
                                : 'Are you sure you want to abort this build?'}
                        </p>
                        <ConfirmationDialog.ButtonGroup>
                            <button type="button" className="cta cancel" onClick={toggleAbortConfiguration}>
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
    },
)

const CurrentStatus = React.memo(
    ({ status, startedOn, finishedOn, artifact, message, podStatus, stage, type }: CurrentStatusType): JSX.Element => {
        if (PROGRESSING_STATUS[status.toLowerCase()]) {
            return (
                <ProgressingStatus status={status} startedOn={startedOn} message={message} podStatus={podStatus} stage={stage} type={type} />
            )
        } else {
            return (
                <div className="flex left">
                    <Finished status={status} startedOn={startedOn} finishedOn={finishedOn} artifact={artifact} />
                    <WorkerStatus message={message} podStatus={podStatus} stage={stage} />
                </div>
            )
        }
    },
)

const StartDetails = ({
    startedOn,
    triggeredBy,
    triggeredByEmail,
    ciMaterials,
    gitTriggers,
    artifact,
    type,
}: StartDetailsType): JSX.Element => {
    const { url } = useRouteMatch()
    const { pathname } = useLocation()
    return (
        <div className="trigger-details__start flex column left">
            <div className="cn-9 fs-14 fw-6">Start</div>
            <div className="flex left">
                <time className="cn-7 fs-12">
                    {moment(startedOn, 'YYYY-MM-DDTHH:mm:ssZ').format(Moment12HourFormat)}
                </time>
                <div className="dc__bullet mr-6 ml-6"></div>
                <div className="trigger-details__trigger-by cn-7 fs-12 mr-12">
                    {triggeredBy === 1 ? 'auto trigger' : triggeredByEmail}
                </div>
                {type === HistoryComponentType.CD && artifact ? (
                    <div className="dc__app-commit__hash ">
                        <img src={docker} className="commit-hash__icon grayscale" />
                        {artifact.split(':')[1]}
                    </div>
                ) : (
                    ciMaterials?.map((ciMaterial) => {
                        const gitDetail: GitTriggers = gitTriggers[ciMaterial.id]
                        return (
                            <React.Fragment key={ciMaterial.id}>
                                {ciMaterial.type != 'WEBHOOK' && (
                                    <a
                                        target="_blank"
                                        rel="noopener noreferer"
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
                                                ? gitDetail.WebhookData.Data['target checkout']?.substr(0, 8)
                                                : gitDetail.WebhookData.Data['target checkout']}
                                        </span>
                                    )}
                            </React.Fragment>
                        )
                    })
                )}
                {!pathname.includes('source-code') && (
                    <Link to={`${url}/source-code`} className="anchor ml-8">
                        Commit details
                    </Link>
                )}
            </div>
        </div>
    )
}
