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

import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { validateMomentDate } from './utils'
import { URLS } from '../../../../config'
import { LastUpdatedCardType } from './appDetails.type'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-clock-counterclockwise.svg'
import LoadingCard from './LoadingCard'

const LastUpdatedCard = ({ deploymentTriggerTime, triggeredBy, cardLoading }: LastUpdatedCardType) => {
    const history = useHistory()
    const match = useRouteMatch()

    const goToDeploymentHistory = () => {
        history.push(`${match.url.split(URLS.APP_DETAILS)[0]}${URLS.APP_DEPLOYMNENT_HISTORY}`)
    }

    if (cardLoading) {
        return <LoadingCard />
    }

    return (
        <div
            data-testid="last-updated-card"
            className="app-details-info-card cursor flex left bcn-0 br-8 mr-12 lh-20 w-200"
            onClick={goToDeploymentHistory}
        >
            <div className="app-details-info-card__top-container flex">
                <div className="app-details-info-card__top-container__content">
                    <div className="app-details-info-card__top-container__content__title-wrapper">
                        <div className="fs-12 fw-4 cn-7 mr-5" data-testid="last-updated-heading">
                            Last updated
                        </div>
                    </div>
                    <div className="dc__capitalize fw-6 fs-13 lh-20" data-testid="last-updated-time">
                        {validateMomentDate(deploymentTriggerTime, 'YYYY-MM-DDTHH:mm:ssZ')}
                    </div>
                </div>
                <div className="flex br-4">
                    <Timer className="icon-dim-24 mt-4" />
                </div>
            </div>
            <div className="app-details-info-card__bottom-container dc__content-space">
                <div className="app-details-info-card__bottom-container__message fs-12 fw-4">
                    by {triggeredBy || '-'}
                </div>
                <div className="app-details-info-card__bottom-container__details fs-12 fw-6">Details</div>
            </div>
        </div>
    )
}

export default React.memo(LastUpdatedCard)
