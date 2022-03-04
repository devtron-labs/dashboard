import React from 'react';
import EmptyState from '../../EmptyState/EmptyState';
import emptyImage from '../../../assets/img/empty-noresult@2x.png';

function ChartEmptyState({title, subTitle, onClickViewChartButton, buttonText}) {
    return (
        <span className="empty-height">
            <EmptyState>
                <EmptyState.Image>
                    <img src={emptyImage} alt="" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h4>{title}</h4>
                </EmptyState.Title>
                <EmptyState.Subtitle>
                    {subTitle}
                </EmptyState.Subtitle>
                <button type="button" onClick={onClickViewChartButton} className="cta ghosted mb-24 mt-10">
                    {buttonText}
                </button>
            </EmptyState>
        </span>
    );
}

export default ChartEmptyState;
