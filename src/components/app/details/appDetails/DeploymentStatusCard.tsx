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
import { useHistory } from 'react-router-dom'
import Tippy from '@tippyjs/react'

import { DEPLOYMENT_STATUS_TEXT_MAP, PROGRESSING_DEPLOYMENT_STATUS } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as CD } from '../../../../assets/icons/ic-CD.svg'
import { ReactComponent as ICHelpOutline } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Rocket } from '../../../../assets/icons/ic-paper-rocket.svg'
import { DEPLOYMENT_STATUS_QUERY_PARAM } from '../../../../config'
import { DeploymentStatusCardType } from './appDetails.type'
import LoadingCard from './LoadingCard'
import { validateMomentDate } from './utils'

const DeploymentStatusCard = ({
    deploymentStatusDetailsBreakdownData,
    cardLoading,
    hideDetails,
    isVirtualEnvironment,
}: DeploymentStatusCardType) => {
    const history = useHistory()

    const showDeploymentDetailedStatus = (e): void => {
        e.stopPropagation()
        history.push({
            search: DEPLOYMENT_STATUS_QUERY_PARAM,
        })
    }

    const renderDeploymentStatus = () => {
        const { triggeredBy, deploymentStatus, deploymentTriggerTime } = deploymentStatusDetailsBreakdownData
        return (
            <>
                <div className="app-details-info-card__top-container flex">
                    <div className="app-details-info-card__top-container__content">
                        <div className="app-details-info-card__top-container__content__title-wrapper">
                            <div className="fs-12 fw-4 cn-7 mr-5">Deployment status</div>
                            <Tippy
                                className="default-tt"
                                arrow={false}
                                placement="top"
                                content="Status of last triggered deployment"
                                maxWidth={250}
                            >
                                <div className="flex">
                                    <ICHelpOutline className="icon-dim-16 mt-2" />
                                </div>
                            </Tippy>
                        </div>
                        <div className="flex fs-12 fw-4">
                            <span
                                data-testid="deployment-status-name"
                                className={`app-summary__status-name fs-13 mr-8 fw-6 f-${deploymentStatus?.toLowerCase()} ${
                                    PROGRESSING_DEPLOYMENT_STATUS.includes(deploymentStatus) ? 'dc__loading-dots' : ''
                                }`}
                            >
                                {DEPLOYMENT_STATUS_TEXT_MAP[deploymentStatus] || deploymentStatus}
                            </span>
                        </div>
                    </div>

                    {isVirtualEnvironment ? (
                        <Rocket className="icon-dim-24 mr-2" />
                    ) : (
                        <CD className="icon-dim-24 dc__flip-90 mr-2" />
                    )}
                </div>
                <div className="app-details-info-card__bottom-container dc__content-space">
                    <div className="app-details-info-card__bottom-container__message fs-12 fw-4">
                        <span className="fs-12 mr-5 fw-6">
                            {validateMomentDate(deploymentTriggerTime, 'YYYY-MM-DDTHH:mm:ssZ')}
                        </span>
                        by {triggeredBy || '-'}
                    </div>
                    {!hideDetails && (
                        <div
                            data-testid="deployment-status-details"
                            className="app-details-info-card__bottom-container__details fs-12 fw-6"
                        >
                            Details
                        </div>
                    )}
                </div>
            </>
        )
    }

    const onClickLastDeploymentStatus = (e) => {
        if (!hideDetails) {
            showDeploymentDetailedStatus(e)
        }
    }

    if (cardLoading) {
        return <LoadingCard wider />
    }

    return (
        <div
            data-testid="deployment-status-card"
            onClick={onClickLastDeploymentStatus}
            className={`app-details-info-card flex left bg__primary br-8 mr-12 lh-20 w-250 ${hideDetails ? '' : 'cursor'}`}
        >
            {renderDeploymentStatus()}
        </div>
    )
}

export default React.memo(DeploymentStatusCard)
