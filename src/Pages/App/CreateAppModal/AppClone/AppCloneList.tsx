import {
    ComponentSizeType,
    GenericInfoCardBorderVariant,
    SearchBar,
    useStateFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { GenericInfoCardListing } from './GenericInfoCardListing'
import { AppCloneListProps } from './types'
import { useDevtronCloneList } from './useDevtronCloneList'

export const AppCloneList = ({ handleCloneAppClick, isJobView }: AppCloneListProps) => {
    const { searchKey, handleSearch, clearFilters } = useStateFilters()
    const { isListLoading, list, listError, reloadList } = useDevtronCloneList({
        handleCloneAppClick,
        isJobView,
    })

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
                        title: 'Add your first app template',
                        subTitle: 'test',
                    }}
                />
            </div>
        </div>
    )
}
