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

import { useEffect, useMemo, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import {
    abortPreviousRequests,
    FiltersTypeEnum,
    LARGE_PAGE_SIZE_OPTIONS,
    Nodes,
    PaginationEnum,
    SelectAllDialogStatus,
    Table,
    TableColumnType,
    TableProps,
    useAsync,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import emptyCustomChart from '@Images/empty-noresult@2x.png'
import { importComponentFromFELibrary } from '@Components/common'
import {
    getManifestResource,
    updateManifestResourceHelmApps,
} from '@Components/v2/appDetails/k8Resource/nodeDetail/nodeDetail.api'

import { NODE_LIST_HEADERS_TO_KEY_MAP } from '../Constants'
import { getResourceData } from '../ResourceBrowser.service'
import { K8SResourceListType } from '../Types'
import K8sResourceListTableCellComponent from './K8sResourceListTableCellComponent'
import NodeListSearchFilter from './NodeListSearchFilter'
import ResourceFilterOptions from './ResourceFilterOptions'
import { K8sResourceListFilterType, K8sResourceListURLParams, K8SResourceListViewWrapperProps } from './types'
import {
    getColumnComparator,
    getColumnSize,
    isItemASearchMatchForNodeListing,
    parseK8sResourceListSearchParams,
} from './utils'

const RESOURCE_FILTER_KEYS: Record<string, unknown> = importComponentFromFELibrary(
    'RESOURCE_FILTER_KEYS',
    null,
    'function',
)
const RBBulkSelectionActions = importComponentFromFELibrary('RBBulkSelectionActions', null, 'function')
const RBBulkOperations = importComponentFromFELibrary('RBBulkOperations', null, 'function')

const K8SResourceListViewWrapper = ({
    children,
    handleSearch,
    renderRefreshBar,
    searchKey,
    selectedCluster,
    selectedNamespace,
    selectedResource,
    visibleColumns,
    isNodeListing,
    allColumns,
    setVisibleColumns,
    updateSearchParams,
    eventType = 'warning',
    filteredRows,
    ...restProps
}: K8SResourceListViewWrapperProps) => (
    <div className="flexbox-col flex-grow-1 resource-list-container dc__overflow-hidden border__primary--left">
        {isNodeListing ? (
            <NodeListSearchFilter
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                allColumns={allColumns}
                searchParams={restProps as Record<string, string>}
            />
        ) : (
            <ResourceFilterOptions
                selectedResource={selectedResource}
                selectedNamespace={selectedNamespace}
                selectedCluster={selectedCluster}
                searchText={searchKey}
                setSearchText={handleSearch}
                isSearchInputDisabled={false}
                renderRefreshBar={renderRefreshBar}
                updateSearchParams={updateSearchParams}
                eventType={eventType}
                filteredRows={filteredRows}
            />
        )}

        {children}
    </div>
)

export const K8SResourceList = ({
    selectedResource,
    selectedCluster,
    addTab,
    renderRefreshBar,
    updateK8sResourceTab,
    lowercaseKindToResourceGroupMap,
}: K8SResourceListType) => {
    // HOOKS
    const location = useLocation()
    const { clusterId } = useParams<K8sResourceListURLParams>()

    // STATES
    const { selectedNamespace = 'all', ...filters } = useUrlFilters<string, K8sResourceListFilterType>({
        parseSearchParams: parseK8sResourceListSearchParams,
    })

    // REFS
    const abortControllerRef = useRef(new AbortController())

    const isNodeListing = selectedResource?.gvk.Kind === Nodes.Node
    const isEventListing = selectedResource?.gvk.Kind === Nodes.Event

    const resourceFilters = RESOURCE_FILTER_KEYS
        ? Object.entries(filters).reduce((acc, [key, value]) => {
              if (Object.values(RESOURCE_FILTER_KEYS).includes(key)) {
                  acc[key] = value
              }
              return acc
          }, {})
        : null

    const [resourceListLoader, resourceList, , reloadResourceList] = useAsync(
        () =>
            abortPreviousRequests(async () => {
                if (selectedResource) {
                    return getResourceData({
                        selectedResource,
                        selectedNamespace,
                        clusterId,
                        filters: resourceFilters,
                        abortControllerRef,
                    })
                }

                return null
            }, abortControllerRef),
        [selectedResource, clusterId, selectedNamespace, JSON.stringify(resourceFilters)],
        true,
        { resetOnChange: false },
    )

    useEffect(
        () => () => {
            abortControllerRef.current?.abort()
        },
        [],
    )

    useEffect(() => {
        updateK8sResourceTab({ url: `${location.pathname}${location.search}` })
    }, [location.pathname, location.search])

    const columns: TableColumnType[] = useMemo(
        () =>
            resourceList?.headers.map(
                (header) =>
                    ({
                        field: isNodeListing ? NODE_LIST_HEADERS_TO_KEY_MAP[header] : header,
                        label: header === 'type' && isEventListing ? '' : header,
                        size: getColumnSize(header, isEventListing),
                        CellComponent: K8sResourceListTableCellComponent,
                        comparator: getColumnComparator(header, isEventListing),
                        isSortable: !isEventListing || (header !== 'message' && header !== 'type'),
                        horizontallySticky:
                            header === 'name' || (isEventListing && (header === 'message' || header === 'type')),
                    }) as TableColumnType,
            ) ?? [],
        [resourceList?.headers],
    )

    const rows: TableProps['rows'] = useMemo(
        () =>
            resourceList?.data.map((row) => {
                const { id, ...rest } = row
                return {
                    data: rest,
                    id,
                } as TableProps['rows'][number]
            }) ?? null,
        [resourceList?.data],
    )

    const handleClearCacheAndReload = () => {
        reloadResourceList()
    }

    const tableFilter: TableProps['filter'] = (row, filterData) => {
        if (isNodeListing) {
            return isItemASearchMatchForNodeListing(row.data, filterData)
        }

        const isSearchMatch =
            !filterData.searchKey ||
            Object.entries(row.data).some(
                ([key, value]) =>
                    key !== 'id' &&
                    value !== null &&
                    value !== undefined &&
                    String(value).toLowerCase().includes(filterData.searchKey.toLowerCase()),
            )

        if (isEventListing) {
            return (
                (row.data.type as string)?.toLowerCase() ===
                    ((filterData as unknown as K8sResourceListFilterType).eventType || 'warning') && isSearchMatch
            )
        }

        return isSearchMatch
    }

    const getDefaultSortKey = () => {
        if (isEventListing) {
            return 'last seen'
        }

        return columns.some(({ field }) => field === 'namespace') ? 'namespace' : 'name'
    }

    return (
        <Table
            // key={JSON.stringify(selectedResource)}
            loading={resourceListLoader || !resourceList}
            columns={columns}
            rows={rows}
            {...(RBBulkSelectionActions && !isEventListing
                ? {
                      bulkSelectionConfig: {
                          BulkActionsComponent: RBBulkSelectionActions,
                          getSelectAllDialogStatus: () => SelectAllDialogStatus.CLOSED,
                          BulkOperationModal: RBBulkOperations,
                          bulkOperationModalData: {
                              selectedResource,
                              isNodeListing,
                              getManifestResource,
                              updateManifestResourceHelmApps,
                              clusterId: +clusterId,
                              clusterName: selectedCluster?.label ?? '',
                              handleReloadDataAfterBulkOperation: handleClearCacheAndReload,
                          },
                          bulkActionsData: {
                              showBulkRestartOption:
                                  window._env_.FEATURE_BULK_RESTART_WORKLOADS_FROM_RB.split(',')
                                      .map((feat: string) => feat.trim().toUpperCase())
                                      .indexOf(selectedResource?.gvk.Kind.toUpperCase()) > -1,
                              showNodeListingOptions: isNodeListing,
                          },
                      },
                  }
                : {})}
            emptyStateConfig={{
                noRowsConfig: {
                    image: emptyCustomChart,
                    title: `No ${selectedResource?.gvk.Kind ?? 'Resource'} found`,
                    subTitle: `We could not find any ${selectedResource?.gvk.Kind ?? 'Resource'}. Try selecting a different cluster or namespace.`,
                },
            }}
            filtersVariant={FiltersTypeEnum.URL}
            paginationVariant={PaginationEnum.PAGINATED}
            areColumnsConfigurable={isNodeListing}
            id="table__gvk-resource-list"
            additionalFilterProps={{
                parseSearchParams: parseK8sResourceListSearchParams,
                defaultPageSize: LARGE_PAGE_SIZE_OPTIONS[0].value,
                initialSortKey: getDefaultSortKey(),
            }}
            ViewWrapper={K8SResourceListViewWrapper}
            filter={tableFilter}
            additionalProps={{
                renderRefreshBar,
                selectedResource,
                selectedCluster,
                addTab,
                isNodeListing,
                isEventListing,
                lowercaseKindToResourceGroupMap,
                reloadResourceListData: handleClearCacheAndReload,
                clusterName: selectedCluster?.label ?? '',
            }}
            pageSizeOptions={!isNodeListing ? LARGE_PAGE_SIZE_OPTIONS : undefined}
        />
    )
}
