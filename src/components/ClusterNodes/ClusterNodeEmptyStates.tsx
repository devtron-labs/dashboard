import { GenericFilterEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'

export default function ClusterNodeEmptyState({
    title,
    actionHandler,
}: {
    title?: string
    actionHandler?: () => void
}) {
    return (
        <GenericFilterEmptyState
            title={title || 'No matching clusters'}
            handleClearFilters={actionHandler}
            classname="dc__position-rel-imp"
        />
    )
}
