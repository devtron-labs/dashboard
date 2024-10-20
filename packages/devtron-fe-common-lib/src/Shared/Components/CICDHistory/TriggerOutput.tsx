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

import { Redirect, Route, Switch, useLocation, useParams, useRouteMatch, Link, NavLink } from 'react-router-dom'
import React, { useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { ShowMoreText } from '@Shared/Components/ShowMoreText'
import { getHandleOpenURL } from '@Shared/Helpers'
import { ImageChipCell } from '@Shared/Components/ImageChipCell'
import { CommitChipCell } from '@Shared/Components/CommitChipCell'
import { ReactComponent as ICLines } from '@Icons/ic-lines.svg'
import { ReactComponent as ICPulsateStatus } from '@Icons/ic-pulsate-status.svg'
import { ReactComponent as ICArrowRight } from '@Icons/ic-arrow-right.svg'
import { getDeploymentStageTitle } from '@Pages/App'
import { ToastManager, ToastVariantType } from '@Shared/Services'
import {
    ConfirmationDialog,
    DATE_TIME_FORMATS,
    DeploymentAppTypes,
    GenericEmptyState,
    Progressing,
    Reload,
    createGitCommitUrl,
    useAsync,
    not,
    ZERO_TIME_STRING,
    useInterval,
    URLS,
    ServerError,
    mapByKey,
} from '../../../Common'
import {
    CurrentStatusType,
    FetchIdDataStatus,
    FinishedType,
    HistoryComponentType,
    PROGRESSING_STATUS,
    ProgressingStatusType,
    StartDetailsType,
    TERMINAL_STATUS_COLOR_CLASS_MAP,
    TriggerDetailsStatusIconType,
    TriggerDetailsType,
    TriggerOutputProps,
    WorkerStatusType,
    statusSet,
    terminalStatus,
    History,
    HistoryLogsProps,
} from './types'
import { getTagDetails, getTriggerDetails, cancelCiTrigger, cancelPrePostCdTrigger } from './service'
import { DEFAULT_ENV, TIMEOUT_VALUE, WORKER_POD_BASE_URL } from './constants'
import { GitTriggers } from '../../types'
import warn from '../../../Assets/Icon/ic-warning.svg'
import LogsRenderer from './LogsRenderer'
import DeploymentDetailSteps from './DeploymentDetailSteps'
import { DeploymentHistoryConfigDiff } from './DeploymentHistoryConfigDiff'
import { GitChanges, Scroller } from './History.components'
import Artifacts from './Artifacts'
import { statusColor as colorMap, EMPTY_STATE_STATUS, PULSATING_STATUS_MAP } from '../../constants'
import './cicdHistory.scss'

const Finished = React.memo(
    ({ status, finishedOn, artifact, type }: FinishedType): JSX.Element => (
        <div className="flexbox pt-12 dc__gap-8 left dc__min-width-fit-content dc__align-items-center">
            <div
                className={`${status} fs-13 fw-6 ${TERMINAL_STATUS_COLOR_CLASS_MAP[status.toLowerCase()] || 'cn-5'}`}
                data-testid="deployment-status-text"
            >
                {status && status.toLowerCase() === 'cancelled' ? 'Aborted' : status}
            </div>

            {finishedOn && finishedOn !== ZERO_TIME_STRING && (
                <time className="dc__vertical-align-middle fs-13">
                    {moment(finishedOn, 'YYYY-MM-DDTHH:mm:ssZ').format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)}
                </time>
            )}

            {type === HistoryComponentType.CI && artifact && (
                <>
                    <div className="dc__bullet" />
                    <ImageChipCell imagePath={artifact} placement="top" />
                </>
            )}
        </div>
    ),
)

