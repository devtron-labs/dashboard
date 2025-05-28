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

import { Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import LoadingCard from '../../../../app/details/appDetails/LoadingCard'
import { ReactComponent as QuestionIcon } from '../../../assets/icons/ic-question.svg'
import { HelmAppConfigApplyStatusCardType } from '../environment.type'

const HelmAppConfigApplyStatusCard = ({ releaseStatus, cardLoading }: HelmAppConfigApplyStatusCardType) => {
    if (cardLoading) {
        return <LoadingCard wider />
    }

    return releaseStatus ? (
        <div
            data-testid="helm-config-apply-status-card"
            className="app-details-info-card flex left bg__primary br-8 mr-12 w-200"
        >
            <div className="app-details-info-card__top-container flexbox dc__gap-12">
                <div className="app-details-info-card__top-container__content">
                    <div className="app-details-info-card__top-container__content__title-wrapper dc__gap-4">
                        <p className="m-0 fs-12 lh-20 fw-4 cn-7">Config apply status</p>
                        <Tippy
                            className="default-tt cursor"
                            arrow={false}
                            content="Whether or not your last helm install was successful"
                        >
                            <div className="flex cursor">
                                <QuestionIcon className="icon-dim-16" />
                            </div>
                        </Tippy>
                    </div>
                    <p className={`f-${releaseStatus.status.toLowerCase()} m-0 dc__capitalize fw-6 fs-13 lh-20`}>
                        {releaseStatus.status}
                    </p>
                </div>
                <div className="flex br-4">
                    <figure className={`${releaseStatus.status.toLowerCase()} icon-dim-24 dc__bs-contains`} />
                </div>
            </div>
            <div className="app-details-info-card__bottom-container">
                <Tooltip interactive content={releaseStatus.message} placement="bottom">
                    <p className="dc__truncate m-0 fs-12 lh-18 fw-4 cn-9">{releaseStatus.message}</p>
                </Tooltip>
            </div>
        </div>
    ) : null
}

export default HelmAppConfigApplyStatusCard
