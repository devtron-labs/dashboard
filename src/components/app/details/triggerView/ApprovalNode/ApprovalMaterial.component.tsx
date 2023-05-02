import React, { useState } from 'react'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { getAlphabetIcon, noop } from '../../../../common'
import { ApprovalRequestType, ApprovedTippyContentProps, DeploymentEnvStateProps } from './Types'
import { APPROVAL_INFO_TEXTS, DEPLOYMENT_ENV_TEXT } from './Constants'
import { ReactComponent as World } from '../../../../../assets/icons/ic-world.svg'
import { ReactComponent as Failed } from '../../../../../assets/icons/ic-rocket-fail.svg'

export const ApprovedTippyContent = ({
    matId,
    requestedUserId,
    userApprovalMetadata,
    cancelRequest,
    requestInProgress,
}: ApprovedTippyContentProps) => {
    const [cancelState, setCancelState] = useState(false)
    const requestedBySelf =
        userApprovalMetadata?.requestedUserData?.userId &&
        userApprovalMetadata.requestedUserData.userId === requestedUserId
    const imageApproved = userApprovalMetadata?.approvedUsersData?.length > 0

    const toggleCancelRequest = () => {
        setCancelState((prevState) => !prevState)
    }

    const handleCancelRequest = (e) => {
        toggleCancelRequest()
        cancelRequest(e, true)
    }

    return (
        <div className="h-100 dc__overflow-hidden">
            <div className="pt-12 pb-12 pl-12 pr-12 h-100 mxh-210 dc__overflow-scroll">
                <div>
                    <h5 className="fs-13 fw-6 lh-20 mt-0 mb-8">{APPROVAL_INFO_TEXTS.requestedBy}</h5>
                    <span className="flex left mb-8 fs-13 fw-4">
                        {getAlphabetIcon(userApprovalMetadata?.requestedUserData?.userEmail)}
                        {requestedBySelf ? 'You' : userApprovalMetadata?.requestedUserData?.userEmail}
                        {requestedBySelf && !cancelState && (
                            <span
                                className="fs-13 fw-6 lh-20 cr-5 ml-auto cursor"
                                onClick={requestInProgress ? noop : toggleCancelRequest}
                                data-testid="cancel-approval-request"
                            >
                                {requestInProgress ? <Progressing size={24} /> : 'Cancel'}
                            </span>
                        )}
                    </span>
                    {cancelState && (
                        <div className="flex top left fs-13 fw-4 lh-20">
                            <span className="cn-9 mr-12">{APPROVAL_INFO_TEXTS.cancelRequest}</span>
                            <div className="ml-auto fw-6">
                                <span
                                    className="mr-12 cb-5 cursor"
                                    data-id={matId}
                                    data-request-id={userApprovalMetadata?.approvalRequestId}
                                    data-request-type={ApprovalRequestType.CANCEL}
                                    data-testid="cancel-approval-request__yes"
                                    onClick={handleCancelRequest}
                                >
                                    Yes
                                </span>
                                <span
                                    className="cn-7 cursor"
                                    onClick={toggleCancelRequest}
                                    data-testid="cancel-approval-request__no"
                                >
                                    No
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-12">
                    <h5 className="fs-13 fw-6 lh-20 mt-0 mb-8">{APPROVAL_INFO_TEXTS.approvedBy}</h5>
                    {imageApproved ? (
                        <ol className="p-0 dc__list-style-none">
                            {userApprovalMetadata.approvedUsersData.map((_approver) => {
                                return (
                                    <li key={_approver.userEmail} className="flex left mb-8 fs-13 fw-4">
                                        {getAlphabetIcon(_approver.userEmail)}
                                        {_approver.userId === requestedUserId ? 'You' : _approver.userEmail}
                                    </li>
                                )
                            })}
                        </ol>
                    ) : (
                        <span className="fs-13 fw-4 lh-20 cn-7">{APPROVAL_INFO_TEXTS.noApprovals}</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export const DeploymentEnvState = ({ envStateText, envName }: DeploymentEnvStateProps) => {
    let Icon = <></>
    let stateClassName = ''

    switch (envStateText) {
        case DEPLOYMENT_ENV_TEXT.active:
            Icon = <World className="icon-dim-16 mr-4 scg-5" />
            stateClassName = 'bcg-1 eg-2'
            break
        case DEPLOYMENT_ENV_TEXT.failed:
            Icon = <Failed className="icon-dim-16 mr-4" />
            stateClassName = 'bcr-1 er-2'
            break
        case DEPLOYMENT_ENV_TEXT.deploying:
            Icon = <div className="dc__app-summary__icon icon-dim-16 mr-6 progressing progressing--node" />
            stateClassName = 'bcy-1 ey-2'
            break
        default:
            break
    }

    return (
        <div className={`${stateClassName} br-4 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6`}>
            <span className="fw-4 fs-11 lh-16 flex">
                {Icon}
                {envStateText}
                <span className="fw-6 ml-4">{envName}</span>
            </span>
        </div>
    )
}