const WorkerStatus = React.memo(
    ({ message, podStatus, stage, workerPodName, finishedOn }: WorkerStatusType): JSX.Element | null => {
        if (!message && !podStatus) {
            return null
        }
        // check if finishedOn time is timed out or not
        const isTimedOut = moment(finishedOn).isBefore(moment().subtract(TIMEOUT_VALUE, 'hours'))
        // finishedOn is 0001-01-01T00:00:00Z when the worker is still running
        const showLink = workerPodName && (finishedOn === ZERO_TIME_STRING || !isTimedOut)

        const getViewWorker = () =>
            showLink ? (
                <NavLink to={`${WORKER_POD_BASE_URL}/${workerPodName}/logs`} target="_blank" className="anchor">
                    <span className="mr-10 fs-13">View worker pod</span>
                </NavLink>
            ) : null

        return (
            <div className="display-grid trigger-details__grid py-4">
                <div className="flexbox dc__content-center">
                    <ICLines className="icon-dim-20 dc__no-shrink scn-7" />
                </div>

                <div className="flexbox-col">
                    <div className="flexbox dc__gap-8">
                        <div className="flexbox cn-9 fs-13 fw-4 lh-20">
                            <span>Worker</span>&nbsp;
                            {podStatus && <span>{podStatus.toLowerCase()}&nbsp;</span>}
                        </div>
                        {stage !== 'DEPLOY' && getViewWorker()}
                    </div>

                    {/* Need key since using ref inside of this component as useEffect dependency, so there were issues while switching builds */}
                    {message && <ShowMoreText text={message} key={message} textClass="cn-7" />}
                </div>
            </div>
        )
    },
)

const ProgressingStatus = React.memo(({ status, stage, type }: ProgressingStatusType): JSX.Element => {
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
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Build Aborted',
            })
            setAbortConfirmation(false)
            setAbortError({
                status: false,
                message: '',
            })
        } catch (error) {
            setAborting(false)
            setAbortConfirmation(false)
            if (error.code === 400) {
                // code 400 is for aborting a running build
                const { errors } = error
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
            <div className="flex dc__gap-8 left pt-12">
                <div className="dc__min-width-fit-content">
                    <div className={`${status} fs-14 fw-6 flex left inprogress-status-color`}>In progress</div>
                </div>

                {abort && (
                    <>
                        <span className="cn-5 fs-13 fw-4 lh-20">/</span>
                        <button
                            type="button"
                            className="flex dc__transparent cr-5 fs-13 fw-6 lh-20"
                            onClick={toggleAbortConfiguration}
                        >
                            Abort
                        </button>
                    </>
                )}
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
})

