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

import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import {
    abortPreviousRequests,
    FiltersTypeEnum,
    K8sResourceDetailType,
    Nodes,
    noop,
    PaginationEnum,
    ResponseType,
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

import { SIDEBAR_KEYS } from '../Constants'
import { cacheResult, clearCacheRepo, getResourceData } from '../ResourceBrowser.service'
import { K8SResourceListType } from '../Types'
import { removeDefaultForStorageClass, sortEventListData } from '../Utils'
import K8sResourceListTableCellComponent from './K8sResourceListTableCellComponent'
import NodeListSearchFilter from './NodeListSearchFilter'
import ResourceFilterOptions from './ResourceFilterOptions'
import {
    BulkOperationsModalState,
    K8sResourceListFilterType,
    K8sResourceListURLParams,
    K8SResourceListViewWrapperProps,
} from './types'
import { dynamicSort, isItemASearchMatchForNodeListing, parseK8sResourceListSearchParams } from './utils'

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
    updateK8sResourceTab,
    searchKey,
    selectedCluster,
    selectedNamespace,
    selectedResource,
    visibleColumns,
    isNodeListing,
    allColumns,
    setVisibleColumns,
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
                updateK8sResourceTab={updateK8sResourceTab}
                areFiltersHidden={false}
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
    const [bulkOperationModalState, setBulkOperationModalState] = useState<BulkOperationsModalState>('closed')

    // REFS
    const abortControllerRef = useRef(new AbortController())

    const isNodeListing = selectedResource?.gvk.Kind === Nodes.Node

    const resourceFilters = RESOURCE_FILTER_KEYS
        ? Object.entries(filters).reduce((acc, [key, value]) => {
              if (Object.values(RESOURCE_FILTER_KEYS).includes(key)) {
                  acc[key] = value
              }
              return acc
          }, {})
        : null

    const [resourceListLoader, _resourceList, , reloadResourceList] = useAsync(
        () =>
            abortPreviousRequests(
                () =>
                    selectedResource &&
                    cacheResult<ResponseType<K8sResourceDetailType>>(`${location.pathname}${location.search}`, () =>
                        getResourceData({
                            selectedResource,
                            selectedNamespace,
                            clusterId,
                            filters,
                            abortControllerRef,
                        }),
                    ),
                abortControllerRef,
            ),
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

    const resourceList = useMemo(() => {
        if (!_resourceList) {
            return null
        }
        const result = structuredClone(_resourceList.result)
        switch (selectedResource?.gvk.Kind) {
            case SIDEBAR_KEYS.eventGVK.Kind:
                result.data = sortEventListData(result.data)
                break
            case Nodes.StorageClass:
                result.data = removeDefaultForStorageClass(result.data)
                break
            default:
                break
        }
        return result
    }, [_resourceList])

    const isEventListing = selectedResource?.gvk.Kind === Nodes.Event

    const getColumnSize = (field: string) => {
        if (!isEventListing) {
            return {
                range: {
                    maxWidth: 600,
                    minWidth: field === 'name' ? 200 : 180,
                    startWidth: field === 'name' ? 300 : 200,
                },
            }
        }

        switch (field) {
            case 'message':
                return { fixed: 400 }
            case 'type':
                return { fixed: 80 }
            case 'namespace':
            case 'involved object':
            case 'source':
                return { fixed: 150 }
            default:
                return { fixed: 80 }
        }
    }

    const getColumnComparator = (field: string) => {
        if (isEventListing) {
            return (a: any, b: any) => String(a).localeCompare(String(b))
        }

        return dynamicSort(field)
    }

    const columns: TableColumnType[] = useMemo(
        () =>
            resourceList?.headers.map(
                (header) =>
                    ({
                        field: header,
                        label: header,
                        size: getColumnSize(header),
                        CellComponent: K8sResourceListTableCellComponent,
                        comparator: getColumnComparator(header),
                        isSortable: true,
                    }) as TableColumnType,
            ) ?? [],
        [resourceList?.headers],
    )

    const rows: TableProps['rows'] = useMemo(
        () =>
            resourceList?.data.map(
                (row, index) =>
                    ({
                        data: row,
                        id:
                            selectedResource.gvk.Kind === Nodes.Event
                                ? index
                                : `${row.name}-${row.namespace}-${row.status}`,
                    }) as TableProps['rows'][number],
            ) ?? null,
        [resourceList?.data],
    )

    const getBulkOperationsModalStateSetter = (option: BulkOperationsModalState) => () => {
        setBulkOperationModalState(option)
    }

    const renderBulkActions = () => (
        <RBBulkSelectionActions
            handleOpenBulkDeleteModal={getBulkOperationsModalStateSetter('delete')}
            handleOpenRestartWorkloadModal={getBulkOperationsModalStateSetter('restart')}
            showBulkRestartOption={
                window._env_.FEATURE_BULK_RESTART_WORKLOADS_FROM_RB.split(',')
                    .map((feat: string) => feat.trim().toUpperCase())
                    .indexOf(selectedResource.gvk.Kind.toUpperCase()) > -1
            }
            showNodeListingOptions={isNodeListing}
            handleOpenCordonNodeModal={getBulkOperationsModalStateSetter('cordon')}
            handleOpenUncordonNodeModal={getBulkOperationsModalStateSetter('uncordon')}
            handleOpenDrainNodeModal={getBulkOperationsModalStateSetter('drain')}
        />
    )

    const handleClearCacheAndReload = () => {
        clearCacheRepo()
        reloadResourceList()
    }

    return (
        <Table
            loading={resourceListLoader || resourceList === null}
            columns={columns}
            rows={rows}
            bulkSelectionConfig={
                RBBulkSelectionActions
                    ? {
                          BulkActionsComponent: renderBulkActions,
                          getSelectAllDialogStatus: () => SelectAllDialogStatus.CLOSED,
                          // TODO: maybe this is not required
                          onBulkSelectionChanged: noop,
                      }
                    : undefined
            }
            emptyStateConfig={{
                noRowsConfig: {
                    image: emptyCustomChart,
                    title: 'No resources found',
                    subTitle: `We could not find any ${selectedResource?.gvk.Kind ?? 'Resource'}. Try selecting a different cluster or namespace.`,
                },
            }}
            filtersVariant={FiltersTypeEnum.URL}
            paginationVariant={PaginationEnum.PAGINATED}
            areColumnsConfigurable={isNodeListing}
            id="table__gvk-resource-list"
            additionalFilterProps={{ parseSearchParams: parseK8sResourceListSearchParams }}
            ViewWrapper={K8SResourceListViewWrapper}
            filter={(row, filterData) => {
                if (isNodeListing) {
                    return isItemASearchMatchForNodeListing(row.data, filterData)
                }

                return Object.entries(row.data).some(
                    ([key, value]) =>
                        key !== 'id' && String(value).toLowerCase().includes(filterData.searchKey.toLowerCase()),
                )
            }}
            additionalProps={{
                renderRefreshBar,
                updateK8sResourceTab,
                selectedResource,
                selectedCluster,
                addTab,
                isNodeListing,
                isEventListing,
                lowercaseKindToResourceGroupMap,
                reloadResourceListData: handleClearCacheAndReload,
            }}
        >
            {RBBulkOperations && bulkOperationModalState !== 'closed' && (
                <RBBulkOperations
                    handleModalClose={getBulkOperationsModalStateSetter('closed')}
                    handleReloadDataAfterBulkOperation={handleClearCacheAndReload}
                    operationType={bulkOperationModalState}
                    allResources={resourceList?.data ?? []}
                    selectedResource={selectedResource}
                    clusterName={selectedCluster?.label ?? ''}
                    clusterId={clusterId}
                    isNodeListing={isNodeListing}
                    getManifestResource={getManifestResource}
                    updateManifestResourceHelmApps={updateManifestResourceHelmApps}
                />
            )}
        </Table>
    )
}
