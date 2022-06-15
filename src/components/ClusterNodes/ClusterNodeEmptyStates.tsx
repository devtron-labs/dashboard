import React from 'react'
import EmptyState from '../EmptyState/EmptyState'
import emptyCustomChart from '../../assets/img/empty-noresult@2x.png'

export default function ClusterNodeEmptyState({
    title,
    actionHandler,
}: {
    title?: string
    actionHandler?: () => void
}) {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={emptyCustomChart} alt="Empty external links" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4 className="title">{title || 'No matching clusters'}</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>We couldn’t find any matching results</EmptyState.Subtitle>
            <EmptyState.Button>
                <button onClick={actionHandler} className="add-link cta flex">
                    Clear search
                </button>
            </EmptyState.Button>
        </EmptyState>
    )
}
