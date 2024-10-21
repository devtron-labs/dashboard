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
import { ReactComponent as ICErrorCross } from '@Icons/ic-error-cross.svg'
import { ReactComponent as InfoIcon } from '../../Assets/Icon/ic-info-outlined.svg'
import { StatusConstants, YET_TO_RUN } from './constants'
import { AppStatusType } from './types'
import { triggerStatus } from './utils'

export default function AppStatus({
    appStatus,
    isDeploymentStatus = false,
    isJobView = false,
    isVirtualEnv,
    hideStatusMessage = false,
}: AppStatusType) {
    let status = appStatus
    if (isDeploymentStatus) {
        status = triggerStatus(appStatus)
    }
    const appStatusLowerCase = status?.toLowerCase()
    const isNotDeployed = appStatusLowerCase === StatusConstants.NOT_DEPLOYED.noSpaceLower
    const isNotReady = appStatus === StatusConstants.NOT_READY.normalCase
    const statusMessage = status || (isVirtualEnv ? StatusConstants.NOT_AVILABLE.normalCase : '-')
    const notDeployed = isJobView ? YET_TO_RUN : StatusConstants.NOT_DEPLOYED.normalCase
    const textContent = isNotDeployed ? notDeployed : statusMessage

    const getIconClass = () => {
        if (isNotDeployed) {
            return StatusConstants.NOT_DEPLOYED.lowerCase
        }
        if (isNotReady) {
            return StatusConstants.NOT_READY.lowerCase
        }
        return appStatusLowerCase
    }

    const iconClass = getIconClass()

    const renderIcon = () => {
        if (iconClass) {
            return iconClass === 'failed' || iconClass === 'error' ? (
                <ICErrorCross className="icon-dim-16 dc__no-shrink ic-error-cross-red" />
            ) : (
                <span className={`dc__app-summary__icon icon-dim-16 ${iconClass} ${iconClass}--node`} />
            )
        }
        if (isVirtualEnv) {
            return (
                <span
                    className={`dc__app-summary__icon icon-dim-16 ${StatusConstants.NOT_DEPLOYED.lowerCase} ${StatusConstants.NOT_DEPLOYED.lowerCase}--node`}
                />
            )
        }
        return (
            <Tippy
                className="default-tt w-200"
                arrow={false}
                placement="top"
                content="To fetch app status for GitOps based deployments open the app detail page"
            >
                <div className="flex">
                    <InfoIcon className="icon-dim-16 fcn-6" />
                </div>
            </Tippy>
        )
    }

    return hideStatusMessage ? (
        iconClass || isVirtualEnv ? (
            <Tippy className="default-tt" arrow={false} placement="top" content={textContent}>
                <div className="flex">{renderIcon()}</div>
            </Tippy>
        ) : (
            renderIcon()
        )
    ) : (
        <div className="flex left">
            <div className="flex mr-6">{renderIcon()}</div>
            <p data-testid={`${status}-app-status`} className="dc__truncate-text dc__first-letter-capitalize cn-6 m-0">
                {textContent}
            </p>
        </div>
    )
}
