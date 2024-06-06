import React from 'react'
import { GenericEmptyState, GenericFilterEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { EMPTY_LIST_MESSAGING } from './Constants'
import { EmptyEnvState } from './AppGroup.types'

export default function EnvEmptyStates({ title, subTitle, actionHandler }: EmptyEnvState) {
    const EnvEmptyStatesButton = () => {
        return actionHandler ? (
            <button onClick={actionHandler} className="saved-filter__clear-btn dc__saved-filter__clear-btn--dark">
                Clear filters
            </button>
        ) : null
    }
    return (
        <GenericFilterEmptyState
            title={title || EMPTY_LIST_MESSAGING.NO_MATCHING_ENV}
            subTitle={subTitle || EMPTY_LIST_MESSAGING.NO_MATCHING_RESULT}
            isButtonAvailable
            renderButton={EnvEmptyStatesButton}
        />
    )
}
