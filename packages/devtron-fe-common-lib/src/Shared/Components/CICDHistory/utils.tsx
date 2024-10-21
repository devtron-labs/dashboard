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
import { TIMELINE_STATUS } from '@Shared/constants'
import { ReactComponent as ICAborted } from '@Icons/ic-aborted.svg'
import { ReactComponent as ICErrorCross } from '@Icons/ic-error-cross.svg'
import {
    TriggerHistoryFilterCriteriaProps,
    DeploymentHistoryResultObject,
    DeploymentHistory,
    TriggerHistoryFilterCriteriaType,
    StageStatusType,
} from './types'
import { ResourceKindType } from '../../types'
import { ReactComponent as Close } from '../../../Assets/Icon/ic-close.svg'
import { ReactComponent as Check } from '../../../Assets/Icon/ic-check-grey.svg'
import { ReactComponent as ICHelpOutline } from '../../../Assets/Icon/ic-help-outline.svg'
import { ReactComponent as Error } from '../../../Assets/Icon/ic-error-exclamation.svg'
import { ReactComponent as Timer } from '../../../Assets/Icon/ic-timer.svg'
import { ReactComponent as Disconnect } from '../../../Assets/Icon/ic-disconnected.svg'
import { ReactComponent as TimeOut } from '../../../Assets/Icon/ic-timeout-red.svg'
import { ReactComponent as ICCheck } from '../../../Assets/Icon/ic-check.svg'
import { ReactComponent as ICInProgress } from '../../../Assets/Icon/ic-in-progress.svg'
import { TERMINAL_STATUS_MAP } from './constants'

export const getTriggerHistoryFilterCriteria = ({
    appId,
    envId,
    releaseId,
    showCurrentReleaseDeployments,
}: TriggerHistoryFilterCriteriaProps): TriggerHistoryFilterCriteriaType => {
    const filterCriteria: TriggerHistoryFilterCriteriaType = [
        `${ResourceKindType.devtronApplication}|id|${appId}`,
        `environment|id|${envId}`,
    ]
    if (showCurrentReleaseDeployments) {
        filterCriteria.push(`${ResourceKindType.release}|id|${releaseId}`)
    }

    return filterCriteria
}

export const getParsedTriggerHistory = (result): DeploymentHistoryResultObject => {
    const parsedResult = {
        cdWorkflows: (result.cdWorkflows || []).map((deploymentHistory: DeploymentHistory) => ({
            ...deploymentHistory,
            triggerId: deploymentHistory?.cd_workflow_id,
            podStatus: deploymentHistory?.pod_status,
            startedOn: deploymentHistory?.started_on,
            finishedOn: deploymentHistory?.finished_on,
            pipelineId: deploymentHistory?.pipeline_id,
            logLocation: deploymentHistory?.log_file_path,
            triggeredBy: deploymentHistory?.triggered_by,
            artifact: deploymentHistory?.image,
            triggeredByEmail: deploymentHistory?.email_id,
            stage: deploymentHistory?.workflow_type,
            image: deploymentHistory?.image,
            imageComment: deploymentHistory?.imageComment,
            imageReleaseTags: deploymentHistory?.imageReleaseTags,
            artifactId: deploymentHistory?.ci_artifact_id,
            runSource: deploymentHistory?.runSource,
        })),
        appReleaseTagNames: result.appReleaseTagNames,
        tagsEditable: result.tagsEditable,
        hideImageTaggingHardDelete: result.hideImageTaggingHardDelete,
    }
    return parsedResult
}

export const buildHoverHtmlForWebhook = (eventName, condition, selectors) => {
    const _conditions = []
    Object.keys(condition).forEach((_selectorId) => {
        // eslint-disable-next-line eqeqeq
        const _selector = selectors.find((i) => i.id == _selectorId)
        _conditions.push({ name: _selector ? _selector.name : '', value: condition[_selectorId] })
    })

    return (
        <>
            <span> {eventName} Filters </span>
            <br />
            <ul className="m-0">
                {_conditions.map((_condition, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li key={index}>
                        {_condition.name} : {_condition.value}
                    </li>
                ))}
            </ul>
        </>
    )
}

