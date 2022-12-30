import React from 'react'
import EmptyState from '../../EmptyState/EmptyState'
import emptyCustomChart from '../../../assets/img/empty-noresult@2x.png'

export default function ResourceListEmptyState({
    title,
    subTitle,
    actionHandler,
}: {
    title?: string
    subTitle: string
    actionHandler?: () => void
}) {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={emptyCustomChart} alt="No resources found" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4 className="title">{title || 'No resources found'}</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>{subTitle}</EmptyState.Subtitle>
            {actionHandler && <EmptyState.Button>
                <button onClick={actionHandler} className="add-link cta flex">
                    Clear filters
                </button>
            </EmptyState.Button>}
        </EmptyState>
    )
}
