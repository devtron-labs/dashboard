import {
    Button,
    ComponentSizeType,
    DetectBottom,
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

                <SearchBar
                    dataTestId="template-list-search"
                    initialSearchText={searchKey}
                    size={ComponentSizeType.medium}
                    handleEnter={handleSearch}
                    inputProps={{
                        placeholder: `Search ${isJobView ? 'job' : 'application'}`,
                    }}
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
                        subTitle: `You haven’t created any ${isJobView ? 'job' : 'application'} to clone. Kick things off by crafting one from scratch—it’s quick and easy!`,
                        renderButton: renderCreateFromScratchButton,
                    }}
                />
                {hasMoreData && isLoadingMore && <GenericInfoListSkeleton />}

                {hasMoreData && !isLoadingMore && <DetectBottom callback={handleLoadMore} hasError={hasError} />}
            </div>
        </div>
    )
}
