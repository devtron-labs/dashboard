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

import {
    Button,
    ComponentSizeType,
    DetectBottom,
    GenericFilterEmptyState,
    GenericInfoCardBorderVariant,
    GenericInfoCardListing,
    GenericInfoListSkeleton,
    Icon,
    SearchBar,
    useStateFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { CreationMethodType } from '../types'
import { AppCloneListProps } from './types'
import { useDevtronCloneList } from './useDevtronCloneList'

export const AppCloneList = ({ handleCloneAppClick, isJobView, handleCreationMethodChange }: AppCloneListProps) => {
    const { searchKey, handleSearch, clearFilters } = useStateFilters()

    const { isListLoading, list, listError, reloadList, loadMoreData, hasMoreData, isLoadingMore, hasError } =
        useDevtronCloneList({
            handleCloneAppClick,
            isJobView,
            searchKey,
        })

    const handleLoadMore = async () => {
        if (isLoadingMore || !hasMoreData) return
        await loadMoreData()
    }

    const handleCreateFromScratch = () => {
        handleCreationMethodChange(CreationMethodType.blank)
    }

    const renderCreateFromScratchButton = () => (
        <Button
            dataTestId="create-app-modal-create-from-scratch-btn"
            text="Create from scratch"
            onClick={handleCreateFromScratch}
            startIcon={<Icon name="ic-new" color={null} />}
        />
    )

    return (
        <div className="flex-grow-1 flexbox-col dc__overflow-auto">
            <div className="flexbox-col dc__gap-12 pt-20 px-20">
                <h2 className="m-0 fs-15 lh-1-5 fw-6 cn-9">Choose {isJobView ? 'a job' : 'an application'} to clone</h2>

                {!!list.length && !listError && (
                    <SearchBar
                        dataTestId="template-list-search"
                        initialSearchText={searchKey}
                        size={ComponentSizeType.medium}
                        handleEnter={handleSearch}
                        inputProps={{
                            placeholder: `Search ${isJobView ? 'job' : 'application'}`,
                        }}
                        isLoading={isListLoading || isLoadingMore}
                    />
                )}
            </div>
            <div className="flex-grow-1 flexbox-col dc__gap-12 p-20 dc__overflow-auto">
                {/* Empty filter state for jobs since job list is paginated */}
                {isJobView && searchKey && !isListLoading && !listError && !list.length ? (
                    <GenericFilterEmptyState handleClearFilters={clearFilters} />
                ) : (
                    <GenericInfoCardListing
                        borderVariant={GenericInfoCardBorderVariant.ROUNDED}
                        list={list}
                        searchKey={isJobView ? '' : searchKey} // Not filtering on FE for jobs since job list is paginated
                        isLoading={isListLoading}
                        error={listError}
                        reloadList={reloadList}
                        handleClearFilters={clearFilters}
                        emptyStateConfig={{
                            title: 'Nothing to Clone… Yet!',
                            subTitle: `You haven’t created any ${isJobView ? 'job' : 'application'} to clone. Kick things off by crafting one from scratch—it’s quick and easy!`,
                            renderButton: renderCreateFromScratchButton,
                        }}
                    />
                )}
                {hasMoreData && isLoadingMore && <GenericInfoListSkeleton />}

                {hasMoreData && !isLoadingMore && <DetectBottom callback={handleLoadMore} hasError={hasError} />}
            </div>
        </div>
    )
}
