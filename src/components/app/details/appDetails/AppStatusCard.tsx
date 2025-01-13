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
import Tippy from '@tippyjs/react'
import ReactGA from 'react-ga4'
import { AppType, DeploymentAppTypes } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICHelpOutline } from '../../../../assets/icons/ic-help-outline.svg'
import { AppStatusCardType } from './appDetails.type'
import LoadingCard from './LoadingCard'
import './appDetails.scss'

const AppStatusCard = ({ appDetails, status, cardLoading, setDetailed, message }: AppStatusCardType) => {
    const isHibernated = ['hibernating', 'hibernated'].includes(status.toLowerCase())
    const isFluxCDApp = appDetails?.appType === AppType.EXTERNAL_FLUX_APP
    const displayMessage = message && (appDetails?.deploymentAppType === DeploymentAppTypes.HELM || isFluxCDApp)

    const showApplicationDetailedModal = (): void => {
        setDetailed && setDetailed(true)
        ReactGA.event({
            category: 'App Details',
            action: 'App Status clicked',
        })
    }

    const renderBottomContainer = () => {
        return (
            <div className="flexbox dc__content-space w-100">
                {displayMessage && (
                    <Tippy className="default-tt dc__mxw-200-imp" placement="bottom" content={message} arrow={false}>
                        <div className="app-details-info-card__bottom-container__message fs-12 fw-4 dc__ellipsis-right dc__mxw-175">
                            {message}
                        </div>
                    </Tippy>
                )}
                <div
                    className={`app-details-info-card__bottom-container__details fs-12 fw-6 ${
                        displayMessage ? 'ml-4' : ''
                    }`}
                >
                    Details
                </div>
            </div>
        )
    }

    if (cardLoading) {
        return <LoadingCard wider={displayMessage} />
    }

    return (
        <div
            data-testid="app-status-card"
            onClick={showApplicationDetailedModal}
            className={`app-details-info-card pointer flex left bg__primary br-8 mr-12 lh-20 ${
                displayMessage ? 'w-250' : 'w-200'
            }`}
        >
            <div className="app-details-info-card__top-container flex">
                <div className="app-details-info-card__top-container__content">
                    <div className="app-details-info-card__top-container__content__title-wrapper">
                        {/* In case of flux apps Application Status is shown as Status */}
                        <div className="fs-12 fw-4 cn-7 mr-5">{isFluxCDApp ? 'Status' : 'Application Status'}</div>
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="top"
                            content={`The ${isFluxCDApp ? '' : 'health'} status of your app`}
                        >
                            <div className="flex">
                                <ICHelpOutline className="icon-dim-16" />
                            </div>
                        </Tippy>
                    </div>
                    <div className="flex fs-12 fw-4">
                        <div className={`fs-13 fw-6 lh-20 f-${status.toLowerCase()}`}>
                            {isHibernated ? 'Hibernating' : status}
                        </div>
                    </div>
                </div>
                <div className="flex br-4">
                    <figure
                        className={`dc__app-summary__icon dc__zi-0 ${status.toLowerCase().replace(/ /g, '-')} h-24 w-24 dc__bs-contain m-auto`}
                    />
                </div>
            </div>
            <div className="app-details-info-card__bottom-container">{renderBottomContainer()}</div>
        </div>
    )
}

export default React.memo(AppStatusCard)
