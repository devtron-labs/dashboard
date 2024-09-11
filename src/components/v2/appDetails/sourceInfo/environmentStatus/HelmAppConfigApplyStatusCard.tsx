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

import Tippy from '@tippyjs/react'
import { ReactComponent as QuestionIcon } from '../../../assets/icons/ic-question.svg'
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
                                <QuestionIcon className="cursor icon-dim-16 ml-4" />
                            </div>
                        </Tippy>
                    </div>
                    <div className={`f-${releaseStatus.status.toLowerCase()} dc__capitalize fw-6 fs-13 lh-20`}>
                        {releaseStatus.status}
                    </div>
                </div>
                <div className="flex br-4">
                    <figure className={`${releaseStatus.status.toLowerCase()} ml-8 icon-dim-24`} />
                </div>
            </div>
            <div className="app-details-info-card__bottom-container">
                <div className="app-details-info-card__bottom-container__message fs-12 fw-4">
                    {releaseStatus.message}
                </div>
            </div>
        </div>
    ) : null
}

export default HelmAppConfigApplyStatusCard