const CurrentStatus = React.memo(({ status, finishedOn, artifact, stage, type }: CurrentStatusType): JSX.Element => {
    if (PROGRESSING_STATUS[status.toLowerCase()]) {
        return <ProgressingStatus status={status} stage={stage} type={type} />
    }
    return <Finished status={status} finishedOn={finishedOn} artifact={artifact} type={type} />
})

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
    renderDeploymentHistoryTriggerMetaText,
    renderTargetConfigInfo,
    stage,
}: StartDetailsType): JSX.Element => {
    const { url } = useRouteMatch()
    const { pathname } = useLocation()

    return (
        <div className="w-100 pr-20 flex column left dc__border-bottom-n1">
            <div className="flexbox dc__gap-8 dc__align-items-center pb-12 flex-wrap">
                <div className="flex left dc__gap-4 cn-9 fs-13 fw-6 lh-20">
                    <div className="flex left dc__no-shrink dc__gap-4" data-testid="deployment-history-start-heading">
                        <div>Start</div>
                        {stage && (
                            <>
                                <div className="dc__bullet" />
                                <div className="dc__first-letter-capitalize">{getDeploymentStageTitle(stage)}</div>
                            </>
                        )}
                    </div>
                    {environmentName && (
                        <>
                            <ICArrowRight className="icon-dim-14 scn-9 dc__no-shrink" />
                            <span className="dc__truncate">{environmentName}</span>
                        </>
                    )}
                    {renderTargetConfigInfo?.()}
                </div>

                <time className="cn-7 fs-13">
                    {moment(startedOn, 'YYYY-MM-DDTHH:mm:ssZ').format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)}
                </time>

                <div className="dc__bullet" />

                <div className="trigger-details__trigger-by cn-7 fs-13">
                    {triggeredBy === 1 ? 'auto trigger' : triggeredByEmail}
                </div>

                {/* Have to add a div, so add to convert the gap to 16 */}
                <div />

                {type === HistoryComponentType.CD ? (
                    // eslint-disable-next-line react/jsx-no-useless-fragment
                    <>{artifact && <ImageChipCell imagePath={artifact} placement="top" />}</>
                ) : (
                    Object.keys(gitTriggers ?? {}).length > 0 &&
                    ciMaterials?.map((ciMaterial) => {
                        const gitDetail: GitTriggers = gitTriggers[ciMaterial.id]
                        return gitDetail ? (
                            <React.Fragment key={ciMaterial.id}>
                                {ciMaterial.type !== 'WEBHOOK' && gitDetail.Commit && (
                                    <CommitChipCell
                                        commits={[gitDetail.Commit]}
                                        handleClick={getHandleOpenURL(
                                            createGitCommitUrl(ciMaterial.url, gitDetail.Commit),
                                        )}
                                    />
                                )}
                                {ciMaterial.type === 'WEBHOOK' &&
                                    gitDetail.WebhookData &&
                                    gitDetail.WebhookData.Data &&
                                    gitDetail.WebhookData.Data['target checkout'] && (
                                        <CommitChipCell
                                            commits={
                                                gitDetail.WebhookData.EventActionType === 'merged'
                                                    ? gitDetail.WebhookData.Data['target checkout'].substr(0, 7)
                                                    : gitDetail.WebhookData.Data['target checkout']
                                            }
                                        />
                                    )}
                            </React.Fragment>
                        ) : null
                    })
                )}

                {!pathname.includes('source-code') && (
                    <Link to={`${url}/source-code`} className="anchor fs-13" data-testid="commit-details-link">
                        Commit details
                    </Link>
                )}
            </div>

            {triggerMetadata &&
                renderDeploymentHistoryTriggerMetaText &&
                renderDeploymentHistoryTriggerMetaText(triggerMetadata)}

            {isJobView && (
                <div className="flexbox dc__align-items-center dc__gap-8 pb-8">
                    <span className="cn-9 fs-13 fw-6 lh-20">Env</span>
                    <span className="fs-12 lh-20">{environmentName !== '' ? environmentName : DEFAULT_ENV}</span>
                    {environmentName === '' && <i className="fw-4 fs-12 lh-20">(Default)</i>}
                </div>
            )}
        </div>
    )
}

const TriggerDetailsStatusIcon = React.memo(
    ({ status }: TriggerDetailsStatusIconType): JSX.Element => (
        <div className="flexbox-col">
            <div className="flex">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="5" stroke="var(--N700)" />
                    <path d="M10 15L10 20" stroke="var(--N700)" />
                </svg>
            </div>

            <div className="flex flex-grow-1">
                <div className="dc__border-left--n7 h-100" />
            </div>

            {PULSATING_STATUS_MAP[status] ? (
                <ICPulsateStatus />
            ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle
                        cx="10"
                        cy="10"
                        r="5"
                        fill={colorMap[status]}
                        stroke={colorMap[status]}
                        strokeOpacity="0.3"
                        strokeWidth="10"
                    />
                    <path d="M10 0L10 5" stroke="var(--N700)" />
                </svg>
            )}
        </div>
    ),
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
        renderDeploymentHistoryTriggerMetaText,
        renderTargetConfigInfo,
    }: TriggerDetailsType): JSX.Element => (
        <div className="trigger-details flexbox-col pb-12">
            <div className="display-grid trigger-details__grid py-12">
                <div className="flexbox dc__content-center">
                    <TriggerDetailsStatusIcon status={status?.toLowerCase()} />
                </div>
                <div className="trigger-details__summary flexbox-col flex-grow-1 lh-20">
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
                        renderDeploymentHistoryTriggerMetaText={renderDeploymentHistoryTriggerMetaText}
                        renderTargetConfigInfo={renderTargetConfigInfo}
                        stage={stage}
                    />

                    <CurrentStatus
                        status={status}
                        finishedOn={finishedOn}
                        artifact={artifact}
                        stage={stage}
                        type={type}
                    />
                </div>
            </div>

            <WorkerStatus
                message={message}
                podStatus={podStatus}
                stage={stage}
                finishedOn={finishedOn}
                workerPodName={workerPodName}
            />
        </div>
    ),
)

