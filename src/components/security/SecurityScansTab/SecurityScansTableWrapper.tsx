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
    ComponentSizeType,
    FilterChips,
    GroupedFilterSelectPicker,
    GroupedFilterSelectPickerProps,
    SearchBar,
    SegmentedControl,
    SegmentedControlProps,
    SelectPickerOptionType,
    SEVERITY_LABEL_MAP,
    Severity,
    TableViewWrapperProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { useGetAppSecurityDetails } from '@Components/app/details/appDetails/AppSecurity'
import { importComponentFromFELibrary } from '@Components/common'

import { SecurityModal } from '@devtron-labs/devtron-fe-common-lib'
import { VulnerabilitySummary, VulnerabilityViewTypeSelect } from '../Vulnerabilities'
import { SecurityScanType } from '../security.types'
import { INITIAL_SCAN_DETAILS, SCANNED_UNSCANNED_CONTROL_SEGMENTS } from './constants'
import {
    ScanDetailsType,
    ScanListUrlFiltersType,
    ScanTypeOptions,
    SecurityScansTabMultiFilterKeys,
} from './types'
import { getGroupFilterItems } from './utils'

const SecurityModalSidebar = importComponentFromFELibrary('SecurityModalSidebar', null, 'function')

interface SecurityScansTableWrapperProps extends TableViewWrapperProps<SecurityScanType> {
    severity: string[]
    cluster: string[]
    environment: string[]
    scanStatus: ScanTypeOptions
    clusterEnvListLoading: boolean
    clusterEnvListResult: Record<SecurityScansTabMultiFilterKeys, SelectPickerOptionType[]>
    clusterEnvListError: Error
    reloadClusterEnvOptions: () => void
    updateSearchParams: (params: Partial<ScanListUrlFiltersType>) => void
    clearFilters: () => void
    scanDetails: ScanDetailsType
    setScanDetails: (details: ScanDetailsType) => void
}
}

