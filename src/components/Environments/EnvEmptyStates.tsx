import React from 'react'
import EmptyState from '../EmptyState/EmptyState'
import emptyNoResults from '../../assets/img/empty-noresult@2x.png'
import { EmptyEnvState } from './EnvironmentGroup.types'
import { EMPTY_LIST_MESSAGING } from './Constants'

export default function EnvEmptyStates({ title, subTitle, actionHandler }: EmptyEnvState) {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={emptyNoResults} alt={EMPTY_LIST_MESSAGING.EMPTY_ENV} />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4 className="title">{title || EMPTY_LIST_MESSAGING.NO_MATCHING_ENV}</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>{subTitle || EMPTY_LIST_MESSAGING.NO_MATCHING_RESULT}</EmptyState.Subtitle>
            {actionHandler && (
                <EmptyState.Button>
                    <button onClick={actionHandler} className="add-link cta flex">
                        Clear search
                    </button>
                </EmptyState.Button>
            )}
        </EmptyState>
    )
}
