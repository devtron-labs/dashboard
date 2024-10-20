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
import {
    useAsync,
    PageHeader,
    SearchBar,
    useUrlFilters,
    SelectPickerOptionType,
    FilterSelectPicker,
    FilterChips,
} from '@devtron-labs/devtron-fe-common-lib'
import './EnvironmentsList.scss'
import EnvironmentsListView from './EnvironmentListView'
import { getClusterListMinWithoutAuth } from '../../../services/service'
import { AppGroupAdminType, AppGroupUrlFilters, AppGroupUrlFiltersType } from '../AppGroup.types'
import { parseSearchParams } from '../AppGroup.utils'

export default function EnvironmentsList({ isSuperAdmin }: AppGroupAdminType) {

    const urlFilters = useUrlFilters<never, AppGroupUrlFiltersType>({
        parseSearchParams,
    })

    const {
        searchKey,
        cluster,
        handleSearch,
        updateSearchParams,
        clearFilters,
        offset,
        pageSize,
        changePage,
        changePageSize,
    } = urlFilters

    const filterConfig = useMemo(() => {
        return { searchKey, cluster, offset, pageSize }
    }, [searchKey, JSON.stringify(cluster), offset, pageSize])

    const [clusterListLoading, clusterListRes, clusterListError, reloadClusterList] = useAsync(getClusterListMinWithoutAuth)

    const clusterOptions: SelectPickerOptionType[] = useMemo(() => {
        return clusterListRes?.result.map((clusterItem) => ({
            label: clusterItem.cluster_name,
            value: String(clusterItem.id),
        })) ?? []
    }, [clusterListRes])

    const handleApplyClusterFilter = (clusterOptions: SelectPickerOptionType[]) => {
        updateSearchParams({ cluster: clusterOptions.map((clusterItem) => String(clusterItem.value)) })
    }

    const getFormattedValue = (filterKey: AppGroupUrlFilters , filterValue: string) => {
        if (filterKey === AppGroupUrlFilters.cluster) {
            return clusterOptions.find((clusterItem) => clusterItem.value === filterValue)?.label
        }
        return filterValue
    }

    const selectedClusters: SelectPickerOptionType[] = cluster.map((clusterItem) => ({
        label: getFormattedValue(AppGroupUrlFilters.cluster, clusterItem),
        value: clusterItem,
    }))

    const renderSearch = (): JSX.Element => {
        return (
            <SearchBar
                initialSearchText={searchKey}
                containerClassName="w-250"
                handleEnter={handleSearch}
                inputProps={{
                    placeholder: 'Search environment',
                    autoFocus: true,
                }}
                dataTestId="environment-search-box"
            />
        )
    }

    const renderAppliedFilters = () => (
        <FilterChips<AppGroupUrlFiltersType>
            filterConfig={{ cluster }}
            clearFilters={clearFilters}
            className="px-20"
            onRemoveFilter={updateSearchParams}
            getFormattedValue={getFormattedValue}
        />
    )

    return (
        <div>
            <PageHeader headerName="Application Groups" showAnnouncementHeader />
            <div className="env-list bcn-0">
                <div className="flex dc__content-space pl-20 pr-20 pt-16 pb-16" data-testid="search-env-and-cluster">
                    {renderSearch()}
                    <FilterSelectPicker
                        placeholder="Clusters"
                        inputId="app-group-cluster-filter"
                        options={clusterOptions}
                        appliedFilterOptions={selectedClusters}
                        isDisabled={clusterListLoading}
                        isLoading={clusterListLoading}
                        optionListError={clusterListError}
                        reloadOptionList={reloadClusterList}
                        handleApplyFilter={handleApplyClusterFilter}
                        shouldMenuAlignRight
                    />
                </div>
                {renderAppliedFilters()}
                <EnvironmentsListView
                    isSuperAdmin={isSuperAdmin}
                    filterConfig={filterConfig}
                    clearFilters={clearFilters}
                    changePage={changePage}
                    changePageSize={changePageSize}
                />
            </div>
        </div>
    )
}
