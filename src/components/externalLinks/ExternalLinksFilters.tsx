import React, { useEffect, useState } from 'react'
import ReactSelect, { InputActionMeta, MultiValue } from 'react-select'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { AppliedFilterChipsType, ClusterFilterType, URLModificationType } from '../externalLinks/ExternalLinks.type'
import { OptionType } from '../app/types'
import { URLS } from '../../config'
import { MenuList, ValueContainer } from './ExternalLinks.component'
import { multiSelectStyles, Option } from '../common'
import { customMultiSelectStyles } from './ExternalLinks.utils'

export const ClusterFilter = ({
    clusters,
    appliedClusters,
    setAppliedClusters,
    queryParams,
    history,
}: ClusterFilterType): JSX.Element => {
    const [selectedCluster, setSelectedCluster] = useState<MultiValue<OptionType>>([])
    const [isMenuOpen, setMenuOpen] = useState(false)
    const [clusterSearchInput, setClusterSearchInput] = useState('')

    // To update the dropdown selections on query param value change or page reload
    useEffect(() => {
        if (clusters.length > 0 && queryParams.has('clusters')) {
            const _appliedClustersIds = queryParams.get('clusters').split(',')
            const _appliedClusters = clusters.filter((cluster) => _appliedClustersIds.includes(cluster.value))

            setAppliedClusters(_appliedClusters)
            setSelectedCluster(_appliedClusters)
        } else {
            setSelectedCluster([])
        }
    }, [clusters, queryParams.get('clusters')])

    const handleFilterQueryChanges = (): void => {
        setClusterSearchInput('')
        setMenuOpen(false)
        setAppliedClusters(selectedCluster)

        if (selectedCluster.length > 0) {
            const ids = selectedCluster.map((cluster) => cluster.value)
            ids.sort()

            queryParams.set('clusters', ids.toString())
        } else {
            queryParams.delete('clusters')
        }

        history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
    }

    const handleMenuState = (menuOpenState: boolean): void => {
        setClusterSearchInput('')
        setMenuOpen(menuOpenState)
    }

    const handleSelectedFilters = (selected: MultiValue<OptionType>): void => {
        setSelectedCluster(selected)
    }

    const handleCloseFilter = (): void => {
        handleMenuState(false)
        setSelectedCluster(appliedClusters)
    }

    return (
        <div className="filters-wrapper">
            <ReactSelect
                menuIsOpen={isMenuOpen}
                placeholder="Cluster : All"
                name="cluster"
                value={selectedCluster}
                options={clusters}
                onChange={handleSelectedFilters}
                isMulti={true}
                isSearchable={true}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onMenuOpen={() => handleMenuState(true)}
                onMenuClose={handleCloseFilter}
                inputValue={clusterSearchInput}
                onBlur={() => {
                    setClusterSearchInput('')
                }}
                onInputChange={(value: string, actionMeta: InputActionMeta) => {
                    if (actionMeta.action === 'input-change') {
                        setClusterSearchInput(value)
                    }
                }}
                components={{
                    Option,
                    ValueContainer,
                    IndicatorSeparator: null,
                    ClearIndicator: null,
                    MenuList: (props) => <MenuList {...props} handleFilterQueryChanges={handleFilterQueryChanges} />,
                }}
                styles={{
                    ...multiSelectStyles,
                    ...customMultiSelectStyles,
                    menuList: (base) => ({
                        ...base,
                        borderRadius: '4px',
                        paddingTop: 0,
                        paddingBottom: 0,
                    }),
                }}
            />
        </div>
    )
}

export const SearchInput = ({ queryParams, history }: URLModificationType): JSX.Element => {
    const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '')
    const [searchApplied, setSearchApplied] = useState(!!queryParams.get('search'))

    const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchTerm(event.target.value || '')
    }

    const filterExternalLinksUsingSearch = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') {
            event.preventDefault()

            if (!searchTerm) {
                setSearchApplied(false)
                queryParams.delete('search')
            } else {
                setSearchApplied(true)
                queryParams.set('search', searchTerm)
            }

            history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
        }
    }

    const clearSearch = (): void => {
        setSearchTerm('')
        setSearchApplied(false)

        queryParams.delete('search')
        history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
    }

    return (
        <div className="search-wrapper">
            <Search className="search__icon icon-dim-18" />
            <input
                type="text"
                name="app_search_input"
                autoComplete="off"
                value={searchTerm}
                placeholder="Search by name or tool name"
                className="search__input bcn-1"
                onKeyDown={filterExternalLinksUsingSearch}
                onChange={handleSearchTermChange}
            />
            {searchApplied && (
                <button className="search__clear-button" type="button" onClick={clearSearch}>
                    <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                </button>
            )}
        </div>
    )
}

export const AppliedFilterChips = ({
    appliedClusters,
    setAppliedClusters,
    queryParams,
    history,
}: AppliedFilterChipsType): JSX.Element => {
    const removeFilter = (filter: OptionType): void => {
        const filteredClusters = appliedClusters.filter((cluster) => cluster.value !== filter.value)
        const ids = filteredClusters.map((cluster) => cluster.value)
        ids.sort()

        setAppliedClusters(filteredClusters)

        if (ids.length > 0) {
            queryParams.set('clusters', ids.toString())
        } else {
            queryParams.delete('clusters')
        }

        history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
    }

    const removeAllFilters = (): void => {
        setAppliedClusters([])
        queryParams.delete('clusters')
        history.push(`${URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}?${queryParams.toString()}`)
    }

    return (
        <div className="saved-filters__wrap dc__position-rel pl-0 pr-20 mb-10">
            {appliedClusters.map((filter) => {
                return (
                    <div key={filter.label} className="saved-filter">
                        <span className="fw-6">Cluster</span>
                        <span className="saved-filter-divider ml-6 mr-6"></span>
                        <span>{filter.label}</span>
                        <button type="button" className="saved-filter__clear-btn" onClick={() => removeFilter(filter)}>
                            <Close className="icon-dim-12" />
                        </button>
                    </div>
                )
            })}
            <button
                type="button"
                className="saved-filters__clear-btn fs-13"
                onClick={() => {
                    removeAllFilters()
                }}
            >
                Clear All Filters
            </button>
        </div>
    )
}
