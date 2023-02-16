import React from 'react'
import EmptyState from '../EmptyState/EmptyState'
import emptyNoResults from '../../assets/img/empty-noresult@2x.png'

export default function EnvEmptyStates({
    title,
    subTitle,
    actionHandler,
}: {
    title?: string
    subTitle?: string
    actionHandler?: () => void
}) {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={emptyNoResults} alt="Empty environment" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4 className="title">{title || 'No matching env'}</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>{subTitle || 'We couldn’t find any matching results'}</EmptyState.Subtitle>
            <EmptyState.Button>
                <button onClick={actionHandler} className="add-link cta flex">
                    Clear search
                </button>
            </EmptyState.Button>
        </EmptyState>
    )
}
