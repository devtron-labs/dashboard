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

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import PluginCard from './PluginCard'
import { DetectBottom } from '../DetectBottom'
import PluginCardSkeletonList from './PluginCardSkeletonList'
import { PluginListParamsType, PluginListProps } from './types'
import { abortPreviousRequests, GenericEmptyState, GenericFilterEmptyState, ImageType } from '../../../Common'
import { getPluginStoreData } from './service'

const PluginList = ({
    pluginDataStore,
    pluginList,
    totalCount,
    handleDataUpdateForPluginResponse,
    filters: { selectedTags, searchKey },
    handlePluginSelection,
    selectedPluginsMap,
    isSelectable,
    handleClearFilters,
    showCardBorder,
    getPluginStoreRef,
}: PluginListProps) => {
    const { appId } = useParams<PluginListParamsType>()

    const [isLoadingMorePlugins, setIsLoadingMorePlugins] = useState<boolean>(false)
    const [hasError, setHasError] = useState<boolean>(false)

    const handleLoadMore = async () => {
        setIsLoadingMorePlugins(true)
        setHasError(false)
        try {
            const pluginDataResponse = await abortPreviousRequests(
                () =>
                    getPluginStoreData({
                        searchKey,
                        offset: pluginList.length,
                        selectedTags,
                        appId: appId ? +appId : null,
                        signal: getPluginStoreRef.current.signal,
                    }),
                getPluginStoreRef,
            )

            handleDataUpdateForPluginResponse(pluginDataResponse, true)
        } catch {
            setHasError(true)
        } finally {
            setIsLoadingMorePlugins(false)
        }
    }

    if (!pluginList.length) {
        if (!!searchKey || !!selectedTags.length) {
            return <GenericFilterEmptyState handleClearFilters={handleClearFilters} imageType={ImageType.Large} />
        }

        // Not going to happen but still handling in case of any issue that might arise
        return (
            <GenericEmptyState title="No plugins found" subTitle="We are unable to locate any plugin in our system" />
        )
    }

    return (
        <>
            {pluginList.map((plugin) => (
                <PluginCard
                    key={plugin.parentPluginId}
                    parentPluginId={plugin.parentPluginId}
                    isSelectable={isSelectable}
                    pluginDataStore={pluginDataStore}
                    handlePluginSelection={handlePluginSelection}
                    isSelected={!!selectedPluginsMap[plugin.parentPluginId]}
                    showCardBorder={showCardBorder}
                />
            ))}

            {isLoadingMorePlugins && <PluginCardSkeletonList />}

            {totalCount > pluginList.length && !isLoadingMorePlugins && (
                <DetectBottom callback={handleLoadMore} hasError={hasError} />
            )}
        </>
    )
}

export default PluginList