const HistoryLogs: React.FC<HistoryLogsProps> = ({
    triggerDetails,
    loading,
    setFullScreenView,
    deploymentAppType,
    isBlobStorageConfigured,
    userApprovalMetadata,
    triggeredByEmail,
    artifactId,
    ciPipelineId,
    appReleaseTags,
    tagsEditable,
    hideImageTaggingHardDelete,
    selectedEnvironmentName,
    resourceId,
    renderRunSource,
    processVirtualEnvironmentDeploymentData,
    renderDeploymentApprovalInfo,
    renderCIListHeader,
    renderVirtualHistoryArtifacts,
    scrollToTop,
    scrollToBottom,
    fullScreenView,
    appName,
    triggerHistory,
}) => {
    const { path } = useRouteMatch()
    const { appId, pipelineId, triggerId, envId } = useParams<{
        appId: string
        pipelineId: string
        triggerId: string
        envId: string
    }>()

    const paramsData = {
        appId,
        envId,
        appName: `${triggerDetails.helmPackageName}.tgz`,
        workflowId: triggerDetails.id,
    }

    const CDBuildReportUrl = `app/cd-pipeline/workflow/download/${appId}/${envId}/${pipelineId}/${triggerId}`

    return (
        <div className="trigger-outputs-container flexbox-col flex-grow-1 h-100">
            {loading ? (
                <Progressing pageLoader />
            ) : (
                <Switch>
                    {triggerDetails.stage !== 'DEPLOY' ? (
                        !triggerDetails.IsVirtualEnvironment && (
                            <Route path={`${path}/logs`}>
                                <LogsRenderer
                                    triggerDetails={triggerDetails}
                                    isBlobStorageConfigured={isBlobStorageConfigured}
                                    parentType={HistoryComponentType.CD}
                                    fullScreenView={fullScreenView}
                                />

                                {(scrollToTop || scrollToBottom) && (
                                    <Scroller
                                        style={{ position: 'fixed', bottom: '52px', right: '12px', zIndex: '4' }}
                                        {...{ scrollToTop, scrollToBottom }}
                                    />
                                )}
                            </Route>
                        )
                    ) : (
                        <Route path={`${path}/deployment-steps`}>
                            <DeploymentDetailSteps
                                deploymentStatus={triggerDetails.status}
                                deploymentAppType={deploymentAppType}
                                userApprovalMetadata={userApprovalMetadata}
                                isGitops={
                                    deploymentAppType === DeploymentAppTypes.GITOPS ||
                                    deploymentAppType === DeploymentAppTypes.MANIFEST_DOWNLOAD ||
                                    deploymentAppType === DeploymentAppTypes.MANIFEST_PUSH
                                }
                                isHelmApps={false}
                                isVirtualEnvironment={triggerDetails.IsVirtualEnvironment}
                                processVirtualEnvironmentDeploymentData={processVirtualEnvironmentDeploymentData}
                                renderDeploymentApprovalInfo={renderDeploymentApprovalInfo}
                            />
                        </Route>
                    )}
                    <Route path={`${path}/source-code`}>
                        <GitChanges
                            gitTriggers={triggerDetails.gitTriggers}
                            ciMaterials={triggerDetails.ciMaterials}
                            artifact={triggerDetails.artifact}
                            userApprovalMetadata={userApprovalMetadata}
                            triggeredByEmail={triggeredByEmail}
                            artifactId={artifactId}
                            ciPipelineId={ciPipelineId}
                            imageComment={triggerDetails?.imageComment}
                            imageReleaseTags={triggerDetails?.imageReleaseTags}
                            appReleaseTagNames={appReleaseTags}
                            tagsEditable={tagsEditable}
                            hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                            appliedFilters={triggerDetails.appliedFilters ?? []}
                            appliedFiltersTimestamp={triggerDetails.appliedFiltersTimestamp}
                            selectedEnvironmentName={selectedEnvironmentName}
                            promotionApprovalMetadata={triggerDetails?.promotionApprovalMetadata}
                            renderCIListHeader={renderCIListHeader}
                        />
                    </Route>
                    {triggerDetails.stage === 'DEPLOY' && (
                        <Route path={`${path}${URLS.DEPLOYMENT_HISTORY_CONFIGURATIONS}`}>
                            <DeploymentHistoryConfigDiff
                                appName={appName}
                                envName={selectedEnvironmentName}
                                pipelineId={+pipelineId}
                                wfrId={+triggerId}
                                triggerHistory={triggerHistory}
                                setFullScreenView={setFullScreenView}
                                resourceId={resourceId}
                                renderRunSource={renderRunSource}
                                runSource={triggerDetails.runSource}
                            />
                        </Route>
                    )}
                    {(triggerDetails.stage !== 'DEPLOY' || triggerDetails.IsVirtualEnvironment) && (
                        <Route path={`${path}/artifacts`}>
                            {triggerDetails.IsVirtualEnvironment && renderVirtualHistoryArtifacts ? (
                                renderVirtualHistoryArtifacts({
                                    status: triggerDetails.status,
                                    title: triggerDetails.helmPackageName,
                                    params: { ...paramsData, appId: Number(appId), envId: Number(envId) },
                                })
                            ) : (
                                <Artifacts
                                    status={triggerDetails.status}
                                    artifact={triggerDetails.artifact}
                                    blobStorageEnabled={triggerDetails.blobStorageEnabled}
                                    isArtifactUploaded={triggerDetails.isArtifactUploaded}
                                    ciPipelineId={triggerDetails.ciPipelineId}
                                    artifactId={triggerDetails.artifactId}
                                    imageComment={triggerDetails?.imageComment}
                                    imageReleaseTags={triggerDetails?.imageReleaseTags}
                                    tagsEditable={tagsEditable}
                                    appReleaseTagNames={appReleaseTags}
                                    hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                                    downloadArtifactUrl={CDBuildReportUrl}
                                    renderCIListHeader={renderCIListHeader}
                                    rootClassName="p-16 flex-grow-1"
                                />
                            )}
                        </Route>
                    )}
                    <Redirect
                        to={`${path}/${
                            // eslint-disable-next-line no-nested-ternary
                            triggerDetails.stage === 'DEPLOY'
                                ? `deployment-steps`
                                : triggerDetails.status.toLowerCase() === 'succeeded' ||
                                    triggerDetails.IsVirtualEnvironment
                                  ? `artifacts`
                                  : `logs`
                        }`}
                    />
                </Switch>
            )}
        </div>
    )
}

