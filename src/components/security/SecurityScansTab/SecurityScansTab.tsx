import dayjs from 'dayjs'
import {
    ComponentSizeType,
    DATE_TIME_FORMATS,
    DEFAULT_BASE_PAGE_SIZE,
    ErrorScreenManager,
    GenericEmptyState,
    Pagination,
    SearchBar,
    SelectPicker,
    useAsync,
    useUrlFilters,
    ZERO_TIME_STRING,
    EMPTY_STATE_STATUS,
    GenericFilterEmptyState,
    OptionType,
    FilterChips,
    SortableTableHeaderCell,
    abortPreviousRequests,
    getIsRequestAborted,
    SecurityModal,
    FilterSelectPicker,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import { useMemo, useRef, useState } from 'react'
import { getSeverityWithCount, importComponentFromFELibrary } from '@Components/common'
import { useGetAppSecurityDetails } from '@Components/app/details/appDetails/AppSecurity'
import { ReactComponent as ICDevtron } from '../../../assets/icons/ic-devtron-app.svg'
import { getSecurityScanList, getVulnerabilityFilterData } from '../security.service'
import {
    ScanDetailsType,
    SearchType,
    ScanListUrlFiltersType,
    SecurityListSortableKeys,
    SecurityScansTabMultiFilterKeys,
    ScanListPayloadType,
    SeverityFilterValues,
} from './types'
import { getSearchLabelFromValue, getSeverityFilterLabelFromValue, parseSearchParams } from './utils'
import AppNotDeployed from '../../../assets/img/app-not-deployed.svg'
import { INITIAL_SCAN_DETAILS, SEARCH_TYPE_OPTIONS } from './constants'
import { SecurityScanType } from '../security.types'

const SecurityModalSidebar = importComponentFromFELibrary('SecurityModalSidebar', null, 'function')

export const SecurityScansTab = () => {
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
        searchType,
        sortBy,
        sortOrder,
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
        appName: searchType === SearchType.APPLICATION ? searchKey : '',
        cveName: searchType === SearchType.VULNERABILITY ? searchKey : '',
        severity: severity.map((severityFilterValue) => SeverityFilterValues[severityFilterValue]),
        clusterIds: cluster.map((clusterId) => +clusterId),
        envIds: environment.map((envId) => +envId),
        sortBy,
        sortOrder,
    }

    const filterConfig = useMemo(
        () => ({ offset, pageSize, searchKey, sortBy, sortOrder, severity, cluster, environment, searchType }),
        [
            offset,
            pageSize,
            searchKey,
            sortBy,
            sortOrder,
            JSON.stringify(severity),
            JSON.stringify(cluster),
            JSON.stringify(environment),
            searchType,
        ],
    )

    const areFiltersActive = searchKey || severity.length || cluster.length || environment.length

    const [clusterEnvListLoading, clusterEnvListResult] = useAsync(() => getVulnerabilityFilterData())

    const getClusterLabelFromId = (clusterId: string) =>
        clusterEnvListResult?.filters?.clusters.find((clusterOption) => clusterOption.value === clusterId).label

    const getEnvLabelFromId = (envId: string) =>
        clusterEnvListResult?.filters?.environments.find((envOption) => envOption.value === envId).label

    const getLabelFromValue = (filterLabel: string, filterValue: string): string => {
        if (filterLabel === SecurityScansTabMultiFilterKeys.environment) {
            return getEnvLabelFromId(filterValue)
        }
        if (filterLabel === SecurityScansTabMultiFilterKeys.cluster) {
            return getClusterLabelFromId(filterValue)
        }
        return getSeverityFilterLabelFromValue(filterValue)
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

    const updateSeverityFilters = (selectedOptions: SelectPickerOptionType[]) => {
        updateSearchParams({ severity: selectedOptions.map((severityOption) => String(severityOption.value)) })
    }

    const updateEnvironmentFilters = (selectedOptions: SelectPickerOptionType[]) => {
        updateSearchParams({ environment: selectedOptions.map((envOption) => String(envOption.value)) })
    }

    const updateClusterFilters = (selectedOptions: SelectPickerOptionType[]) => {
        updateSearchParams({ cluster: selectedOptions.map((clusterOption) => String(clusterOption.value)) })
    }

    const updateSearchType = (selectedOption: OptionType) => {
        updateSearchParams({ searchType: selectedOption.value })
    }

    const selectedSeverities = severity.map((severityId) => ({
        label: getSeverityFilterLabelFromValue(severityId),
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

    const handleAppNameSorting = () => handleSorting(SecurityListSortableKeys.APP_NAME)
    const handleEnvNameSorting = () => handleSorting(SecurityListSortableKeys.ENV_NAME)
    const handleLastCheckedSorting = () => handleSorting(SecurityListSortableKeys.LAST_CHECKED)

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

    if (!isLoading && scanListError) {
        return (
            <div className="flexbox-col flex-grow-1 dc__content-center">
                <ErrorScreenManager code={scanListError.code} reload={reloadScansList} />
            </div>
        )
    }

    const isScanListEmpty = !isLoading && !securityScansResult?.result.securityScans.length

    if (isScanListEmpty && !areFiltersActive) {
        return (
            <GenericEmptyState
                image={AppNotDeployed}
                title={EMPTY_STATE_STATUS.SECURITY_SCANS.TITLE}
                classname="flex-grow-1"
            />
        )
    }

    const renderHeader = () => (
        <div className="table__row-grid display-grid dc__align-items-center dc__border-bottom dc__gap-16 px-20 w-100-imp py-4 dc__position-sticky dc__top-77 bg__primary">
            <div className="icon-dim-24" />
            <div className="fs-12 lh-20 fw-6 cn-7">
                <SortableTableHeaderCell
                    title="APP NAME"
                    isSorted={sortBy === SecurityListSortableKeys.APP_NAME}
                    sortOrder={sortOrder}
                    isSortable
                    disabled={false}
                    triggerSorting={handleAppNameSorting}
                />
            </div>
            <div className="fs-12 lh-20 fw-6 cn-7">
                <SortableTableHeaderCell
                    title="ENVIRONMENT"
                    isSorted={sortBy === SecurityListSortableKeys.ENV_NAME}
                    sortOrder={sortOrder}
                    isSortable
                    disabled={false}
                    triggerSorting={handleEnvNameSorting}
                />
            </div>
            <div className="fs-12 lh-20 fw-6 cn-7">SECURITY SCAN</div>
            <div className="fs-12 lh-20 fw-6 cn-7">
                <SortableTableHeaderCell
                    title="SCANNED ON"
                    isSorted={sortBy === SecurityListSortableKeys.LAST_CHECKED}
                    sortOrder={sortOrder}
                    isSortable
                    disabled={false}
                    triggerSorting={handleLastCheckedSorting}
                />
            </div>
        </div>
    )

    const renderFilters = () => (
        <div className="flexbox dc__content-space px-20 py-12">
            <div className="flexbox">
                <div className="w-120">
                    <SelectPicker
                        value={{ label: getSearchLabelFromValue(searchType), value: searchType }}
                        options={SEARCH_TYPE_OPTIONS}
                        classNamePrefix="search-type__select-picker"
                        inputId="search-type__select-picker"
                        name="search-type__select-picker"
                        size={ComponentSizeType.large}
                        onChange={updateSearchType}
                        isDisabled={isLoading}
                    />
                </div>
                <SearchBar
                    containerClassName="security-scan-search w-250"
                    initialSearchText={searchKey}
                    inputProps={{
                        placeholder: `Search ${getSearchLabelFromValue(searchType)}`,
                        disabled: isLoading,
                    }}
                    handleEnter={handleSearch}
                    size={ComponentSizeType.large}
                />
            </div>
            <div className="flexbox dc__gap-8">
                <FilterSelectPicker
                    inputId="security-severity-filter"
                    placeholder="Severity"
                    isDisabled={clusterEnvListLoading}
                    isLoading={clusterEnvListLoading}
                    appliedFilterOptions={selectedSeverities}
                    handleApplyFilter={updateSeverityFilters}
                    options={clusterEnvListResult?.filters.severity}
                />
                <FilterSelectPicker
                    inputId="security-cluster-filter"
                    placeholder="Cluster"
                    isDisabled={clusterEnvListLoading}
                    isLoading={clusterEnvListLoading}
                    appliedFilterOptions={selectedClusters}
                    handleApplyFilter={updateClusterFilters}
                    options={clusterEnvListResult?.filters.clusters}
                />
                <FilterSelectPicker
                    inputId="security-environment-filter"
                    placeholder="Environment"
                    isDisabled={clusterEnvListLoading}
                    isLoading={clusterEnvListLoading}
                    appliedFilterOptions={selectedEnvironments}
                    handleApplyFilter={updateEnvironmentFilters}
                    options={clusterEnvListResult?.filters.environments}
                    shouldMenuAlignRight
                />
            </div>
        </div>
    )

    const renderSavedFilters = () => (
        <FilterChips<Omit<ScanListUrlFiltersType, 'searchType'>>
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
                        <div
                            className="display-grid table__row-grid show-shimmer-loading dc__gap-16 px-20 py-10"
                            key={value}
                        >
                            <span className="child child-shimmer-loading" />
                            <span className="child child-shimmer-loading" />
                            <span className="child child-shimmer-loading" />
                            <span className="child child-shimmer-loading" />
                            <span className="child child-shimmer-loading w-250" />
                        </div>
                    ))}
                </div>
            )
        }

        return (
            <>
                {securityScansResult.result.securityScans.map((scan) => (
                    <div
                        className="table__row table__row-grid display-grid fs-13 dc__gap-16 px-20 w-100-imp py-12 dc__align-items-center dc__hover-n50"
                        onClick={(event) => handleOpenScanDetailsModal(event, scan)}
                        key={`${scan.name}-${scan.environment}`}
                        role="button"
                        tabIndex={0}
                    >
                        <ICDevtron className="icon-dim-24 dc__no-shrink" />
                        <span className="cb-5 dc__ellipsis-right lh-20" data-testid={`scanned-app-list-${scan.name}`}>
                            {scan.name}
                        </span>
                        <span className="dc__ellipsis-right lh-20">{scan.environment}</span>
                        <div className="dc__ellipsis-right">{getSeverityWithCount(scan.severityCount)}</div>
                        <span data-testid="image-scan-security-check lh-20">
                            {scan.lastExecution && scan.lastExecution !== ZERO_TIME_STRING
                                ? dayjs(scan.lastExecution).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)
                                : ''}
                        </span>
                    </div>
                ))}
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
                {renderScanDetailsModal()}
            </>
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
