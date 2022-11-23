import React, { useState } from 'react'
import {
    Progressing,
    showError,
    createGitCommitUrl,
    asyncWrap,
    ConfirmationDialog,
} from '../../../common'
import { toast } from 'react-toastify'
import { useRouteMatch, useLocation } from 'react-router'
import { History, GitTriggers } from '../cIDetails/types'
import { statusColor as colorMap } from '../../config'
import { Moment12HourFormat } from '../../../../config'
import moment from 'moment'
import docker from '../../../../assets/icons/misc/docker.svg'
import warn from '../../../../assets/icons/ic-warning.svg'
import '../cIDetails/ciDetails.scss'
import { PROGRESSING_STATUS, TERMINAL_STATUS_COLOR_CLASS_MAP } from '../cicdHistory/types'
import { Link } from 'react-router-dom'

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
