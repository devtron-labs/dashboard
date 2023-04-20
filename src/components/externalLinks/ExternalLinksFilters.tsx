import React, { useEffect, useState } from 'react'
import ReactSelect, { InputActionMeta } from 'react-select'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import {
    ApplicationFilterType,
    AppliedFilterChipsType,
    ClusterFilterType,
    ExternalLinkIdentifierType,
    IdentifierOptionType,
    URLModificationType,
} from '../externalLinks/ExternalLinks.type'
import { OptionType } from '../app/types'
import { FilterMenuList, ValueContainer } from './ExternalLinks.component'
import { customMultiSelectStyles } from './ExternalLinks.utils'
import { Option } from '@devtron-labs/devtron-fe-common-lib'

export const ClusterFilter = ({
    clusters,
    appliedClusters,
    setAppliedClusters,
    queryParams,
    history,
    url,
}: ClusterFilterType): JSX.Element => {
    const [selectedCluster, setSelectedCluster] = useState<OptionType[]>([])
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

        history.push(`${url}?${queryParams.toString()}`)
    }

    const handleMenuState = (menuOpenState: boolean): void => {
        setClusterSearchInput('')
        setMenuOpen(menuOpenState)
    }

    const handleSelectedFilters = (selected): void => {
        setSelectedCluster(selected)
    }

    const handleCloseFilter = (): void => {
        handleMenuState(false)
        setSelectedCluster(appliedClusters)
    }

    const onMenuOpenHandler = () => {
        handleMenuState(true)
    }

    const onBlurHandler = () => {
        setClusterSearchInput('')
    }

    const onInputChangeHandler = (value: string, actionMeta: InputActionMeta) => {
        if (actionMeta.action === 'input-change') {
            setClusterSearchInput(value)
        }
    }

    return (
        <div className="filters-wrapper ml-8">
            <ReactSelect
                menuIsOpen={isMenuOpen}
                placeholder="Cluster: All"
                name="Clusters"
                value={selectedCluster}
                options={clusters}
                onChange={handleSelectedFilters}
                isMulti={true}
                isSearchable={true}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onMenuOpen={onMenuOpenHandler}
                onMenuClose={handleCloseFilter}
                inputValue={clusterSearchInput}
                onBlur={onBlurHandler}
                onInputChange={onInputChangeHandler}
                components={{
                    Option,
                    ValueContainer,
                    IndicatorSeparator: null,
                    ClearIndicator: null,
                    MenuList: (props) => (
                        <FilterMenuList {...props} handleFilterQueryChanges={handleFilterQueryChanges} />
                    ),
                }}
                styles={{
                    ...customMultiSelectStyles,
                    menuList: (base) => ({
                        ...base,
                        borderRadius: '4px',
                        paddingTop: 0,
                        paddingBottom: 0,
                    }),
                    control: (base, state) => ({
                        ...customMultiSelectStyles.control(base, state),
                        minHeight: '32px',
                    }),
                }}
                classNamePrefix="external-link-cluster-select"
            />
        </div>
    )
}

const createAppFilterKey = (value: string) => {
    const appValue = value.split('|')
    return `${appValue[0]}_${appValue[2] === ExternalLinkIdentifierType.DevtronApp ? 'd' : 'h'}`
}

export const ApplicationFilter = ({
    allApps,
    appliedApps,
    setAppliedApps,
    queryParams,
    history,
    url,
}: ApplicationFilterType): JSX.Element => {
    const [selectedApps, setSelectedApps] = useState<IdentifierOptionType[]>([])
    const [isMenuOpen, setMenuOpen] = useState(false)
    const [appSearchInput, setAppSearchInput] = useState('')

    // To update the dropdown selections on query param value change or page reload
    useEffect(() => {
        if (allApps.length > 0 && queryParams.has('apps')) {
            const _appliedAppIds = queryParams.get('apps').split(',')
            const _appliedApps = allApps.filter((app) => {
                return _appliedAppIds.includes(createAppFilterKey(app.value))
            })

            setAppliedApps(_appliedApps)
            setSelectedApps(_appliedApps)
        } else {
            setSelectedApps([])
        }
    }, [allApps, queryParams.get('apps')])

    const handleFilterQueryChanges = (): void => {
        setAppSearchInput('')
        setMenuOpen(false)
        setAppliedApps(selectedApps)

        if (selectedApps.length > 0) {
            const ids = selectedApps.map((app) => {
                return createAppFilterKey(app.value)
            })
            ids.sort()

            queryParams.set('apps', ids.toString())
        } else {
            queryParams.delete('apps')
        }

        history.push(`${url}?${queryParams.toString()}`)
    }

    const handleMenuState = (menuOpenState: boolean): void => {
        setAppSearchInput('')
        setMenuOpen(menuOpenState)
    }

    const handleSelectedFilters = (selected): void => {
        setSelectedApps(selected)
    }

    const handleCloseFilter = (): void => {
        handleMenuState(false)
        setSelectedApps(appliedApps)
    }

    const onMenuOpenHandler = () => {
        handleMenuState(true)
    }

    const onBlurHandler = () => {
        setAppSearchInput('')
    }

    const onInputChangeHandler = (value: string, actionMeta: InputActionMeta) => {
        if (actionMeta.action === 'input-change') {
            setAppSearchInput(value)
        }
    }

    return (
        <div className="filters-wrapper ml-8">
            <ReactSelect
                menuIsOpen={isMenuOpen}
                placeholder="Application: All"
                name="Applications"
                value={selectedApps}
                options={allApps}
                onChange={handleSelectedFilters}
                isMulti={true}
                isSearchable={true}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onMenuOpen={onMenuOpenHandler}
                onMenuClose={handleCloseFilter}
                inputValue={appSearchInput}
                onBlur={onBlurHandler}
                onInputChange={onInputChangeHandler}
                components={{
                    Option,
                    ValueContainer,
                    IndicatorSeparator: null,
                    ClearIndicator: null,
                    MenuList: (props) => (
                        <FilterMenuList {...props} handleFilterQueryChanges={handleFilterQueryChanges} />
                    ),
                }}
                styles={{
                    ...customMultiSelectStyles,
                    menuList: (base) => ({
                        ...base,
                        borderRadius: '4px',
                        paddingTop: 0,
                        paddingBottom: 0,
                    }),
                    control: (base, state) => ({
                        ...customMultiSelectStyles.control(base, state),
                        minHeight: '32px',
                    }),
                }}
                classNamePrefix="external-link-application-select"
            />
        </div>
    )
}

