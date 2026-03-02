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

import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import {
    CollapsibleList,
    ErrorScreenManager,
    FiltersTypeEnum,
    GenericEmptyState,
    ImageType,
    K8sResourceDetailDataType,
    LARGE_PAGE_SIZE_OPTIONS,
    PaginationEnum,
    Progressing,
    ROUTER_URLS,
    Table,
    TARGET_K8S_VERSION_SEARCH_KEY,
    URL_FILTER_KEYS,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import emptyCustomChart from '@Images/empty-noresult@2x.png'
import { ReactComponent as NoOffendingPipeline } from '@Images/no-offending-pipeline.svg'
import { importComponentFromFELibrary } from '@Components/common'

import { ClusterDetailBaseParams } from '../Types'
import ClusterUpgradeCompatibilityInfoTableCellComponent from './ClusterUpgradeCompatibilityInfoTableCellComponent'
import ClusterUpgradeCompatibilityInfoTableWrapper from './ClusterUpgradeCompatibilityInfoTableWrapper'
import {
    ClusterUpgradeCompatibilityInfoProps,
    ClusterUpgradeCompatibilityInfoTableAdditionalProps,
    ClusterUpgradeCompatibilityInfoTableProps,
} from './types'
import { dynamicSort } from './utils'

const useClusterUpgradeCompatibilityInfo = importComponentFromFELibrary(
    'useClusterUpgradeCompatibilityInfo',
    null,
    'function',
)

const ClusterUpgradeCompatibilityInfo = ({
    updateTabUrl,
    clusterName,
    lowercaseKindToResourceGroupMap,
}: ClusterUpgradeCompatibilityInfoProps) => {
    const { clusterId } = useParams<ClusterDetailBaseParams>()
    const targetK8sVersion = useSearchString().queryParams.get(TARGET_K8S_VERSION_SEARCH_KEY)
    const navigate = useNavigate()
    const location = useLocation()

    const {
        isLoading,
        compatibilityInfoData,
        compatibilityError,
        refetchCompatibilityList,
        resourceListForCurrentData,
        sidebarConfig,
        onCollapseBtnClick,
    } = useClusterUpgradeCompatibilityInfo({
        targetK8sVersion,
        clusterId,
        updateTabUrl,
    })

    const { columns, rows } = useMemo<{
        columns: ClusterUpgradeCompatibilityInfoTableProps['columns']
        rows: ClusterUpgradeCompatibilityInfoTableProps['rows']
    }>(
        () => ({
            columns: resourceListForCurrentData.headers.map((header: string) => ({
                field: header,
                label: header,
                size: {
                    range: {
                        maxWidth: 600,
                        minWidth: header === 'name' ? 200 : 180,
                        startWidth: header === 'name' ? 300 : 200,
                    },
                },
                comparator: dynamicSort(header),
                isSortable: true,
                CellComponent: ClusterUpgradeCompatibilityInfoTableCellComponent,
            })),
            rows: resourceListForCurrentData.data.map((row: Record<string, string | number | object>) => ({
                data: row,
                id: JSON.stringify(row),
            })),
        }),
        [resourceListForCurrentData],
    )

    if (isLoading) {
        return (
            <div className="flex column h-100">
                <Progressing size={32} styles={{ height: 'auto' }} />
                <div className="flex column">
                    <h2 className="fs-16 fw-6 lh-24 mt-20">Scanning resources</h2>
                    <p className="fs-13 fw-4 lh-20 w-300 text-center m-0">
                        Checking resources for upgrade compatibility with Kubernetes version v{targetK8sVersion}
                    </p>
                </div>
            </div>
        )
    }

    if (compatibilityError) {
        return (
            <ErrorScreenManager
                code={compatibilityError.code}
                reload={refetchCompatibilityList}
                redirectURL={ROUTER_URLS.RESOURCE_BROWSER.ROOT}
            />
        )
    }

    if (!targetK8sVersion) {
        return <GenericEmptyState title="Target kubernetes version is not specified" />
    }

    if (!compatibilityInfoData?.length) {
        return (
            <GenericEmptyState
                imageType={ImageType.Large}
                SvgImage={NoOffendingPipeline}
                title={`Safe to upgrade ‘${clusterName}’ to ‘v${targetK8sVersion}’`}
                subTitle={`API versions of all resources in this cluster are compatible with Kubernetes v${targetK8sVersion}`}
            />
        )
    }

    const tableFilter: ClusterUpgradeCompatibilityInfoTableProps['filter'] = (row, filterData) =>
        !filterData.searchKey ||
        Object.entries(row.data).some(
            ([key, value]) =>
                key !== 'id' &&
                value !== null &&
                value !== undefined &&
                String(value).toLowerCase().includes(filterData.searchKey.toLowerCase()),
        )

    const clearFilters = () => {
        const searchParams = new URLSearchParams(location.search)
        searchParams.delete(URL_FILTER_KEYS.SEARCH_KEY)
        navigate({ search: searchParams.toString() })
    }

    return (
        <div className="flexbox h-100 dc__overflow-hidden">
            <div className="dc__overflow-auto p-8 w-220 dc__no-shrink">
                <CollapsibleList tabType="navLink" config={sidebarConfig} onCollapseBtnClick={onCollapseBtnClick} />
            </div>

            <Table<K8sResourceDetailDataType, FiltersTypeEnum.URL, ClusterUpgradeCompatibilityInfoTableAdditionalProps>
                columns={columns}
                rows={rows}
                emptyStateConfig={{
                    noRowsConfig: {
                        image: emptyCustomChart,
                        title: 'No resources found',
                        subTitle: `No resources found in this cluster for upgrade compatibility check`,
                    },
                }}
                filtersVariant={FiltersTypeEnum.URL}
                id="table__cluster-upgrade-compatibility-info"
                paginationVariant={PaginationEnum.PAGINATED}
                ViewWrapper={ClusterUpgradeCompatibilityInfoTableWrapper}
                additionalFilterProps={{
                    initialSortKey: 'namespace',
                    defaultPageSize: LARGE_PAGE_SIZE_OPTIONS[0].value,
                }}
                filter={tableFilter}
                additionalProps={{
                    lowercaseKindToResourceGroupMap,
                    reloadResourceListData: refetchCompatibilityList,
                }}
                pageSizeOptions={LARGE_PAGE_SIZE_OPTIONS}
                clearFilters={clearFilters}
            />
        </div>
    )
}

export default ClusterUpgradeCompatibilityInfo
