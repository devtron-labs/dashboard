import { useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { DEFAULT_BASE_PAGE_SIZE, SortingOrder } from '../../../../../config'

const DEFAULT_PAGE_NUMBER = 1

// These are not intended to be consumed anywhere else
const URL_KEYS = {
    PAGE_SIZE: 'pageSize',
    PAGE_NUMBER: 'pageNumber',
    SEARCH_KEY: 'searchKey',
    SORT_BY: 'sortBy',
    SORT_ORDER: 'sortOrder',
}

const { PAGE_SIZE, PAGE_NUMBER, SEARCH_KEY, SORT_BY, SORT_ORDER } = URL_KEYS

/**
 * Generic hook for implementing URL based filters.
 * eg: pagination, search, sort.
 *
 * The exposed handlers can be consumed directly without the need for explicit state management
 *
 * @example Default Usage:
 * ```tsx
 * const { pageSize, changePage, ...rest } = useUrlFilters()
 * ```
 *
 * @example Usage with custom type for sort keys and initial sort key:
 * ```tsx
 * const  { sortBy, sortOrder } = useUrlFilters<'email' | 'name'>({ initialSortKey: 'email' })
 * ```
 *
 */
const useUrlFilters = <T = string>({ initialSortKey }: { initialSortKey?: T } = {}) => {
    const location = useLocation()
    const history = useHistory()
    const searchParams = new URLSearchParams(location.search)

    const { pageSize, pageNumber, searchKey, sortBy, sortOrder } = useMemo(() => {
        const _pageSize = searchParams.get(PAGE_SIZE)
        const _pageNumber = searchParams.get(PAGE_NUMBER)
        const _searchKey = searchParams.get(SEARCH_KEY)
        const _sortOrder = searchParams.get(SORT_ORDER) as SortingOrder
        const _sortBy = searchParams.get(SORT_BY)

        const sortByKey = (_sortBy || initialSortKey || '') as T
        // Fallback to ascending order
        const sortByOrder = Object.values(SortingOrder).includes(_sortOrder) ? _sortOrder : SortingOrder.ASC

        return {
            pageSize: Number(_pageSize) || DEFAULT_BASE_PAGE_SIZE,
            pageNumber: Number(_pageNumber) || DEFAULT_PAGE_NUMBER,
            searchKey: _searchKey || '',
            sortBy: sortByKey,
            // sort order should only be applied if the key is available
            sortOrder: (sortByKey ? sortByOrder : '') as SortingOrder,
        }
    }, [searchParams])

    /**
     * Used for getting the required result from the API
     */
    const offset = pageSize * (pageNumber - 1)

    /**
     * Update and replace the search params in the URL.
     *
     * Note: Currently only primitive data types are supported
     */
    const _updateSearchParam = (key: string, value) => {
        searchParams.set(key, String(value))
        history.replace({ search: searchParams.toString() })
    }

    const _resetPageNumber = () => {
        _updateSearchParam(PAGE_NUMBER, DEFAULT_PAGE_NUMBER)
    }

    const changePage = (page: number) => {
        _updateSearchParam(PAGE_NUMBER, page)
    }

    const changePageSize = (_pageSize: number) => {
        _updateSearchParam(PAGE_SIZE, _pageSize)
        _resetPageNumber()
    }

    const handleSearch = (searchTerm: string) => {
        _updateSearchParam(SEARCH_KEY, searchTerm)
    }

    const handleSorting = (_sortBy: T) => {
        let order: SortingOrder
        if (_sortBy === sortBy && sortOrder === SortingOrder.ASC) {
            order = SortingOrder.DESC
        } else {
            order = SortingOrder.ASC
        }

        _updateSearchParam(SORT_BY, _sortBy)
        _updateSearchParam(SORT_ORDER, order)

        // Reset page number on sorting change
        _resetPageNumber()
    }

    const clearFilters = () => {
        Object.values(URL_KEYS).forEach((key) => {
            searchParams.delete(key)
        })
        history.replace({ search: searchParams.toString() })
    }

    return {
        pageSize,
        changePage,
        changePageSize,
        searchKey,
        handleSearch,
        offset,
        sortBy,
        sortOrder,
        handleSorting,
        clearFilters,
    }
}

export default useUrlFilters
