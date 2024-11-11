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

import { SortingOrder } from '../../Constants'

export interface UseUrlFiltersProps<T, K> {
    /**
     * The key on which the sorting should be applied
     */
    initialSortKey?: T
    /**
     * Callback function for parsing the search params
     */
    parseSearchParams?: (searchParams: URLSearchParams) => K
    localStorageKey?: `${string}__${string}`
}

export type UseUrlFiltersReturnType<T, K = unknown> = K & {
    /**
     * Currently applied page size
     */
    pageSize: number
    /**
     * Handler for updating the current page
     */
    changePage: (pageNumber: number) => void
    /**
     * Handler for updating the current page size
     */
    changePageSize: (pageSize: number) => void
    /**
     * Current search key
     */
    searchKey: string
    /**
     * Handler for updating the search
     */
    handleSearch: (searchKey: string) => void
    /**
     * Computed offset using the pageSize and pageNumber
     *
     * Note: Used in pagination component
     */
    offset: number
    /**
     * Key on which the sorting is applied
     */
    sortBy: T
    /**
     * Current sort order
     */
    sortOrder: SortingOrder
    /**
     * Handle the sorting type change / key change
     */
    handleSorting: (sortBy: T) => void
    /**
     * Clear all the applied filters
     */
    clearFilters: () => void
    /**
     * Update the search params with the passed object
     */
    updateSearchParams: (paramsToSerialize: Partial<K>) => void
}
