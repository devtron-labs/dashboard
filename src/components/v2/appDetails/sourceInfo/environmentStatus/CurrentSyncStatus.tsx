import Tippy from '@tippyjs/react'
import React from 'react'
import { ReactComponent as Question } from '../../../../../assets/icons/ic-help-outline.svg'

function CurrentSyncStatus({ status, loadingResourceTree }) {

    const renderStatusBlock = () => {
        return (
            <div className="app-status-card bcn-0 mr-12 br-8 p-16 cursor  ">
                <div className="cn-9 flex left">
                    <span data-testid="application-status-heading">Application status</span>
                    <Tippy className="default-tt cursor" arrow={false} content={'The health status of your app'}>
                        <Question className="cursor icon-dim-16 ml-4" />
                    </Tippy>
                </div>
                {loadingResourceTree ? (
                    <div className="flex left column mt-6">
                        <div className="shimmer-loading w-80px h-16 br-2 mb-6" />
                        <div className="shimmer-loading w-60 h-12 br-2" />
                    </div>
                ) : (
                    <>
                        <div className={`f-${status.toLowerCase()} dc__capitalize fw-6 fs-14 flex left`}>
                            <span data-testid="application-status-app-details">{status}</span>
                            <figure
                                className={`${status.toLowerCase()} dc__app-summary__icon ml-8 icon-dim-20`}
                            ></figure>
                        </div>
                        <div>
                            <span className="details-hover cb-5 fw-6" data-testid="details-button-app-details">
                                Details
                            </span>
                        </div>
                    </>
                )}
            </div>
        )
    }
    return <div>{renderStatusBlock}</div>
}

export default CurrentSyncStatus
