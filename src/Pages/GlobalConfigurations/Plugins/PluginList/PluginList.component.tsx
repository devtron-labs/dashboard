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

import { useLocation, useNavigate } from 'react-router-dom'

import {
    APIResponseHandler,
    Button,
    ButtonComponentType,
    DetectBottom,
    FilterSelectPicker,
    GenericEmptyState,
    GenericFilterEmptyState,
    Icon,
    ImageType,
    Progressing,
    SearchBar,
    SelectPickerOptionType,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { DEFAULT_PLUGIN_LIST_DATA, PLUGIN_ROUTE_SEGMENTS, PLUGINS_ROOT_URL } from '../constants'
import { useGetPluginList, useGetPluginTags } from '../service'
import { PluginListRowProps, PluginListURLFiltersType } from '../types'
import { parsePluginListSearchParams } from '../utils'
import PluginListRow from './PluginListRow'

const PluginList = () => {
    const navigate = useNavigate()
    const { search } = useLocation()

    const { searchKey, tag, handleSearch, updateSearchParams, clearFilters, areFiltersApplied } = useUrlFilters<
        never,
        PluginListURLFiltersType
    >({
        parseSearchParams: parsePluginListSearchParams,
    })

    const {
        data,
        isLoading,
        error,
        refetch: refetchPluginList,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = useGetPluginList({
        searchKey,
        tag,
    })

    const {
        data: availableTags,
        isLoading: areTagsLoading,
        error: availableTagsError,
        refetch: reloadAvailableTags,
    } = useGetPluginTags()

    const { pluginDataStore, parentPluginIdList } = data ?? DEFAULT_PLUGIN_LIST_DATA

    const handleLoadMore = () => {
        if (!hasNextPage || isFetchingNextPage) {
            return
        }
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchNextPage()
    }

    const handleApplyTagFilter = (selectedOptions: SelectPickerOptionType[]) => {
        updateSearchParams({ tag: selectedOptions.map((option) => option.value as string) })
    }

    const handleActionMenuClick: PluginListRowProps['handleActionMenuClick'] = (action, pluginVersionId) => {
        navigate({ pathname: `${PLUGINS_ROOT_URL}/${pluginVersionId}/${action}`, search })
    }

    const tagOptions: SelectPickerOptionType[] = (availableTags ?? []).map((tagName) => ({
        label: tagName,
        value: tagName,
    }))
    const appliedTagOptions: SelectPickerOptionType[] = tag.map((tagName) => ({ label: tagName, value: tagName }))

    const renderList = () => {
        if (!parentPluginIdList.length) {
            return areFiltersApplied ? (
                <GenericFilterEmptyState handleClearFilters={clearFilters} />
            ) : (
                <GenericEmptyState
                    title="No plugins found"
                    subTitle="Create a plugin to reuse a custom script across pipelines."
                    imageType={ImageType.Large}
                />
            )
        }

        return (
            <div className="flexbox-col flex-grow-1 dc__overflow-auto">
                {parentPluginIdList.map((parentPluginId) => {
                    const parentPlugin = pluginDataStore.parentPluginStore[parentPluginId]

                    return parentPlugin ? (
                        <PluginListRow
                            key={parentPluginId}
                            parentPlugin={parentPlugin}
                            pluginDataStore={pluginDataStore}
                            handleActionMenuClick={handleActionMenuClick}
                        />
                    ) : null
                })}

                {isFetchingNextPage && <Progressing styles={{ height: '64px' }} />}
                {hasNextPage && !isFetchingNextPage && <DetectBottom callback={handleLoadMore} />}
            </div>
        )
    }

    return (
        <div className="flexbox-col h-100 bg__primary">
            <div className="flexbox dc__content-space dc__align-items-start dc__gap-16 px-20 pt-20 pb-16">
                <div className="flexbox-col">
                    <h1 className="m-0 cn-9 fs-16 fw-6 lh-24">Plugins</h1>
                    <p className="m-0 cn-7 fs-13 lh-20">
                        Plugins enable you to easily execute common tasks in the pre/post stages of build and deployment
                        pipelines.
                    </p>
                </div>

                <Button
                    dataTestId="create-plugin-button"
                    text="Create Plugin"
                    startIcon={<Icon name="ic-add" color={null} />}
                    component={ButtonComponentType.link}
                    linkProps={{ to: { pathname: `${PLUGINS_ROOT_URL}/${PLUGIN_ROUTE_SEGMENTS.CREATE}`, search } }}
                />
            </div>

            <div className="flexbox dc__align-items-center dc__gap-8 px-20 pb-8">
                <SearchBar
                    initialSearchText={searchKey}
                    containerClassName="w-250"
                    handleEnter={handleSearch}
                    inputProps={{ placeholder: 'Search plugin', autoFocus: false }}
                    dataTestId="plugin-list-search"
                />
                <FilterSelectPicker
                    inputId="plugin-list-tag-filter"
                    placeholder="Tags"
                    options={tagOptions}
                    appliedFilterOptions={appliedTagOptions}
                    isLoading={areTagsLoading}
                    isDisabled={areTagsLoading}
                    optionListError={availableTagsError}
                    reloadOptionList={reloadAvailableTags}
                    handleApplyFilter={handleApplyTagFilter}
                />
            </div>

            <APIResponseHandler
                isLoading={isLoading}
                progressingProps={{ pageLoader: true }}
                error={error}
                errorScreenManagerProps={{ code: error?.code, reload: refetchPluginList }}
            >
                {renderList()}
            </APIResponseHandler>
        </div>
    )
}

export default PluginList
