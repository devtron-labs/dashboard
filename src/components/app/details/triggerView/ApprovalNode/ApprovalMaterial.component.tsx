import React, { useState } from 'react'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { getAlphabetIcon, noop } from '../../../../common'
import { ApprovalRequestType, ApprovedTippyContentProps } from './Types'

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
        <div className="pl-12 pr-12 h-100 dc__overflow-hidden">
            <div className="pt-12 pb-12 h-100 mxh-210 dc__overflow-scroll">
                <div>
                    <h5 className="fs-13 fw-6 lh-20 mt-0 mb-8">Approval requested by</h5>
                    <span className="flex left mb-8">
                        {getAlphabetIcon(userApprovalMetadata?.requestedUserData?.userEmail)}
                        {requestedBySelf ? 'You' : userApprovalMetadata?.requestedUserData?.userEmail}
                        {requestedBySelf && !cancelState && (
                            <span
                                className="fs-13 fw-6 lh-20 cr-5 ml-auto cursor"
                                onClick={requestInProgress ? noop : toggleCancelRequest}
                            >
                                {requestInProgress ? <Progressing size={24} /> : 'Cancel'}
                            </span>
                        )}
                    </span>
                    {cancelState && (
                        <div className="flex top left fs-13 fw-4 lh-20">
                            <span className="cn-9 mr-12">Are you sure you want to cancel the request?</span>
                            <div className="ml-auto fw-6">
                                <span
                                    className="mr-12 cb-5 cursor"
                                    data-id={`cancel-approved-request-${matId}`}
                                    data-request-id={userApprovalMetadata?.approvalRequestId}
                                    data-request-type={ApprovalRequestType.CANCEL}
                                    onClick={handleCancelRequest}
                                >
                                    Yes
                                </span>
                                <span className="cn-7 cursor" onClick={toggleCancelRequest}>
                                    No
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-12">
                    <h5 className="fs-13 fw-6 lh-20 mt-0 mb-8">Approved by</h5>
                    {imageApproved ? (
                        <ol className="p-0 dc__list-style-none">
                            {userApprovalMetadata.approvedUsersData.map((_approver) => {
                                return (
                                    <li key={_approver.userEmail} className="flex left mb-8">
                                        {getAlphabetIcon(_approver.userEmail)}
                                        {_approver.userId === requestedUserId ? 'You' : _approver.userEmail}
                                    </li>
                                )
                            })}
                        </ol>
                    ) : (
                        <span className="fs-13 fw-4 lh-20 cn-7">This image has not received any approvals.</span>
                    )}
                </div>
            </div>
        </div>
    )
}
