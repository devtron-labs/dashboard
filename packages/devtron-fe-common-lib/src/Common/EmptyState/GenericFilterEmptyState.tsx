/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import noResult from '@Images/empty-noresult@2x.png'
import GenericEmptyState from './GenericEmptyState'
import { GenericFilterEmptyStateProps } from './types'

/**
 * Empty state when no filters are applied
 */
const GenericFilterEmptyState = ({
    handleClearFilters,
    isButtonAvailable,
    renderButton,
    ...props
}: GenericFilterEmptyStateProps) => {
    const isClearFilterButtonAvailable = !!handleClearFilters

    const renderClearFilterButton = () => (
        <button type="button" onClick={handleClearFilters} className="cta secondary flex h-32 lh-20-imp">
            Clear Filters
        </button>
    )

    return (
        <GenericEmptyState
            image={noResult}
            title="No results"
            subTitle="We couldn’t find any matching results"
            {...props}
            isButtonAvailable={isClearFilterButtonAvailable || isButtonAvailable}
            renderButton={isClearFilterButtonAvailable ? renderClearFilterButton : renderButton}
        />
    )
}

export default GenericFilterEmptyState
