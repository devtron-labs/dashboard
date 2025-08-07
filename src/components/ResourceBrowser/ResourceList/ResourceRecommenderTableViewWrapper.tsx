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
