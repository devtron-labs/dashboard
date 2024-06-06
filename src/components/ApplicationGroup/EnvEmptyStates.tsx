import React from 'react'
import { GenericEmptyState, GenericFilterEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { EMPTY_LIST_MESSAGING } from './Constants'
import { EmptyEnvState } from './AppGroup.types'

export default function EnvEmptyStates({ title, subTitle, actionHandler }: EmptyEnvState) {
    return <GenericFilterEmptyState handleClearFilters={actionHandler} />
}