const TriggerOutput = ({
    fullScreenView,
    triggerHistory,
    setTriggerHistory,
    setFullScreenView,
    deploymentAppType,
    isBlobStorageConfigured,
    appReleaseTags,
    tagsEditable,
    hideImageTaggingHardDelete,
    fetchIdData,
    setFetchTriggerIdData,
    selectedEnvironmentName,
    deploymentHistoryResult,
    renderRunSource,
    renderCIListHeader,
    renderDeploymentApprovalInfo,
    processVirtualEnvironmentDeploymentData,
    renderVirtualHistoryArtifacts,
    renderDeploymentHistoryTriggerMetaText,
    resourceId,
    scrollToTop,
    scrollToBottom,
    renderTargetConfigInfo,
    appName,
}: TriggerOutputProps) => {
    const { appId, triggerId, envId, pipelineId } = useParams<{
        appId: string
        triggerId: string
        envId: string
        pipelineId: string
    }>()
    const triggerDetails = triggerHistory.get(+triggerId)
    const [triggerDetailsLoading, triggerDetailsResult, triggerDetailsError, reloadTriggerDetails] = useAsync(
        () => getTriggerDetails({ appId, envId, pipelineId, triggerId, fetchIdData }),
        // TODO: Ask if fetchIdData is required here as dependency
        [triggerId, appId, envId],
        !!triggerId && !!pipelineId,
    )

    // Function to sync the trigger details as trigger details is also fetched with another api
    const syncState = (syncTriggerId: number, syncTriggerDetail: History, syncTriggerDetailsError: ServerError) => {
        if (syncTriggerDetailsError) {
            if (deploymentHistoryResult?.result?.cdWorkflows?.length) {
                setTriggerHistory(mapByKey(deploymentHistoryResult.result.cdWorkflows, 'id'))
            }
            setFetchTriggerIdData(FetchIdDataStatus.SUSPEND)
            return
        }
        if (syncTriggerId === syncTriggerDetail?.id) {
            const appliedFilters = triggerHistory.get(syncTriggerId)?.appliedFilters ?? []
            const appliedFiltersTimestamp = triggerHistory.get(syncTriggerId)?.appliedFiltersTimestamp
            const promotionApprovalMetadata = triggerHistory.get(syncTriggerId)?.promotionApprovalMetadata
            const runSource = triggerHistory.get(syncTriggerId)?.runSource
            const targetConfig = triggerHistory.get(syncTriggerId)?.targetConfig

            // These changes are not subject to change after refresh, add data which will not change
            const additionalDataObject = {
                ...(appliedFilters.length ? { appliedFilters } : {}),
                ...(appliedFiltersTimestamp ? { appliedFiltersTimestamp } : {}),
                ...(promotionApprovalMetadata ? { promotionApprovalMetadata } : {}),
                ...(runSource ? { runSource } : {}),
                ...(targetConfig ? { targetConfig } : {}),
            }
            setTriggerHistory((newTriggerHistory) => {
                newTriggerHistory.set(syncTriggerId, { ...syncTriggerDetail, ...additionalDataObject })
                return new Map(newTriggerHistory)
            })
            if (fetchIdData === FetchIdDataStatus.FETCHING) {
                setFetchTriggerIdData(FetchIdDataStatus.SUCCESS)
            }
        }
    }

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
        [pipelineId, triggerId],
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
            imageComment: triggerDetails?.imageComment,
            imageReleaseTags: triggerDetails?.imageReleaseTags,
        }

        if (areTagDetailsRequired) {
            triggerDetailsWithTags = null
        }
        syncState(+triggerId, triggerDetailsWithTags, triggerDetailsError)
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
        syncState(+triggerId, triggerDetailsWithTags, tagDetailsError)
    }, [tagDetailsLoading, tagDetailsResult, tagDetailsError])

    const timeout = useMemo(() => {
        if (
            !triggerDetails ||
            terminalStatus.has(triggerDetails.podStatus?.toLowerCase() || triggerDetails.status?.toLowerCase())
        ) {
            return null
        } // no interval
        if (statusSet.has(triggerDetails.status?.toLowerCase() || triggerDetails.podStatus?.toLowerCase())) {
            // 10s because progressing
            return 10000
        }
        return 30000 // 30s for normal
    }, [triggerDetails])

    useInterval(reloadTriggerDetails, timeout)

    if (
        (!areTagDetailsRequired && triggerDetailsLoading && !triggerDetails) ||
        !triggerId ||
        (areTagDetailsRequired && (tagDetailsLoading || triggerDetailsLoading) && !triggerDetails)
    ) {
        return <Progressing pageLoader />
    }
    if (triggerDetailsError?.code === 404) {
        return (
            <GenericEmptyState
                title={EMPTY_STATE_STATUS.TRIGGER_NOT_FOUND.TITLE}
                subTitle={EMPTY_STATE_STATUS.TRIGGER_NOT_FOUND.SUBTITLE}
            />
        )
    }
    if (!areTagDetailsRequired && !triggerDetailsLoading && !triggerDetails) {
        return <Reload />
    }
    if (areTagDetailsRequired && !(tagDetailsLoading || triggerDetailsLoading) && !triggerDetails) {
        return <Reload />
    }
    if (triggerDetails?.id !== +triggerId) {
        return null
    }

    return (
        <>
            {!fullScreenView && (
                <>
                    <TriggerDetails
                        type={HistoryComponentType.CD}
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
                        triggerMetadata={triggerDetails.triggerMetadata}
                        renderDeploymentHistoryTriggerMetaText={renderDeploymentHistoryTriggerMetaText}
                        environmentName={selectedEnvironmentName}
                        renderTargetConfigInfo={renderTargetConfigInfo}
                    />
                    <ul className="pl-50 pr-20 pt-8 tab-list tab-list--nodes dc__border-bottom dc__position-sticky dc__top-0 bcn-0 dc__zi-3">
                        {triggerDetails.stage === 'DEPLOY' && deploymentAppType !== DeploymentAppTypes.HELM && (
                            <li className="tab-list__tab" data-testid="deployment-history-steps-link">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link fs-13-imp pb-8 pt-0-imp"
                                    activeClassName="active"
                                    to="deployment-steps"
                                >
                                    Steps
                                </NavLink>
                            </li>
                        )}
                        {!(triggerDetails.stage === 'DEPLOY' || triggerDetails.IsVirtualEnvironment) && (
                            <li className="tab-list__tab" data-testid="deployment-history-logs-link">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link fs-13-imp pb-8 pt-0-imp"
                                    activeClassName="active"
                                    to="logs"
                                >
                                    Logs
                                </NavLink>
                            </li>
                        )}
                        <li className="tab-list__tab" data-testid="deployment-history-source-code-link">
                            <NavLink
                                replace
                                className="tab-list__tab-link fs-13-imp pb-8 pt-0-imp"
                                activeClassName="active"
                                to="source-code"
                            >
                                Source
                            </NavLink>
                        </li>
                        {triggerDetails.stage === 'DEPLOY' && (
                            <li className="tab-list__tab" data-testid="deployment-history-configuration-link">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link fs-13-imp pb-8 pt-0-imp"
                                    activeClassName="active"
                                    to="configuration"
                                >
                                    Configuration
                                </NavLink>
                            </li>
                        )}
                        {(triggerDetails.stage !== 'DEPLOY' || triggerDetails.IsVirtualEnvironment) && (
                            <li className="tab-list__tab" data-testid="deployment-history-artifacts-link">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link fs-13-imp pb-8 pt-0-imp"
                                    activeClassName="active"
                                    to="artifacts"
                                >
                                    Artifacts
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </>
            )}
            <HistoryLogs
                key={triggerDetails.id}
                triggerDetails={triggerDetails}
                loading={
                    (triggerDetailsLoading && !triggerDetailsResult) ||
                    !triggerDetails ||
                    (areTagDetailsRequired && !tagDetailsResult)
                }
                userApprovalMetadata={triggerDetailsResult?.result?.userApprovalMetadata}
                triggeredByEmail={triggerDetailsResult?.result?.triggeredByEmail}
                setFullScreenView={setFullScreenView}
                deploymentAppType={deploymentAppType}
                isBlobStorageConfigured={isBlobStorageConfigured}
                artifactId={triggerDetailsResult?.result?.artifactId}
                ciPipelineId={triggerDetailsResult?.result?.ciPipelineId}
                appReleaseTags={appReleaseTags}
                tagsEditable={tagsEditable}
                hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                selectedEnvironmentName={selectedEnvironmentName}
                resourceId={resourceId}
                renderRunSource={renderRunSource}
                processVirtualEnvironmentDeploymentData={processVirtualEnvironmentDeploymentData}
                renderDeploymentApprovalInfo={renderDeploymentApprovalInfo}
                renderCIListHeader={renderCIListHeader}
                renderVirtualHistoryArtifacts={renderVirtualHistoryArtifacts}
                scrollToTop={scrollToTop}
                scrollToBottom={scrollToBottom}
                fullScreenView={fullScreenView}
                appName={appName}
                triggerHistory={triggerHistory}
            />
        </>
    )
}

export default TriggerOutput
