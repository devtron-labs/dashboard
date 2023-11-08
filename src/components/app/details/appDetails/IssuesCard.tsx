import React from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { DeploymentAppTypes, noop } from '@devtron-labs/devtron-fe-common-lib'

import { IssuesCardType } from './appDetails.type'

export const IssuesCard = ({ hideDetails, loadingResourceTree, showIssuesListingModal }: IssuesCardType) => {
    return (
        <div
            data-testid="issues-card"
            onClick={loadingResourceTree ? noop : showIssuesListingModal}
            className="app-details-info-card pointer flex left bcn-0 br-8 mr-12 lh-20 w-200"
        >
            <div className="app-details-info-card__top-container flex">
                <div className="app-details-info-card__top-container__content">
                    <div className="app-details-info-card__top-container__content__title-wrapper">
                        <div className="fs-12 fw-4 cn-7 mr-5">Issues</div>
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="top"
                            content="Status of last triggered deployment" // @TODO: update this copy
                        >
                            <Question className="icon-dim-16 mt-2" />
                        </Tippy>
                    </div>
                    <div className="app-details-info-card__top-container__content__commit-text-wrapper flex fs-12 fw-4">
                        <div className="fs-13 fw-6  lh-20 f-degraded">3 Errors found</div>
                    </div>
                </div>
                <Error className="form__icon--error icon-dim-24" />
            </div>
            <div className="app-details-info-card__bottom-container">
                {/* @TODO: Get these error titles from api response */}
                <span className="app-details-info-card__bottom-container__message fs-12 fw-4">
                    SyncError, OutOfSyncError
                </span>
                {!hideDetails && (
                    <div className="app-details-info-card__bottom-container__details fs-12 fw-6">Details</div>
                )}
            </div>
        </div>
    )
}

export default React.memo(IssuesCard)
