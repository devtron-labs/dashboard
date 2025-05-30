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

import React, { useMemo } from 'react'
import Tippy from '@tippyjs/react'
import ReactGA from 'react-ga4'
import { AppStatus, AppType, StatusType, LoadingCard, getAIAnalyticsEvents } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICHelpOutline } from '../../../../assets/icons/ic-help-outline.svg'
import { AppStatusCardType } from './appDetails.type'
import './appDetails.scss'
import { importComponentFromFELibrary } from '@Components/common'

const ExplainWithAIButton = importComponentFromFELibrary('ExplainWithAIButton', null, 'function')

const AppStatusCard = ({ appDetails, status, cardLoading, setDetailed, message }: AppStatusCardType) => {
    const isHibernated = ['hibernating', 'hibernated'].includes(status.toLowerCase())
    const isFluxCDApp = appDetails?.appType === AppType.EXTERNAL_FLUX_APP
    const isStatusHealthy = useMemo(() => status.toLowerCase() === StatusType.HEALTHY.toLowerCase(), [status])

    const debugNode = appDetails.resourceTree?.nodes?.find(
        (node) => node.kind === 'Deployment' || node.kind === 'Rollout',
    )
    const debugObject = `${debugNode?.kind}/${debugNode?.name}`

    const showApplicationDetailedModal = (): void => {
        setDetailed && setDetailed(true)
        ReactGA.event({
            category: 'App Details',
            action: 'App Status clicked',
        })
    }

    const renderBottomContainer = () => {
        return (
            <div className="flexbox dc__content-space dc__gap-4 w-100">
                {isStatusHealthy && message && (
                    <Tippy className="default-tt dc__mxw-200-imp" placement="bottom" content={message} arrow={false}>
                        <div className="app-details-info-card__bottom-container__message fs-12 fw-4 dc__ellipsis-right dc__mxw-175">
                            {message}
                        </div>
                    </Tippy>
                )}
                <div className="app-details-info-card__bottom-container__details fs-12 fw-6">Details</div>
                {ExplainWithAIButton && !isStatusHealthy && (debugNode || message) && (
                    <ExplainWithAIButton
                        intelligenceConfig={{
                            clusterId: appDetails.clusterId,
                            metadata: {
                                ...(debugNode ? { object: debugObject } : { message }),
                                namespace: appDetails.namespace,
                                status: debugNode?.health?.status ?? appDetails.appStatus,
                            },
                            prompt: `Debug ${message || 'error'} ${debugNode ? `of ${debugObject}` : ''} in ${appDetails.namespace}`,
                            analyticsCategory: getAIAnalyticsEvents('APP_STATUS', appDetails.appType),
                        }}
                    />
                )}
            </div>
        )
    }

    if (cardLoading) {
        return <LoadingCard />
    }

    return (
        <div
            data-testid="app-status-card"
            onClick={showApplicationDetailedModal}
            className="app-details-info-card pointer flex left bg__primary br-8 mr-12 lh-20 w-200"
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
                        <div className={`fs-13 fw-6 lh-20 app-summary__status-name f-${status.toLowerCase()}`}>
                            {isHibernated ? 'Hibernating' : status}
                        </div>
                    </div>
                </div>
                <AppStatus status={status} iconSize={24} hideMessage showAnimatedIcon hideIconTooltip />
            </div>
            <div className="app-details-info-card__bottom-container">{renderBottomContainer()}</div>
        </div>
    )
}

export default React.memo(AppStatusCard)
