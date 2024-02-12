import React from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../../assets/icons/ic-question.svg'
import LoadingCard from '../../../../app/details/appDetails/LoadingCard'
import { HelmAppConfigApplyStatusCardType } from '../environment.type'

const HelmAppConfigApplyStatusCard = ({ releaseStatus, cardLoading }: HelmAppConfigApplyStatusCardType) => {
    if (cardLoading) {
        return <LoadingCard wider />
    }

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
                            content="Whether or not your last helm install was successful"
                        >
                            <div className="flex">
                                <Question className="cursor icon-dim-16 ml-4" />
                            </div>
                        </Tippy>
                    </div>
                    <div className={`f-${releaseStatus['status'].toLowerCase()} dc__capitalize fw-6 fs-14 lh-20`}>
                        {releaseStatus['status']}
                    </div>
                </div>
                <div className="flex br-4">
                    <figure className={`${releaseStatus['status'].toLowerCase()}  ml-8 icon-dim-24`} />
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
