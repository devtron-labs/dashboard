import React from 'react'
import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import searchNullState from '../../../../../../assets/img/empty-noresult@2x.png'
import { FilterEmptyStateProps } from './types'

const FiltersEmptyState = ({ clearFilters }: FilterEmptyStateProps) => {
    const renderClearFilterButton = () => (
        <button type="button" onClick={clearFilters} className="cta secondary flex h-32">
            Clear Filters
        </button>
    )

    return (
        <GenericEmptyState
            image={searchNullState}
            title="No results"
            subTitle="We couldn’t find any matching results"
            isButtonAvailable
            renderButton={renderClearFilterButton}
            classname="flex-grow-1"
        />
    )
}

export default FiltersEmptyState
