import React, { useState } from 'react'
import { Progressing, ConfirmationDialog, not, TippyTheme, ZERO_TIME_STRING } from '@devtron-labs/devtron-fe-common-lib'
import { toast } from 'react-toastify'
import Tippy from '@tippyjs/react'
import { useRouteMatch, useLocation, useParams } from 'react-router'
import moment from 'moment'
import { Link, NavLink } from 'react-router-dom'
import { createGitCommitUrl, asyncWrap, importComponentFromFELibrary } from '../../../common'
import { statusColor as colorMap } from '../../config'
import { Moment12HourFormat } from '../../../../config'
import docker from '../../../../assets/icons/misc/docker.svg'
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
} from './types'
import { cancelCiTrigger, cancelPrePostCdTrigger, extractImage } from '../../service'
import { DEFAULT_ENV } from '../triggerView/Constants'
import { TIMEOUT_VALUE, WORKER_POD_BASE_URL } from './Constants'

const DeploymentHistoryTriggerMetaText = importComponentFromFELibrary('DeploymentHistoryTriggerMetaText')

const TriggerDetailsStatusIcon = React.memo(
    ({ status, isDeploymentWindowInfo }: TriggerDetailsStatusIconType): JSX.Element => {
        let viewBox = '0 0 25 87',
            height = '87',
            cyEndCircle = '74.5',
            y2Line = '69'
        if (isDeploymentWindowInfo) {
            viewBox = '0 0 25 118'
            height = '118'
            cyEndCircle = '105'
            y2Line = '100'
        }
        return (
            <svg width="25" height={height} viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12.5" cy="6.5" r="6" fill="white" stroke="#3B444C" />
                <circle
                    cx="12.5"
                    cy={cyEndCircle}
                    r="6"
                    fill={colorMap[status]}
                    stroke={colorMap[status]}
                    strokeWidth="12"
                    strokeOpacity="0.3"
                />
                <line x1="12.5" y1="11.9997" x2="12.5362" y2={y2Line} stroke="#3B444C" />
            </svg>
        )
    },
)

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
        environmentName,
        isJobView,
        workerPodName,
        triggerMetadata,
    }: TriggerDetailsType): JSX.Element => {
        return (
            <div className="trigger-details">
                <div className="flex">
                    <TriggerDetailsStatusIcon
                        status={status?.toLowerCase()}
                        isDeploymentWindowInfo={!!(triggerMetadata && DeploymentHistoryTriggerMetaText)}
                    />
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
                        environmentName={environmentName}
                        isJobView={isJobView}
                        triggerMetadata={triggerMetadata}
                    />
                    <CurrentStatus
                        status={status}
                        finishedOn={finishedOn}
                        artifact={artifact}
                        message={message}
                        podStatus={podStatus}
                        stage={stage}
                        type={type}
                        isJobView={isJobView}
                        workerPodName={workerPodName}
                    />
                </div>
            </div>
        )
    },
)

