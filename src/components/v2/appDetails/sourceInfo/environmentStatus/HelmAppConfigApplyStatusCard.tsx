import React from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../../assets/icons/ic-question.svg'
import { ReactComponent as Success } from '../../../../../assets/icons/ic-success.svg'

function HelmAppConfigApplyStatusCard({ releaseStatus }) {
    return releaseStatus ? (
        <div
            data-testid="helm-config-apply-status-card"
            className="app-details-info-card pointer flex left bcn-0 br-8 mr-12 lh-20 w-250"
        >
            <div className="app-details-info-card__top-container flex">
                <div className="app-details-info-card__top-container__content">
                    <div className="app-details-info-card__top-container__content__title-wrapper">
                        <div className="fs-12 fw-4 cn-7 mr-5">Config apply status</div>
                        <Tippy
                            className="default-tt cursor"
                            arrow={false}
                            content={'Whether or not your last helm install was successful'}
                        >
                            <Question className="cursor icon-dim-16 ml-4" />
                        </Tippy>
                    </div>
                    <div className={`f-${releaseStatus['status'].toLowerCase()} dc__capitalize fw-6 fs-14 lh-20`}>
                        {releaseStatus['status']}
                    </div>
                </div>
                <div className="flex br-4">
                    <figure
                        className={`${releaseStatus['status'].toLowerCase()} dc__app-summary__icon ml-8 icon-dim-24`}
                    ></figure>
                </div>
            </div>
            <div className="app-details-info-card__bottom-container">
                <div className="app-details-info-card__bottom-container__message fs-12 fw-4">
                    {releaseStatus['message']}
                </div>
            </div>
        </div>
    ) : null
}

export default HelmAppConfigApplyStatusCard
