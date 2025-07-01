import { ErrorScreenManager, URLS } from '@devtron-labs/devtron-fe-common-lib'

import ResourceFilterOptions from './ResourceFilterOptions'
import { ResourceRecommenderTableViewWrapperProps } from './types'

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
    resourceLastScannedOnDetails,
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
            resourceLastScannedOnDetails={resourceLastScannedOnDetails}
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
