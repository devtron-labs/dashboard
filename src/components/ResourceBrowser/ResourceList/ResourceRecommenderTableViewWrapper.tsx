import { ErrorScreenManager, TableViewWrapperProps, URLS } from '@devtron-labs/devtron-fe-common-lib'

import { ResourceFilterOptionsProps } from '../Types'
import ResourceFilterOptions from './ResourceFilterOptions'

interface ResourceRecommenderTableViewWrapperProps extends ResourceFilterOptionsProps, TableViewWrapperProps {
    resourceListError: any
    reloadResourceListData: () => void
}

export const ResourceRecommenderTableViewWrapper = ({
    children,
    resourceListError,
    reloadResourceListData,
    searchKey,
    handleSearch,
    filteredRows,
    isResourceListLoading,
    selectedResource,
    gvkFilterConfig,
    updateSearchParams,
    selectedNamespace,
    selectedCluster,
    resourceRecommenderConfig,
    selectedKindGVKFilter,
    selectedAPIVersionGVKFilter,
}: ResourceRecommenderTableViewWrapperProps) => (
    <div className="resource-list-container flexbox-col flex-grow-1 border__primary--left dc__overflow-hidden">
        <ResourceFilterOptions
            searchText={searchKey}
            setSearchText={handleSearch}
            searchPlaceholder="Search"
            filteredRows={filteredRows}
            isResourceListLoading={isResourceListLoading}
            selectedResource={selectedResource}
            gvkFilterConfig={gvkFilterConfig}
            updateSearchParams={updateSearchParams}
            selectedNamespace={selectedNamespace}
            selectedCluster={selectedCluster}
            resourceRecommenderConfig={resourceRecommenderConfig}
            selectedKindGVKFilter={selectedKindGVKFilter}
            selectedAPIVersionGVKFilter={selectedAPIVersionGVKFilter}
        />

        {resourceListError ? (
            <ErrorScreenManager
                code={resourceListError?.code}
                redirectURL={URLS.RESOURCE_BROWSER}
                reload={reloadResourceListData}
            />
        ) : (
            children
        )}
    </div>
)
