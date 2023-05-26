import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import emptyImage from '../../../assets/img/empty-noresult@2x.png'

interface EmptyChartType {
    title?: string
    subTitle?: string
    onClickViewChartButton: () => void
    buttonText?: string
    heightToDeduct?: number
    children?: React.ReactNode
}

function ChartEmptyState({
    title,
    subTitle,
    onClickViewChartButton,
    buttonText,
    heightToDeduct,
}: EmptyChartType) {
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
            <GenericEmptyState
                image={emptyImage}
                title={title || 'No matching charts'}
                subTitle={subTitle || "We couldn't find any matching results"}
                isButtonAvailable={true}
                renderButton={renderButton}
            ></GenericEmptyState>
        </span>
    )
}

export default ChartEmptyState