const SecurityScansTableWrapper = ({
    searchKey,
    isLoading,
    handleSearch,
    severity,
    cluster,
    environment,
    scanStatus,
    clusterEnvListLoading,
    clusterEnvListResult,
    clusterEnvListError,
    reloadClusterEnvOptions,
    updateSearchParams,
    clearFilters,
    scanDetails,
    setScanDetails,
}: SecurityScansTableWrapperProps) => {
    const { scanResultLoading, scanResultResponse, scanResultError } = useGetAppSecurityDetails({
        appId: scanDetails.appId,
        envId: scanDetails.envId,
    })

    const isNotScannedList = scanStatus === ScanTypeOptions.NOT_SCANNED
    const areGroupedFiltersActive = !!severity.length || !!cluster.length || !!environment.length

    const getLabelFromValue = (filterLabel: SecurityScansTabMultiFilterKeys, filterValue: string): string => {
        switch (filterLabel) {
            case SecurityScansTabMultiFilterKeys.cluster:
                return (
                    (clusterEnvListResult?.cluster.find((clusterOption) => clusterOption.value === filterValue)
                        ?.label as string) || filterValue
                )
            case SecurityScansTabMultiFilterKeys.environment:
                return (
                    (clusterEnvListResult?.environment.find((envOption) => envOption.value === filterValue)
                        ?.label as string) || filterValue
                )
            case SecurityScansTabMultiFilterKeys.severity:
                return SEVERITY_LABEL_MAP[filterValue as Severity]
            default:
                return filterValue
        }
    }

    const getFilterUpdateHandler =
        (filterKey: SecurityScansTabMultiFilterKeys) => (selectedOption: SelectPickerOptionType[]) => {
            updateSearchParams({ [filterKey]: selectedOption.map((option) => String(option.value)) })
        }

    const handleSegmentControlChange: SegmentedControlProps['onChange'] = (selectedSegment) => {
        updateSearchParams({
            scanStatus: selectedSegment.value as ScanTypeOptions,
            severity: [],
            cluster: [],
            environment: [],
        })
        handleSearch('')
    }

    const selectedSeverities = severity.map((severityId) => ({
        label: SEVERITY_LABEL_MAP[severityId as Severity],
        value: severityId,
    }))

    const selectedEnvironments = environment.map((envId) => ({
        label: getLabelFromValue(SecurityScansTabMultiFilterKeys.environment, envId),
        value: envId,
    }))

    const selectedClusters = cluster.map((clusterId) => ({
        label: getLabelFromValue(SecurityScansTabMultiFilterKeys.cluster, clusterId),
        value: clusterId,
    }))

    const handleCloseScanDetailsModal = () => {
        setScanDetails(INITIAL_SCAN_DETAILS)
    }

    const groupedFiltersPropsMap: GroupedFilterSelectPickerProps['filterSelectPickerPropsMap'] = useMemo(
        () => ({
            [SecurityScansTabMultiFilterKeys.cluster]: {
                inputId: 'scan-list-cluster-filter',
                placeholder: 'Cluster',
                isDisabled: clusterEnvListLoading,
                isLoading: clusterEnvListLoading,
                appliedFilterOptions: selectedClusters,
                handleApplyFilter: getFilterUpdateHandler(SecurityScansTabMultiFilterKeys.cluster),
                options: clusterEnvListResult?.cluster ?? [],
                optionListError: clusterEnvListError,
                reloadOptions: reloadClusterEnvOptions,
            },
            [SecurityScansTabMultiFilterKeys.environment]: {
                inputId: 'scan-list-environment-filter',
                placeholder: 'Environment',
                isDisabled: clusterEnvListLoading,
                isLoading: clusterEnvListLoading,
                appliedFilterOptions: selectedEnvironments,
                handleApplyFilter: getFilterUpdateHandler(SecurityScansTabMultiFilterKeys.environment),
                options: clusterEnvListResult?.environment ?? [],
                optionListError: clusterEnvListError,
                reloadOptions: reloadClusterEnvOptions,
            },
            [SecurityScansTabMultiFilterKeys.severity]: {
                inputId: 'scan-list-severity-filter',
                placeholder: 'Severity',
                isDisabled: clusterEnvListLoading,
                isLoading: clusterEnvListLoading,
                appliedFilterOptions: selectedSeverities,
                handleApplyFilter: getFilterUpdateHandler(SecurityScansTabMultiFilterKeys.severity),
                options: clusterEnvListResult?.severity ?? [],
                optionListError: clusterEnvListError,
                reloadOptions: reloadClusterEnvOptions,
            },
        }),
        [clusterEnvListLoading, clusterEnvListResult, selectedClusters, selectedEnvironments, selectedSeverities],
    )

    const renderScanDetailsModal = () => {
        if (scanDetails.appId && scanDetails.envId) {
            return (
                <SecurityModal
                    handleModalClose={handleCloseScanDetailsModal}
                    Sidebar={SecurityModalSidebar}
                    isLoading={scanResultLoading}
                    error={scanResultError}
                    responseData={scanResultResponse?.result}
                />
            )
        }
        return null
    }

    return (
        <>
            <div className="flexbox-col dc__gap-12 px-20 py-16">
                <div className="flex dc__content-space">
                    <div className="flex dc__gap-8">
                        <VulnerabilityViewTypeSelect />
                        <SearchBar
                            containerClassName="w-250"
                            initialSearchText={searchKey}
                            inputProps={{
                                placeholder: 'Search application',
                                disabled: isLoading,
                            }}
                            handleEnter={handleSearch}
                            size={ComponentSizeType.large}
                            keyboardShortcut="/"
                        />
                        <SegmentedControl
                            name="filter-scanned-unscanned-deployments"
                            segments={SCANNED_UNSCANNED_CONTROL_SEGMENTS}
                            value={scanStatus}
                            onChange={handleSegmentControlChange}
                        />
                    </div>
                    <GroupedFilterSelectPicker<SecurityScansTabMultiFilterKeys>
                        id="grouped-scan-list-filters"
                        options={getGroupFilterItems(scanStatus)}
                        filterSelectPickerPropsMap={groupedFiltersPropsMap}
                        isFilterApplied={areGroupedFiltersActive}
                    />
                </div>
                <FilterChips<Omit<ScanListUrlFiltersType, 'scanStatus'>>
                    filterConfig={{
                        severity,
                        cluster,
                        environment,
                    }}
                    getFormattedValue={getLabelFromValue}
                    onRemoveFilter={updateSearchParams}
                    clearFilters={clearFilters}
                    clearButtonClassName="dc__no-background-imp dc__no-border-imp dc__tab-focus"
                />
                {!isNotScannedList && (
                    <VulnerabilitySummary
                        filters={{
                            severity,
                            cluster,
                            environment,
                        }}
                    />
                )}
            </div>
            {!isNotScannedList && renderScanDetailsModal()}
        </>
    )
}

export default SecurityScansTableWrapper
