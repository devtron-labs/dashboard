import React from 'react'
import emptyNoResults from '../../assets/img/empty-noresult@2x.png'
import { EMPTY_LIST_MESSAGING } from './Constants'
import { EmptyEnvState } from './AppGroup.types'
import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'

export default function EnvEmptyStates({ title, subTitle, actionHandler }: EmptyEnvState) {
    const EnvEmptyStatesButton = () => {
        return (
            actionHandler ? (
                <button onClick={actionHandler} className="saved-filter__clear-btn dc__saved-filter__clear-btn--dark">
                    Clear filters
                </button>
            ) : null
        )
    }
    return (
        <GenericEmptyState
            image={emptyNoResults}
            title={title || EMPTY_LIST_MESSAGING.NO_MATCHING_ENV}
            subTitle={subTitle || EMPTY_LIST_MESSAGING.NO_MATCHING_RESULT}
            isButtonAvailable={true}
            renderButton={EnvEmptyStatesButton}
        />
    )
}
