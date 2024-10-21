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

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { APIResponseHandler } from '../APIResponseHandler'
import PluginTagSelect from './PluginTagSelect'
import PluginList from './PluginList'
import { FilterChips } from '../FilterChips'
import PluginCardSkeletonList from './PluginCardSkeletonList'
import { abortPreviousRequests, getIsRequestAborted, SearchBar, useAsync } from '../../../Common'
import { getAvailablePluginTags, getPluginStoreData } from './service'
import {
    PluginListParamsType,
    PluginListContainerProps,
    PluginListProps,
    PluginListFiltersType,
    PluginListItemType,
} from './types'
import { DEFAULT_PLUGIN_LIST_FILTERS } from './constants'
import './pluginListContainer.scss'
import { getUpdatedPluginStore } from './utils'

const PluginListContainer = ({
    availableTags,
    handleUpdateAvailableTags,
    pluginDataStore,
    handlePluginDataStoreUpdate,
    handlePluginSelection,
    // Selected plugins Section
    isSelectable,
    selectedPluginsMap = {},
    // Plugin list Section
    persistFilters,
    parentPluginList,
    handleParentPluginListUpdate,
    parentTotalCount,
    handleParentTotalCount,
    parentFilters,
    handleUpdateParentFilters,
    rootClassName = '',
    showCardBorder = false,
}: Readonly<PluginListContainerProps>) => {
    const { appId } = useParams<PluginListParamsType>()

    const [pluginList, setPluginList] = useState<PluginListItemType[]>(parentPluginList || [])
    const [totalCount, setTotalCount] = useState<number>(parentTotalCount || 0)
    const [filters, setFilters] = useState<PluginListFiltersType>(
        parentFilters || structuredClone(DEFAULT_PLUGIN_LIST_FILTERS),
    )
    const abortControllerRef: PluginListProps['getPluginStoreRef'] = useRef(new AbortController())

    const handlePluginListUpdate = (updatedPluginList: PluginListItemType[]) => {
        setPluginList(updatedPluginList)
        handleParentPluginListUpdate?.(updatedPluginList)
    }

    const handleUpdateTotalCount = (updatedTotalCount: number) => {
        setTotalCount(updatedTotalCount)
        handleParentTotalCount?.(updatedTotalCount)
    }

    const handleUpdateFilters = (updatedFilters: PluginListFiltersType) => {
        setFilters(updatedFilters)
        handleUpdateParentFilters?.(updatedFilters)
    }

    const { searchKey, selectedTags } = filters || {}

    const getPluginStoreDataWrapper = () =>
        abortPreviousRequests(
            () =>
                getPluginStoreData({
                    searchKey,
                    selectedTags,
                    offset: 0,
                    appId: appId ? +appId : null,
                    signal: abortControllerRef.current.signal,
                }),
            abortControllerRef,
        )

    const [isLoadingPluginData, pluginData, pluginDataError, reloadPluginData] = useAsync(
        getPluginStoreDataWrapper,
        // In case of persistFilters with change of searchKey or selectedTags we anyways clear the pluginList so no need to add dependency
        [searchKey, appId, selectedTags],
        persistFilters ? !pluginList.length : true,
    )

    const [areTagsLoading, tags, tagsError, reloadTags] = useAsync(
        () => getAvailablePluginTags(appId ? +appId : null),
        [],
        !availableTags?.length,
    )

    useEffect(() => {
        if (!areTagsLoading && !tagsError && tags) {
            handleUpdateAvailableTags(tags)
        }
    }, [areTagsLoading, tags, tagsError])

    const handleDataUpdateForPluginResponse: PluginListProps['handleDataUpdateForPluginResponse'] = (
        pluginResponse,
        appendResponse = false,
    ) => {
        const {
            pluginStore: { parentPluginStore, pluginVersionStore },
            totalCount: responseTotalCount,
            parentPluginIdList,
        } = pluginResponse

        handlePluginDataStoreUpdate(getUpdatedPluginStore(pluginDataStore, parentPluginStore, pluginVersionStore))
        handleUpdateTotalCount(responseTotalCount)

        const newPluginList: typeof pluginList = appendResponse ? structuredClone(pluginList) : []
        const newPluginListMap = newPluginList.reduce(
            (acc, plugin) => {
                acc[plugin.parentPluginId] = true
                return acc
            },
            {} as Record<number, true>,
        )

        parentPluginIdList.forEach((key) => {
            if (!newPluginListMap[key]) {
                newPluginList.push({
                    parentPluginId: key,
                })
                newPluginListMap[key] = true
            }
        })

        handlePluginListUpdate(newPluginList)
    }

    useEffect(() => {
        const isLoading = isLoadingPluginData || getIsRequestAborted(pluginDataError)
        if (!isLoading && !pluginDataError && pluginData) {
            handleDataUpdateForPluginResponse(pluginData)
        }
    }, [isLoadingPluginData, pluginData, pluginDataError])

    const handlePersistFiltersChange = () => {
        // Doing this since in case of persistence of filter we have should run as plugin length
        if (persistFilters) {
            handlePluginListUpdate([])
        }
    }

    const handleClearFilters = () => {
        handleUpdateFilters({
            searchKey: '',
            selectedTags: [],
        })

        handlePersistFiltersChange()
    }

    const handleSearch = (searchText: string) => {
        handleUpdateFilters({
            ...filters,
            searchKey: searchText,
        })

        handlePersistFiltersChange()
    }

    const handleUpdateSelectedTags = (updatedTags: string[]) => {
        handleUpdateFilters({
            ...filters,
            selectedTags: updatedTags,
        })

        handlePersistFiltersChange()
    }

    const handleRemoveSelectedTag = (filterConfig: Pick<PluginListFiltersType, 'selectedTags'>) => {
        handleUpdateFilters({
            ...filters,
            selectedTags: filterConfig.selectedTags,
        })

        handlePersistFiltersChange()
    }

    const handlePluginSelectionWrapper: PluginListProps['handlePluginSelection'] = (parentPluginId) => {
        handlePluginSelection(parentPluginId)
    }

    return (
        <div className={`flexbox-col w-100 ${rootClassName}`}>
            {/* Filters section */}
            <div className="w-100 flexbox dc__gap-12 py-12 dc__position-sticky dc__top-0 bcn-0 dc__zi-1 flex-wrap">
                <SearchBar
                    initialSearchText={searchKey}
                    containerClassName="flex-grow-1"
                    handleEnter={handleSearch}
                    inputProps={{
                        placeholder: 'Search plugins',
                        autoFocus: true,
                    }}
                />

                <PluginTagSelect
                    availableTags={availableTags}
                    handleUpdateSelectedTags={handleUpdateSelectedTags}
                    selectedTags={selectedTags}
                    isLoading={areTagsLoading}
                    hasError={!!tagsError}
                    reloadTags={reloadTags}
                />
            </div>

            {!!selectedTags.length && (
                <FilterChips<Pick<PluginListFiltersType, 'selectedTags'>>
                    filterConfig={{
                        selectedTags,
                    }}
                    onRemoveFilter={handleRemoveSelectedTag}
                    clearFilters={handleClearFilters}
                    className="w-100 pt-0-imp"
                    clearButtonClassName="dc__no-background-imp dc__no-border-imp dc__tab-focus"
                    shouldHideLabel
                />
            )}

            <APIResponseHandler
                isLoading={isLoadingPluginData || getIsRequestAborted(pluginDataError)}
                customLoader={<PluginCardSkeletonList />}
                error={pluginDataError}
                errorScreenManagerProps={{
                    code: pluginDataError?.code,
                    reload: reloadPluginData,
                }}
            >
                <PluginList
                    pluginDataStore={pluginDataStore}
                    pluginList={pluginList}
                    totalCount={totalCount}
                    handleDataUpdateForPluginResponse={handleDataUpdateForPluginResponse}
                    filters={filters}
                    handlePluginSelection={handlePluginSelectionWrapper}
                    selectedPluginsMap={selectedPluginsMap}
                    isSelectable={isSelectable}
                    handleClearFilters={handleClearFilters}
                    showCardBorder={showCardBorder}
                    getPluginStoreRef={abortControllerRef}
                />
            </APIResponseHandler>
        </div>
    )
}

export default PluginListContainer