export const renderIcon = (iconState: string): JSX.Element => {
    switch (iconState) {
        case 'success':
            return <Check className="icon-dim-20 green-tick" data-testid="success-green-tick" />
        case 'failed':
            return <Error className="icon-dim-20" />
        case 'unknown':
            return <ICHelpOutline className="icon-dim-20" />
        case 'inprogress':
            return (
                <div className="icon-dim-20">
                    <div className="pulse-highlight" />
                </div>
            )
        case 'unreachable':
            return <Close className="icon-dim-20" />
        case 'loading':
            return <div className="dc__app-summary__icon icon-dim-20 mr-6 progressing progressing--node" />
        case 'disconnect':
            return <Disconnect className="icon-dim-20" />
        case 'time_out':
            return <TimeOut className="icon-dim-20" />
        default:
            return <Timer className="icon-dim-20 timer-icon" />
    }
}

export const getStageStatusIcon = (status: StageStatusType): JSX.Element => {
    switch (status) {
        case StageStatusType.SUCCESS:
            return <ICCheck className="dc__no-shrink icon-dim-16 scg-5" />
        case StageStatusType.FAILURE:
            return <Close className="dc__no-shrink icon-dim-16 fcr-5" />
        default:
            return <ICInProgress className="dc__no-shrink icon-dim-16 ic-in-progress-orange" />
    }
}

const renderAbortedTriggerIcon = (): JSX.Element => <ICAborted className="icon-dim-20 dc__no-shrink" />
const renderFailedTriggerIcon = (): JSX.Element => (
    <ICErrorCross className="icon-dim-20 dc__no-shrink ic-error-cross-red" />
)
const renderProgressingTriggerIcon = (): JSX.Element => (
    <ICInProgress className="dc__no-shrink icon-dim-20 ic-in-progress-orange" />
)
const renderSuccessTriggerIcon = (): JSX.Element => (
    <div className="dc__app-summary__icon dc__no-shrink icon-dim-20 succeeded" />
)

export const getTriggerStatusIcon = (triggerDetailStatus: string): JSX.Element => {
    const triggerStatus = triggerDetailStatus?.toUpperCase()

    // First check for TIMELINE_STATUS so as to not break existing functionality
    // eslint-disable-next-line default-case
    switch (triggerStatus) {
        case TIMELINE_STATUS.ABORTED:
            return renderAbortedTriggerIcon()
        case TIMELINE_STATUS.DEGRADED:
            return renderFailedTriggerIcon()
        case TIMELINE_STATUS.INPROGRESS:
            return renderProgressingTriggerIcon()
        case TIMELINE_STATUS.HEALTHY:
            return renderSuccessTriggerIcon()
    }

    const lowerCaseTriggerStatus = triggerStatus?.toLocaleLowerCase()

    switch (lowerCaseTriggerStatus) {
        case TERMINAL_STATUS_MAP.CANCELLED:
            return renderAbortedTriggerIcon()

        case TERMINAL_STATUS_MAP.FAILED:
        case TERMINAL_STATUS_MAP.ERROR:
            return renderFailedTriggerIcon()

        case TERMINAL_STATUS_MAP.RUNNING:
        case TERMINAL_STATUS_MAP.PROGRESSING:
        case TERMINAL_STATUS_MAP.STARTING:
        case TERMINAL_STATUS_MAP.INITIATING:
            return renderProgressingTriggerIcon()

        case TERMINAL_STATUS_MAP.SUCCEEDED:
            return renderSuccessTriggerIcon()

        default:
            return (
                <div
                    className={`dc__app-summary__icon dc__no-shrink icon-dim-20 ${lowerCaseTriggerStatus.replace(
                        /\s+/g,
                        '',
                    )}`}
                />
            )
    }
}

export const getLogSearchIndex = ({
    stageIndex,
    lineNumberInsideStage,
}: Record<'stageIndex' | 'lineNumberInsideStage', number>) => `${stageIndex}-${lineNumberInsideStage}`