const Finished = React.memo(({ status, finishedOn, artifact, type }: FinishedType): JSX.Element => {
    return (
        <div className="flex column left dc__min-width-fit-content">
            <div
                className={`${status} fs-14 fw-6 ${TERMINAL_STATUS_COLOR_CLASS_MAP[status.toLowerCase()] || 'cn-5'}`}
                data-testid="deployment-status-text"
            >
                {status && status.toLowerCase() === 'cancelled' ? 'ABORTED' : status}
            </div>
            <div className="flex left">
                {finishedOn && finishedOn !== ZERO_TIME_STRING && (
                    <time className="dc__vertical-align-middle">
                        {moment(finishedOn, 'YYYY-MM-DDTHH:mm:ssZ').format(Moment12HourFormat)}
                    </time>
                )}
                {type === HistoryComponentType.CI && artifact && (
                    <>
                        <div className="dc__bullet mr-6 ml-6" />
                        <div className="dc__app-commit__hash ">
                            <img src={docker} className="commit-hash__icon grayscale" />
                            {extractImage(artifact)}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
})

const WorkerStatus = React.memo(
    ({ message, podStatus, stage, workerPodName, finishedOn }: WorkerStatusType): JSX.Element | null => {
        if (!message && !podStatus) {
            return null
        }
        // check if finishedOn time is timed out or not
        const isTimedOut = moment(finishedOn).isBefore(moment().subtract(TIMEOUT_VALUE, 'hours'))
        // finishedOn is 0001-01-01T00:00:00Z when the worker is still running
        const showLink = workerPodName && (finishedOn === ZERO_TIME_STRING || !isTimedOut)

        return (
            <>
                <span style={{ height: '80%', borderRight: '1px solid var(--N100)', margin: '0 16px' }} />
                <div className="flex left column">
                    <div className="flex left fs-14">
                        {stage === 'DEPLOY' ? (
                            <div className="mr-10">Message</div>
                        ) : showLink ? (
                            <NavLink
                                to={`${WORKER_POD_BASE_URL}/${workerPodName}/logs`}
                                target="_blank"
                                className="anchor"
                            >
                                <div className="mr-10">View worker pod</div>
                            </NavLink>
                        ) : (
                            <div className="mr-10">Worker</div>
                        )}
                        {podStatus && (
                            <div className="fw-6" style={{ color: colorMap[podStatus.toLowerCase()] }}>
                                {podStatus}
                            </div>
                        )}
                    </div>
                    {message && (
                        <Tippy
                            theme={TippyTheme.black}
                            className="default-tt"
                            arrow={false}
                            placement="bottom-start"
                            animation="shift-toward-subtle"
                            content={message}
                        >
                            <div className="fs-12 cn-7 dc__ellipsis-right__2nd-line">{message}</div>
                        </Tippy>
                    )}
                </div>
            </>
        )
    },
)

const ProgressingStatus = React.memo(
    ({ status, message, podStatus, stage, type, finishedOn, workerPodName }: ProgressingStatusType): JSX.Element => {
        const [aborting, setAborting] = useState(false)
        const [abortConfirmation, setAbortConfirmation] = useState(false)
        const [abortError, setAbortError] = useState<{
            status: boolean
            message: string
        }>({
            status: false,
            message: '',
        })
        const { buildId, triggerId, pipelineId } = useParams<{
            buildId: string
            triggerId: string
            pipelineId: string
        }>()
        let abort = null
        if (type === HistoryComponentType.CI) {
            abort = (isForceAbort: boolean) => cancelCiTrigger({ pipelineId, workflowId: buildId }, isForceAbort)
        } else if (stage !== 'DEPLOY') {
            abort = () => cancelPrePostCdTrigger(pipelineId, triggerId)
        }

        async function abortRunning() {
            setAborting(true)
            try {
                await abort(abortError.status)
                toast.success('Build Aborted')
                setAbortConfirmation(false)
                setAbortError({
                    status: false,
                    message: '',
                })
            } catch (error) {
                setAborting(false)
                setAbortConfirmation(false)
                if (error['code'] === 400) {
                    // code 400 is for aborting a running build
                    const errors = error['errors']
                    setAbortError({
                        status: true,
                        message: errors[0].userMessage,
                    })
                }
            }
        }

        const toggleAbortConfiguration = (): void => {
            setAbortConfirmation(not)
        }
        const closeForceAbortModal = (): void => {
            setAbortError({
                status: false,
                message: '',
            })
        }
        return (
            <>
                <div className="flex left mb-24">
                    <div className="dc__min-width-fit-content">
                        <div className={`${status} fs-14 fw-6 flex left inprogress-status-color`}>In progress</div>
                    </div>

                    {abort && (
                        <button
                            className="flex cta delete er-5 bw-1 fw-6 fs-13 h-28 ml-16"
                            onClick={toggleAbortConfiguration}
                        >
                            Abort
                        </button>
                    )}
                    <WorkerStatus
                        message={message}
                        podStatus={podStatus}
                        stage={stage}
                        finishedOn={finishedOn}
                        workerPodName={workerPodName}
                    />
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
                {abortError.status && (
                    <ConfirmationDialog>
                        <ConfirmationDialog.Icon src={warn} />
                        <ConfirmationDialog.Body title="Could not abort build!" />
                        <div className="w-100 bc-n50 h-36 flexbox dc__align-items-center">
                            <span className="pl-12">Error: {abortError.message}</span>
                        </div>
                        <div className="fs-13 fw-6 pt-12 cn-7 lh-1-54">
                            <span>Please try to force abort</span>
                        </div>
                        <div className="pt-4 fw-4 cn-7 lh-1-54">
                            <span>Some resource might get orphaned which will be cleaned up with Job-lifecycle</span>
                        </div>
                        <ConfirmationDialog.ButtonGroup>
                            <button type="button" className="cta cancel" onClick={closeForceAbortModal}>
                                Cancel
                            </button>
                            <button type="button" className="cta delete" onClick={abortRunning}>
                                {aborting ? <Progressing /> : 'Force Abort'}
                            </button>
                        </ConfirmationDialog.ButtonGroup>
                    </ConfirmationDialog>
                )}
            </>
        )
    },
)

const CurrentStatus = React.memo(
    ({
        status,
        finishedOn,
        artifact,
        message,
        podStatus,
        stage,
        type,
        isJobView,
        workerPodName,
    }: CurrentStatusType): JSX.Element => {
        if (PROGRESSING_STATUS[status.toLowerCase()]) {
            return (
                <ProgressingStatus
                    status={status}
                    message={message}
                    podStatus={podStatus}
                    stage={stage}
                    type={type}
                    finishedOn={finishedOn}
                    workerPodName={workerPodName}
                />
            )
        }
        return (
            <div className={`flex left ${isJobView ? 'mb-24' : ''}`}>
                <Finished status={status} finishedOn={finishedOn} artifact={artifact} type={type} />
                <WorkerStatus
                    message={message}
                    podStatus={podStatus}
                    stage={stage}
                    finishedOn={finishedOn}
                    workerPodName={workerPodName}
                />
            </div>
        )
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
    environmentName,
    isJobView,
    triggerMetadata,
}: StartDetailsType): JSX.Element => {
    const { url } = useRouteMatch()
    const { pathname } = useLocation()
    return (
        <div className={`trigger-details__start flex column left ${isJobView ? 'mt-4' : ''}`}>
            <div className="cn-9 fs-14 fw-6" data-testid="deployment-history-start-heading">
                Start
            </div>
            <div className="flex left">
                <time className="cn-7 fs-12">
                    {moment(startedOn, 'YYYY-MM-DDTHH:mm:ssZ').format(Moment12HourFormat)}
                </time>
                <div className="dc__bullet mr-6 ml-6" />
                <div className="trigger-details__trigger-by cn-7 fs-12 mr-12">
                    {triggeredBy === 1 ? 'auto trigger' : triggeredByEmail}
                </div>
                {type === HistoryComponentType.CD ? (
                    <>
                        {artifact && (
                            <div className="dc__app-commit__hash" data-testid="docker-image-hash">
                                <img src={docker} className="commit-hash__icon grayscale" />
                                {artifact.split(':')[1]}
                            </div>
                        )}
                    </>
                ) : (
                    Object.keys(gitTriggers ?? {}).length > 0 &&
                    ciMaterials?.map((ciMaterial) => {
                        const gitDetail: GitTriggers = gitTriggers[ciMaterial.id]
                        return gitDetail ? (
                            <React.Fragment key={ciMaterial.id}>
                                {ciMaterial.type != 'WEBHOOK' && (
                                    <a
                                        target="_blank"
                                        rel="noopener noreferer noreferrer"
                                        href={createGitCommitUrl(ciMaterial.url, gitDetail.Commit)}
                                        className="dc__app-commit__hash mr-12 bcn-1 cn-7"
                                    >
                                        {gitDetail.Commit?.substr(0, 8)}
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
                        ) : null
                    })
                )}
                {!pathname.includes('source-code') && (
                    <Link to={`${url}/source-code`} className="anchor ml-8" data-testid="commit-details-link">
                        Commit details
                    </Link>
                )}
            </div>

            {triggerMetadata && DeploymentHistoryTriggerMetaText && (
                <DeploymentHistoryTriggerMetaText triggerMetaData={triggerMetadata} />
            )}
            {isJobView && (
                <div className="pt-4 pb-4 pr-0 pl-0">
                    <span className="fw-6 fs-14">Env</span>
                    <span className="fs-12 mb-4 ml-8">{environmentName !== '' ? environmentName : DEFAULT_ENV}</span>
                    {environmentName === '' && <span className="fw-4 fs-11 ml-4 dc__italic-font-style">(Default)</span>}
                </div>
            )}
        </div>
    )
}
