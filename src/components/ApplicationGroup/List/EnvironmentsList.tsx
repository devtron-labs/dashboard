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
    ErrorScreenManager,
    FeatureTitleWithInfo,
    FilterChips,
    FilterSelectPicker,
    GenericEmptyState,
    ImageType,
    PageHeader,
    SearchBar,
    SelectPickerOptionType,
    useAsync,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import appGroupEmpty from '@Images/application-group-empty-state.webp'

import { getClusterListMinWithoutAuth } from '../../../services/service'
import { getEnvAppList } from '../AppGroup.service'
import { AppGroupAdminType, AppGroupUrlFilters, AppGroupUrlFiltersType } from '../AppGroup.types'
import { parseSearchParams } from '../AppGroup.utils'
import EnvironmentsListView from './EnvironmentListView'

import './EnvironmentsList.scss'

const renderAppGroupDescriptionContent = () =>
    'Application Groups represent an environment and display all applications deployed to it. They simplify deploying interdependent microservices by allowing you to build and deploy multiple applications together.'

const renderAdditionalHeaderInfo = () => (
    <FeatureTitleWithInfo
        title="Application Groups"
        docLink="APP_GROUP"
        showInfoIconTippy
        renderDescriptionContent={renderAppGroupDescriptionContent}
    />
)

const EnvironmentsList = ({ isSuperAdmin }: AppGroupAdminType) => {
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

    const filterConfig = useMemo(
        () => ({ searchKey, cluster, offset, pageSize }),
        [searchKey, JSON.stringify(cluster), offset, pageSize],
    )

    const [appListLoading, appListResponse, appListError, reloadAppList] = useAsync(
        () => getEnvAppList(filterConfig),
        [filterConfig],
    )
    const areFiltersApplied = filterConfig.searchKey || filterConfig.cluster.length > 0

    const [clusterListLoading, clusterListRes, clusterListError, reloadClusterList] =
        useAsync(getClusterListMinWithoutAuth)

    const clusterOptions: SelectPickerOptionType<string, string>[] = useMemo(
        () =>
            clusterListRes?.result.map((clusterItem) => ({
                label: clusterItem.cluster_name,
                value: String(clusterItem.id),
            })) ?? [],
        [clusterListRes],
    )

    const handleApplyClusterFilter = (_clusterOptions: SelectPickerOptionType[]) => {
        updateSearchParams({ cluster: _clusterOptions.map((clusterItem) => String(clusterItem.value)) })
    }

    const getFormattedValue = (filterKey: AppGroupUrlFilters, filterValue: string) => {
        if (filterKey === AppGroupUrlFilters.cluster) {
            return clusterOptions.find((clusterItem) => clusterItem.value === filterValue)?.label
        }
        return filterValue
    }

    const selectedClusters: SelectPickerOptionType[] = cluster.map((clusterItem) => ({
        label: getFormattedValue(AppGroupUrlFilters.cluster, clusterItem),
        value: clusterItem,
    }))

    const renderSearch = (): JSX.Element => (
        <SearchBar
            initialSearchText={searchKey}
            containerClassName="w-250"
            handleEnter={handleSearch}
            inputProps={{
                placeholder: 'Search environment',
                autoFocus: true,
            }}
            dataTestId="environment-search-box"
            keyboardShortcut="/"
        />
    )

    const renderAppliedFilters = () => (
        <FilterChips<AppGroupUrlFiltersType>
            filterConfig={{ cluster }}
            clearFilters={clearFilters}
            className="px-20"
            onRemoveFilter={updateSearchParams}
            getFormattedValue={getFormattedValue}
        />
    )

    const renderHeader = () => (
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
    )

    const renderBody = () => {
        if (!appListLoading) {
            if (appListError) {
                return (
                    <div className="flexbox-col flex-grow-1">
                        {areFiltersApplied && (
                            <>
                                {renderHeader()}
                                {renderAppliedFilters()}
                            </>
                        )}
                        <ErrorScreenManager code={appListError?.code} reload={reloadAppList} />
                    </div>
                )
            }

            if (!appListResponse?.result?.envList?.length && !areFiltersApplied) {
                return (
                    <div className="h-100">
                        <GenericEmptyState
                            image={appGroupEmpty}
                            imageType={ImageType.Large}
                            title="Your Applications, Organized by Environments"
                            subTitle="Application Groups show deployed applications by environment. If you don't see any, you either lack access or no applications are deployed in your environments."
                        />
                    </div>
                )
            }
        }

        return (
            <div className="env-list bg__primary">
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
                    appListLoading={appListLoading}
                    appListResponse={appListResponse}
                />
            </div>
        )
    }

    return (
        <div className="flexbox-col h-100 dc__overflow-auto">
            <PageHeader additionalHeaderInfo={renderAdditionalHeaderInfo} />
            {renderBody()}
        </div>
    )
}

export default EnvironmentsList
