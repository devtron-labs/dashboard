import React from 'react'
import { GenericFilterEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { FilterEmptyStateProps } from './types'

const FiltersEmptyState = ({ clearFilters }: FilterEmptyStateProps) => {
    const renderClearFilterButton = () => (
        <button type="button" onClick={clearFilters} className="cta secondary flex h-32">
            Clear Filters
        </button>
    )

    return <GenericFilterEmptyState isButtonAvailable renderButton={renderClearFilterButton} classname="flex-grow-1" />
}

export default FiltersEmptyState
