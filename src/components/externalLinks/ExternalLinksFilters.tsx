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

import { useEffect, useState } from 'react'
import ReactSelect, { InputActionMeta } from 'react-select'
import { Option, ReactSelectInputAction } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import {
    ApplicationFilterType,
    AppliedFilterChipsType,
    ClusterFilterType,
    ExternalLinkIdentifierType,
    IdentifierOptionType,
} from './ExternalLinks.type'
import { OptionType } from '../app/types'
import { FilterMenuList, ValueContainer } from './ExternalLinks.component'
import { customMultiSelectStyles } from './ExternalLinks.utils'

export const ClusterFilter = ({
    clusterList,
    appliedClusters,
    setAppliedClusters,
    queryParams,
    // updateSearchParams,
    // clusters,
    history,
    url,
}: ClusterFilterType): JSX.Element => {
    const [selectedCluster, setSelectedCluster] = useState<OptionType[]>([])
    const [isMenuOpen, setMenuOpen] = useState(false)
    const [clusterSearchInput, setClusterSearchInput] = useState('')
    // To update the dropdown selections on query param value change or page reload
    useEffect(() => {
        if (clusterList.length > 0 && queryParams.has('clusters')) {
            const _appliedClustersIds = queryParams.get('clusters').split(',')
            const _appliedClusters = clusterList.filter((cluster) => _appliedClustersIds.includes(cluster.value))

            setAppliedClusters(_appliedClusters)
            setSelectedCluster(_appliedClusters)
        } else {
            setSelectedCluster([])
        }
    }, [clusterList, queryParams.get('clusters')])

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
        if (actionMeta.action === ReactSelectInputAction.inputChange) {
            setClusterSearchInput(value)
        }

        //   const getFormattedLabel = (filterKey: ExternalLinkFilters, filterValue: string) => {
        //         if (filterKey === ExternalLinkFilters.CLUSTERS) {
        //             return clusterList.find((clusterItem) => clusterItem.value === filterValue)?.label
        //         }
        //         return filterValue
        //     }

        // const selectedClusters = clusters.map((cluster) => {
        //     return { label: getFormattedLabel(ExternalLinkFilters.CLUSTERS, cluster), value: cluster }
        // })

        // const handleUpdateFilters = (filterKey: ExternalLinkFilters) => (selectedOptions: IdentifierOptionType[]) => {
        //     console.log(selectedOptions, 'selectedOptions')
        //     setAppliedClusters(selectedOptions)
        //     updateSearchParams({ [filterKey]: selectedOptions.map((option) => String(option.value)) })
    }

    return (
        <div className="filters-wrapper ml-8">
            <ReactSelect
                menuIsOpen={isMenuOpen}
                placeholder="Cluster: All"
                name="Clusters"
                value={selectedCluster}
                options={clusterList}
                onChange={handleSelectedFilters}
                isMulti
                isSearchable
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
            {/* // <FilterSelectPicker
            //     placeholder="Clusters"
            //     inputId="app-list-app-status-select"
            //     options={clusterList}
            //     appliedFilterOptions={appliedClusters}
            //     isDisabled={false}
            //     isLoading={false}
            //     handleApplyFilter={handleUpdateFilters(ExternalLinkFilters.CLUSTERS)}
            // /> */}
        </div>
    )
}

const createAppFilterKey = (value: string) => {
    const appValue = value.split('|')
    return `${appValue[0]}_${appValue[2] === ExternalLinkIdentifierType.DevtronApp ? 'd' : 'h'}`
}

export const ApplicationFilter = ({
    allApps,
    // updateSearchParams,
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

    // const handleUpdateFilters = (filterKey: ExternalLinkFilters) => (selectedOptions: IdentifierOptionType[]) => {
    //     console.log(selectedOptions, 'selectedOptions')
    //     setAppliedApps(selectedOptions)
    //     updateSearchParams({ [filterKey]: selectedOptions.map((option) => String(option.value)) })
    // }

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
        if (actionMeta.action === ReactSelectInputAction.inputChange) {
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
                isMulti
                isSearchable
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
        // <FilterSelectPicker
        //     placeholder="Application"
        //     inputId="app-list-app-status-select"
        //     options={allApps}
        //     appliedFilterOptions={appliedApps}
        //     isDisabled={false}
        //     isLoading={false}
        //     handleApplyFilter={handleUpdateFilters(ExternalLinkFilters.APPS)}
        // />
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
        const ids = []
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
                <div key={filter.label} className="saved-filter flex left dc__border bg__secondary px-6">
                    <span className="fw-6">{type}</span>
                    <span className="saved-filter-divider bcn-2 ml-6 mr-6" />
                    <span>{filter.label}</span>
                    <button
                        type="button"
                        className="saved-filter__clear-btn"
                        onClick={() => removeFilter(type, filter)}
                    >
                        <Close className="icon-dim-12" />
                    </button>
                </div>
                {showORDivider && <span className="fs-12 fw-4 lh-20 px-8">OR</span>}
            </>
        )
    }

    const clustersLastIndex = appliedClusters.length - 1
    const appsLastIndex = appliedApps.length - 1
    return (
        <div className="saved-filters__wrap flex left flex-wrap dc__position-rel px-20 bg__primary">
            {appliedClusters.map((filter, idx) => {
                return renderFilterChip('Cluster', filter, clustersLastIndex !== idx || appliedApps.length > 0)
            })}
            {appliedApps.map((filter, idx) => {
                return renderFilterChip('App', filter, appsLastIndex !== idx)
            })}
            <button type="button" className="saved-filters__clear-btn fs-13" onClick={removeAllFilters}>
                Clear All Filters
            </button>
        </div>
    )
}
