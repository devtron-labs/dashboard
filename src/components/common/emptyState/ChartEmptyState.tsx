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
    const renderButton = () => {
        return (
            <button type="button" onClick={onClickViewChartButton} className="cta ghosted flex mb-24 mt-10">
                {buttonText || 'View all charts'}
            </button>
        )
    }
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
