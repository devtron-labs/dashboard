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
import { GenericEmptyState, ImageType } from '../../../Common'
import AppNotDeployed from '../../../Assets/Img/app-not-deployed.png'
import { EMPTY_STATE_STATUS } from '../../constants'

const CDEmptyState = ({
    imgSource,
    title,
    subtitle,
    ActionButtonIcon,
    actionButtonClass,
    actionButtonIconRight,
    actionButtonText,
    actionHandler,
    dataTestId,
}: {
    imgSource?: string
    title?: string
    subtitle?: string
    actionButtonClass?: string
    ActionButtonIcon?: React.FunctionComponent<any>
    actionButtonIconRight?: boolean
    actionButtonText?: string
    actionHandler?: () => void
    dataTestId?: string
}) => {
    const handleCDEmptyStateButton = () =>
        actionButtonText ? (
            <button
                type="button"
                className={`${actionButtonClass || ''} cta secondary flex h-32`}
                onClick={actionHandler}
                data-testid={dataTestId}
            >
                {ActionButtonIcon && !actionButtonIconRight && <ActionButtonIcon className="add-icon" />}
                {actionButtonText}
                {ActionButtonIcon && actionButtonIconRight && <ActionButtonIcon className="icon-dim-16 ml-8" />}
            </button>
        ) : null
    return (
        <div className="dc__position-rel" style={{ backgroundColor: 'var(--window-bg)' }}>
            <GenericEmptyState
                image={imgSource || AppNotDeployed}
                classname="fs-16"
                title={title || EMPTY_STATE_STATUS.CD_EMPTY_STATE.TITLE}
                subTitle={subtitle || EMPTY_STATE_STATUS.CD_EMPTY_STATE.SUBTITLE}
                isButtonAvailable
                imageType={ImageType.Large}
                renderButton={handleCDEmptyStateButton}
            />
        </div>
    )
}

export default CDEmptyState
