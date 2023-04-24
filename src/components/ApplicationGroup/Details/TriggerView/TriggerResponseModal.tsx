import React from 'react'
import { Progressing, sortCallback } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as RetryIcon } from '../../../../assets/icons/ic-arrow-clockwise.svg'
import { ReactComponent as Success } from '../../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as UnAuthorized } from '../../../../assets/icons/ic-locked.svg'
import { ResponseRowType, TriggerResponseModalType } from '../../AppGroup.types'
import { BulkResponseStatus } from '../../Constants'

export default function TriggerResponseModal({
    closePopup,
    responseList,
    isLoading,
    onClickRetryBuild,
}: TriggerResponseModalType) {
    const isShowRetryButton = responseList?.some((response) => response.status === BulkResponseStatus.FAIL)
    const renderStatusIcon = (response: ResponseRowType): JSX.Element => {
        if (response.status === BulkResponseStatus.UNAUTHORIZE) {
            return <UnAuthorized className="mr-8 icon-dim-18 fcy-7" />
        } else if (response.status === BulkResponseStatus.PASS) {
            return <Success className="mr-8 icon-dim-18" />
        } else {
            return <Error className="mr-8 icon-dim-18" />
        }
    }
    const renderResponseBodySection = (): JSX.Element => {
        if (isLoading) {
            return <Progressing pageLoader />
        }
        return (
            <div className="response-list-container bcn-0 dc__height-inherit dc__overflow-auto pr-20 pb-16 pl-20">
                <div
                    className="dc__position-sticky dc__top-0 bcn-0 dc__border-bottom response-row dc__border-bottom pt-24 pb-8"
                    style={{ zIndex: 1 }}
                >
                    <div className="fs-12 fw-6 cn-7">Application</div>
                    <div className="fs-12 fw-6 cn-7">Trigger status</div>
                    <div className="fs-12 fw-6 cn-7">Message</div>
                </div>
                {responseList
                    .sort((a, b) => sortCallback('appName', a, b))
                    .map((response, index) => (
                        <div className="response-row pt-8 pb-8" key={`response-${response.appId}`}>
                            <div className="fs-13 fw-4 cn-9">{response.appName}</div>
                            <div className="flex left top fs-13 fw-4 cn-9">
                                {renderStatusIcon(response)}
                                <span data-testid={`response-status-text-${index}`}>{response.statusText}</span>
                            </div>
                            <div className="fs-13 fw-4 cn-9">{response.message}</div>
                        </div>
                    ))}
            </div>
        )
    }

    const handleRetryBuild = (): void => {
        const appsToRetry: Record<string, boolean> = {}
        for (const response of responseList) {
            if (response.status === BulkResponseStatus.FAIL) {
                appsToRetry[response.appId] = true
            }
        }
        onClickRetryBuild(appsToRetry)
    }

    const renderFooterSection = (): JSX.Element => {
        return (
            <div
                className={`dc__border-top flex bcn-0 pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0 env-modal-width ${
                    isShowRetryButton ? 'dc__content-space' : 'right'
                }`}
            >
                <button className="cta cancel flex h-36" data-testid="close-popup" onClick={closePopup}>
                    Close
                </button>
                {isShowRetryButton && (
                    <button className="cta flex h-36" onClick={handleRetryBuild}>
                        {isLoading ? (
                            <Progressing />
                        ) : (
                            <>
                                <RetryIcon className="icon-dim-16 dc__no-svg-fill scn-0 mr-8" />
                                Retry Failed
                            </>
                        )}
                    </button>
                )}
            </div>
        )
    }

    return (
        <>
            {renderResponseBodySection()}
            {renderFooterSection()}
        </>
    )
}
