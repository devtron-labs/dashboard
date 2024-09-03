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

import { GenericFilterEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { EMPTY_STATE_STATUS } from '../../../config/constantMessaging'

interface EmptyChartType {
    title?: string
    subTitle?: string
    onClickViewChartButton: () => void
    buttonText?: string
    heightToDeduct?: number
    children?: React.ReactNode
}

const ChartEmptyState = ({ title, subTitle, onClickViewChartButton, buttonText, heightToDeduct }: EmptyChartType) => {
    const renderButton = () => (
        <button type="button" onClick={onClickViewChartButton} className="cta ghosted flex">
            {buttonText || 'View all charts'}
        </button>
    )
    return (
        <span
            className="empty-height"
            {...(heightToDeduct >= 0 && { style: { height: `calc(100vh - ${heightToDeduct}px)` } })}
        >
            <GenericFilterEmptyState
                title={title || EMPTY_STATE_STATUS.CHART_EMPTY_STATE.TITLE}
                subTitle={subTitle || EMPTY_STATE_STATUS.CHART_EMPTY_STATE.SUBTITLE}
                isButtonAvailable
                renderButton={renderButton}
            />
        </span>
    )
}

export default ChartEmptyState
