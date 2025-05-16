import { useState } from 'react'

import {
    ComponentSizeType,
    DetectBottom,
    GenericInfoCardBorderVariant,
    GenericInfoCardListing,
    GenericInfoListSkeleton,
    SearchBar,
    useStateFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { AppCloneListProps } from './types'
import { useDevtronCloneList } from './useDevtronCloneList'

export const AppCloneList = ({ handleCloneAppClick, isJobView }: AppCloneListProps) => {
    const { searchKey, handleSearch, clearFilters } = useStateFilters()
    const [isLoadingMoreJobList, setIsLoadingMoreJobList] = useState<boolean>(false)
    const [hasError, setHasError] = useState<boolean>(false)

    const { isListLoading, list, listError, reloadList, loadMoreData, hasMoreData } = useDevtronCloneList({
        handleCloneAppClick,
        isJobView,
    })

    const handleLoadMore = async () => {
        if (isLoadingMoreJobList || !hasMoreData) return
        setIsLoadingMoreJobList(true)
        setHasError(false)
        try {
            await loadMoreData()
        } catch {
            setHasError(true)
        } finally {
            setIsLoadingMoreJobList(false)
        }
    }

    return (
        <div className="flex-grow-1 flexbox-col dc__overflow-auto">
            <div className="flexbox-col dc__gap-12 pt-20 px-20">
                <h2 className="m-0 fs-15 lh-1-5 fw-6 cn-9">Choose {isJobView ? 'a job' : 'an application'} to clone</h2>

                <SearchBar
                    dataTestId="template-list-search"
                    initialSearchText={searchKey}
                    size={ComponentSizeType.medium}
                    handleEnter={handleSearch}
                />
            </div>
            <div className="flex-grow-1 flexbox-col dc__gap-12 p-20 dc__overflow-auto">
                <GenericInfoCardListing
                    borderVariant={GenericInfoCardBorderVariant.ROUNDED}
                    list={list}
                    searchKey={searchKey}
                    isLoading={isListLoading}
                    error={listError}
                    reloadList={reloadList}
                    handleClearFilters={clearFilters}
                    emptyStateConfig={{
                        title: 'Nothing to Clone… Yet!',
                        subTitle: `Looks like you haven’t created any ${isJobView ? 'job' : 'application'} to clone. Go ahead and start fresh — your first app awaits!`,
                    }}
                />
                {hasMoreData && isLoadingMoreJobList && <GenericInfoListSkeleton />}

                {hasMoreData && !isLoadingMoreJobList && <DetectBottom callback={handleLoadMore} hasError={hasError} />}
            </div>
        </div>
    )
}
