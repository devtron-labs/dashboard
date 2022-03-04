import React from 'react';
import EmptyState from '../../EmptyState/EmptyState';
import emptyImage from '../../../assets/img/empty-noresult@2x.png';

interface EmptyChartType {
    title?: string;
    subTitle?: string;
    onClickViewChartButton: () => void;
    buttonText?: string;
    heightToDeduct?: number;
}

function ChartEmptyState({ title, subTitle, onClickViewChartButton, buttonText, heightToDeduct }: EmptyChartType) {
    return (
        <span
            className="empty-height"
            {...(heightToDeduct >= 0 && { style: { height: `calc(100vh - ${heightToDeduct}px)` } })}
        >
            <EmptyState>
                <EmptyState.Image>
                    <img src={emptyImage} alt="No Result" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h4>{title || 'No matching charts'}</h4>
                </EmptyState.Title>
                <EmptyState.Subtitle>{subTitle || "We couldn't find any matching results"}</EmptyState.Subtitle>
                <button type="button" onClick={onClickViewChartButton} className="cta ghosted mb-24 mt-10">
                    {buttonText || 'View all charts'}
                </button>
            </EmptyState>
        </span>
    );
}

export default ChartEmptyState;
