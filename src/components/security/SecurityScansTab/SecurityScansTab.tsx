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

import { useMemo, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import dayjs from 'dayjs'

import {
    abortPreviousRequests,
    ComponentSizeType,
    DATE_TIME_FORMATS,
    DEFAULT_BASE_PAGE_SIZE,
    EMPTY_STATE_STATUS,
    ErrorScreenManager,
    FilterChips,
    GenericEmptyState,
    GenericFilterEmptyState,
    getIsRequestAborted,
    GroupedFilterSelectPicker,
    GroupedFilterSelectPickerProps,
    Icon,
    noop,
    Pagination,
    ScanTypeOptions,
    SearchBar,
    SecurityModal,
    SegmentedControl,
    SegmentedControlProps,
    SelectPickerOptionType,
    Severity,
    SEVERITY_LABEL_MAP,
    SortableTableHeaderCell,
    URLS,
    useAsync,
    useUrlFilters,
    ZERO_TIME_STRING,
} from '@devtron-labs/devtron-fe-common-lib'

import { useGetAppSecurityDetails } from '@Components/app/details/appDetails/AppSecurity'
import { importComponentFromFELibrary } from '@Components/common'

import AppNotDeployed from '../../../assets/img/app-not-deployed.svg'
import { getSecurityScanList, getVulnerabilityFilterData } from '../security.service'
import { SecurityScanType } from '../security.types'
import { VulnerabilityViewTypeSelect } from '../Vulnerabilities'
import { INITIAL_SCAN_DETAILS, SCANNED_UNSCANNED_CONTROL_SEGMENTS } from './constants'
import {
    ScanDetailsType,
    ScanListPayloadType,
    ScanListUrlFiltersType,
    SecurityListSortableKeys,
    SecurityScansTabMultiFilterKeys,
    SeverityFilterValues,
} from './types'
import { getGroupFilterItems, getSeverityWithCount, parseSearchParams } from './utils'

const SecurityModalSidebar = importComponentFromFELibrary('SecurityModalSidebar', null, 'function')

const SecurityScansTab = () => {
    const { push } = useHistory()
    const urlFilters = useUrlFilters<SecurityListSortableKeys, Partial<ScanListUrlFiltersType>>({
        parseSearchParams,
        initialSortKey: SecurityListSortableKeys.APP_NAME,
    })
    const [scanDetails, setScanDetails] = useState<ScanDetailsType>(INITIAL_SCAN_DETAILS)
    const {
        searchKey,
        pageSize,
        offset,
        severity,
        environment,
        cluster,
        sortBy,
        sortOrder,
        scanStatus,
        handleSorting,
        changePage,
        changePageSize,
        clearFilters,
        handleSearch,
        updateSearchParams,
    } = urlFilters

    const { scanResultLoading, scanResultResponse, scanResultError } = useGetAppSecurityDetails({
        appId: scanDetails.appId,
        envId: scanDetails.envId,
    })

    const payload: ScanListPayloadType = {
        offset,
        size: pageSize,
        appName: searchKey,
        severity: severity.map((severityFilterValue) => SeverityFilterValues[severityFilterValue]),
        clusterIds: cluster.map((clusterId) => +clusterId),
        envIds: environment.map((envId) => +envId),
        sortBy,
        sortOrder,
        scanStatus,
    }

    const filterConfig = useMemo(
        () => ({ offset, pageSize, searchKey, sortBy, sortOrder, severity, cluster, environment, scanStatus }),
        [
            offset,
            pageSize,
            searchKey,
            sortBy,
            sortOrder,
            scanStatus,
            JSON.stringify(severity),
            JSON.stringify(cluster),
            JSON.stringify(environment),
        ],
    )

    const areGroupedFiltersActive = !!severity.length || !!cluster.length || !!environment.length
    const areFiltersActive = searchKey || areGroupedFiltersActive

    const [clusterEnvListLoading, clusterEnvListResult, clusterEnvListError, reloadClusterEnvOptions] = useAsync(() =>
        getVulnerabilityFilterData(),
    )

    const getClusterLabelFromId = (clusterId: string) => {
        const option = clusterEnvListResult?.cluster.find((clusterOption) => clusterOption.value === clusterId)
        return `${option?.label || ''}`
    }

    const getEnvLabelFromId = (envId: string) => {
        const option = clusterEnvListResult?.environment.find((envOption) => envOption.value === envId)
        return `${option?.label || ''}`
    }

    const getLabelFromValue = (filterLabel: string, filterValue: string): string => {
        if (filterLabel === SecurityScansTabMultiFilterKeys.environment) {
            return getEnvLabelFromId(filterValue)
        }
        if (filterLabel === SecurityScansTabMultiFilterKeys.cluster) {
            return getClusterLabelFromId(filterValue)
        }
        return SEVERITY_LABEL_MAP[filterValue as Severity]
    }

    const abortControllerRef = useRef(new AbortController())
    const [scanListLoading, securityScansResult, scanListError, reloadScansList] = useAsync(
        () =>
            abortPreviousRequests(
                () => getSecurityScanList(payload, abortControllerRef.current.signal),
                abortControllerRef,
            ),
        [filterConfig],
    )

    const isLoading = scanListLoading || getIsRequestAborted(scanListError)
    const isNotScannedList = scanStatus === ScanTypeOptions.NOT_SCANNED

    const getFilterUpdateHandler =
        (filterKey: SecurityScansTabMultiFilterKeys) => (selectedOption: SelectPickerOptionType[]) => {
            updateSearchParams({ [filterKey]: selectedOption.map((option) => String(option.value)) })
        }

    const handleSegmentControlChange: SegmentedControlProps['onChange'] = (selectedSegment) => {
        // Clear all filters and set only scanStatus in a single operation
        // This ensures scanStatus is the only param in the URL
        updateSearchParams({
            scanStatus: selectedSegment.value as ScanTypeOptions,
            severity: [],
            cluster: [],
            environment: [],
        })
        changePage(1)
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

    const getSortingHandler = (key: SecurityListSortableKeys) => () => handleSorting(key)

    const handleCloseScanDetailsModal = () => {
        setScanDetails(INITIAL_SCAN_DETAILS)
    }

    const handleOpenScanDetailsModal = (event: React.MouseEvent, scan: SecurityScanType) => {
        event.stopPropagation()
        setScanDetails({
            appId: scan.appId,
            envId: scan.envId,
        })
    }

    const redirectToAppEnv = (appId: number, envId: number) => {
        push(`${URLS.APPLICATION_MANAGEMENT_APP}/${appId}/details/${envId}`)
    }

    const isScanListEmpty = !isLoading && !securityScansResult?.result.securityScans.length

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

    const renderHeader = () => (
        <div className="table__row-grid display-grid dc__align-items-center border__secondary--bottom dc__gap-16 px-20 w-100 py-4 bg__primary">
            <div className="icon-dim-24" />
            <div className="fs-12 lh-20 fw-6 cn-7">
                <SortableTableHeaderCell
                    title="APP NAME"
                    isSorted={sortBy === SecurityListSortableKeys.APP_NAME}
                    sortOrder={sortOrder}
                    isSortable
                    disabled={false}
                    triggerSorting={getSortingHandler(SecurityListSortableKeys.APP_NAME)}
                />
            </div>
            <div className="fs-12 lh-20 fw-6 cn-7">
                <SortableTableHeaderCell
                    title="ENVIRONMENT"
                    isSorted={sortBy === SecurityListSortableKeys.ENV_NAME}
                    sortOrder={sortOrder}
                    isSortable
                    disabled={false}
                    triggerSorting={getSortingHandler(SecurityListSortableKeys.ENV_NAME)}
                />
            </div>
            <div className="fs-12 lh-20 fw-6 cn-7">IMAGE VULNERABILITY SCAN</div>
            {!isNotScannedList && (
                <>
                    <div className="fs-12 lh-20 fw-6 cn-7">
                        <SortableTableHeaderCell
                            title="FIXABLE VULNERABILITIES"
                            isSorted={false}
                            sortOrder={sortOrder}
                            isSortable={false}
                            disabled={false}
                            triggerSorting={noop}
                        />
                    </div>
                    <div className="fs-12 lh-20 fw-6 cn-7">
                        <SortableTableHeaderCell
                            title="SCANNED ON"
                            isSorted={sortBy === SecurityListSortableKeys.LAST_CHECKED}
                            sortOrder={sortOrder}
                            isSortable
                            disabled={false}
                            triggerSorting={getSortingHandler(SecurityListSortableKeys.LAST_CHECKED)}
                        />
                    </div>
                </>
            )}
        </div>
    )

    const renderFilters = () => (
        <div className="flexbox dc__content-space px-20 py-16">
            <div className="flex dc__gap-8">
                <VulnerabilityViewTypeSelect />
                <SearchBar
                    containerClassName="w-250"
                    initialSearchText={searchKey}
                    inputProps={{
                        placeholder: `Search application`,
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
    )

    const renderSavedFilters = () => (
        <FilterChips<Omit<ScanListUrlFiltersType, 'scanStatus'>>
            filterConfig={{
                severity,
                cluster,
                environment,
            }}
            getFormattedValue={getLabelFromValue}
            onRemoveFilter={updateSearchParams}
            clearFilters={clearFilters}
            className="w-100 pb-12-imp pt-0-imp px-20"
            clearButtonClassName="dc__no-background-imp dc__no-border-imp dc__tab-focus"
        />
    )

    const renderScanList = () => {
        if (isLoading) {
            const arrayLoading = Array.from(Array(3)).map((index) => index)
            return (
                <div>
                    {arrayLoading.map((value) => (
                        <div className="dc__grid table__row-grid dc__gap-16 px-20 py-10" key={value}>
                            <span className="shimmer" />
                            <span className="shimmer" />
                            <span className="shimmer" />
                            <span className="shimmer" />
                            {!isNotScannedList && (
                                <>
                                    <span className="shimmer" />
                                    <span className="shimmer" />
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )
        }

        return (
            <>
                <div className="flexbox-col flex-grow-1 mh-0 dc__overflow-auto">
                    {securityScansResult.result.securityScans.map((scan) => {
                        const totalSeverities = Object.values(scan.severityCount).reduce((acc, curr) => acc + curr, 0)
                        return (
                            <div
                                className="dc__grid table__row-grid cursor border__secondary--bottom fs-13 dc__gap-16 px-20 w-100-imp py-12 dc__align-items-center dc__hover-n50"
                                onClick={
                                    isNotScannedList
                                        ? () => redirectToAppEnv(scan.appId, scan.envId)
                                        : (event) => handleOpenScanDetailsModal(event, scan)
                                }
                                key={`${scan.name}-${scan.environment}`}
                                role="button"
                                tabIndex={0}
                            >
                                <Icon name="ic-devtron-app" color={null} size={24} />
                                <span className="cb-5 dc__truncate lh-20" data-testid={`scanned-app-list-${scan.name}`}>
                                    {scan.name}
                                </span>
                                <span className="dc__truncate lh-20">{scan.environment}</span>
                                <div>{isNotScannedList ? 'Not Scanned' : getSeverityWithCount(scan.severityCount)}</div>
                                {!isNotScannedList && (
                                    <>
                                        <span className="dc__truncate">
                                            {scan.fixableVulnerabilities} out of {totalSeverities}
                                        </span>
                                        <span data-testid="image-scan-security-check lh-20">
                                            {scan.lastExecution && scan.lastExecution !== ZERO_TIME_STRING
                                                ? dayjs(scan.lastExecution).format(
                                                      DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT,
                                                  )
                                                : ''}
                                        </span>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
                {securityScansResult.result.totalCount > DEFAULT_BASE_PAGE_SIZE && (
                    <Pagination
                        rootClassName="flex dc__content-space px-20 dc__border-top"
                        size={securityScansResult.result.totalCount}
                        pageSize={pageSize}
                        offset={offset}
                        changePage={changePage}
                        changePageSize={changePageSize}
                    />
                )}
            </>
        )
    }

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

    const renderScanListContainer = () => {
        if (isScanListEmpty && areFiltersActive) {
            return <GenericFilterEmptyState handleClearFilters={clearFilters} classname="flex-grow-1" />
        }

        return (
            <>
                {renderHeader()}
                {renderScanList()}
                {!isNotScannedList && renderScanDetailsModal()}
            </>
        )
    }

    const renderMainContent = () => {
        if (!isLoading && scanListError) {
            return (
                <div className="flexbox-col flex-grow-1 dc__content-center">
                    <ErrorScreenManager code={scanListError.code} reload={reloadScansList} />
                </div>
            )
        }

        if (isScanListEmpty && !areFiltersActive) {
            return (
                <GenericEmptyState
                    image={AppNotDeployed}
                    title={EMPTY_STATE_STATUS.SECURITY_SCANS.TITLE}
                    classname="flex-grow-1"
                />
            )
        }

        return (
            <>
                {renderFilters()}
                {renderSavedFilters()}
                {renderScanListContainer()}
            </>
        )
    }

    return (
        <div className="security-scan-container bg__primary flexbox-col flex-grow-1 dc__overflow-hidden">
            {renderMainContent()}
        </div>
    )
}

export default SecurityScansTab
