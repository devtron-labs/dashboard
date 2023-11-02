import React from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'

import { IssuesCardType } from './appDetails.type'

export const IssuesCard = ({ hideDetails }: IssuesCardType) => {
    return (
        <div data-testid="issues-card" className="app-details-info-card flex left bcn-0 br-8 mr-12">
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
                        <div className="fs-13 fw-6  lh-20 f-degraded">
                            3 Errors found
                        </div>
                    </div>
                </div>
                <Error className="form__icon--error app-details-info-card__top-container__error-icon" />
            </div>
            <div className="app-details-info-card__bottom-container flex">
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

export default IssuesCard