export const SearchInput = ({ queryParams, history, url }: URLModificationType): JSX.Element => {
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

            history.push(`${url}?${queryParams.toString()}`)
        }
    }

    const clearSearch = (): void => {
        setSearchTerm('')
        setSearchApplied(false)

        queryParams.delete('search')
        history.push(`${url}?${queryParams.toString()}`)
    }

    return (
        <div className="search-wrapper">
            <Search className="search__icon icon-dim-18" />
            <input
                type="text"
                name="app_search_input"
                autoComplete="off"
                value={searchTerm}
                placeholder="Search"
                className="search__input bcn-1"
                onKeyDown={filterExternalLinksUsingSearch}
                onChange={handleSearchTermChange}
                data-testid="external-link-app-search"
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
    appliedApps,
    setAppliedApps,
    queryParams,
    history,
    url,
}: AppliedFilterChipsType): JSX.Element => {
    const removeFilter = (type: string, filter: IdentifierOptionType): void => {
        let ids = []
        if (type === 'App') {
            const filteredApps = []
            for (const _app of appliedApps) {
                const appFilterKey = createAppFilterKey(_app.value)
                if (appFilterKey !== createAppFilterKey(filter.value)) {
                    filteredApps.push(_app)
                    ids.push(appFilterKey)
                }
            }
            setAppliedApps(filteredApps)
        } else {
            const filteredClusters = []
            for (const _cluster of appliedClusters) {
                if (_cluster.value !== filter.value) {
                    filteredClusters.push(_cluster)
                    ids.push(_cluster.value)
                }
            }
            setAppliedClusters(filteredClusters)
        }

        const paramKey = type === 'App' ? 'apps' : 'clusters'
        if (ids.length > 0) {
            ids.sort()
            queryParams.set(paramKey, ids.toString())
        } else {
            queryParams.delete(paramKey)
        }

        history.push(`${url}?${queryParams.toString()}`)
    }

    const removeAllFilters = (e): void => {
        setAppliedClusters([])
        setAppliedApps([])
        queryParams.delete('clusters')
        queryParams.delete('apps')
        history.push(`${url}?${queryParams.toString()}`)
    }

    const renderFilterChip = (type: string, filter: IdentifierOptionType, showORDivider: boolean) => {
        return (
            <>
                <div key={filter.label} className="saved-filter flex left dc__border bc-n50 pl-6 pr-6">
                    <span className="fw-6">{type}</span>
                    <span className="saved-filter-divider bcn-2 ml-6 mr-6"></span>
                    <span>{filter.label}</span>
                    <button
                        type="button"
                        className="saved-filter__clear-btn"
                        onClick={() => removeFilter(type, filter)}
                    >
                        <Close className="icon-dim-12" />
                    </button>
                </div>
                {showORDivider && <span className="fs-12 fw-4 lh-20 ml-8 mr-8 mb-8">OR</span>}
            </>
        )
    }

    const clustersLastIndex = appliedClusters.length - 1
    const appsLastIndex = appliedApps.length - 1
    return (
        <div className="saved-filters__wrap flex left flex-wrap dc__position-rel pl-0 pr-20 mb-10">
            {appliedClusters.map((filter, idx) => {
                return renderFilterChip('Cluster', filter, clustersLastIndex !== idx || appliedApps.length > 0)
            })}
            {appliedApps.map((filter, idx) => {
                return renderFilterChip('App', filter, appsLastIndex !== idx)
            })}
            <button type="button" className="saved-filters__clear-btn fs-13" onClick={removeAllFilters}>
                Clear Filters
            </button>
        </div>
    )
}
