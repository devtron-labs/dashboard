import dayjs from 'dayjs'
import {
    ComponentSizeType,
    DATE_TIME_FORMATS,
    DEFAULT_BASE_PAGE_SIZE,
    ErrorScreenManager,
    FilterButton,
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
} from '@devtron-labs/devtron-fe-common-lib'
import { useMemo, useState } from 'react'
import { ScanDetailsModal } from '@Components/common'
import { ReactComponent as ICDevtron } from '../../../assets/icons/ic-devtron-app.svg'
import { getSecurityScanList, getVulnerabilityFilterData } from '../security.service'
import { ScanDetailsType, SearchType, ScanListUrlFiltersType, SecurityListSortableKeys } from './types'
import { getSearchLabelFromValue, getSeverityWithCount, parseSearchParams } from './utils'
import AppNotDeployed from '../../../assets/img/app-not-deployed.png'
import { InitialScanDetails } from './constants'
import { SecurityScanType } from '../security.types'

export const SecurityScansTab = () => {
    const urlFilters = useUrlFilters<SecurityListSortableKeys, Partial<ScanListUrlFiltersType>>({
        parseSearchParams,
    })
    const [scanDetails, setScanDetails] = useState<ScanDetailsType>(InitialScanDetails)
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

    const payload = {
        offset,
        size: pageSize,
        appName: searchType === SearchType.APPLICATION ? searchKey : '',
        cveName: searchType === SearchType.VULNERABILITY ? searchKey : '',
        severity: severity.map((severityId) => +severityId),
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

    const [clusterEnvListLoading, clusterEnvListResult] = useAsync(() => getVulnerabilityFilterData())

    const getClusterLabelFromId = (clusterId: string) => {
        return clusterEnvListResult?.filters?.clusters.find((clusterOption) => clusterOption.value === clusterId).label
    }

    const getEnvLabelFromId = (envId: string) => {
        return clusterEnvListResult?.filters?.environments.find((envOption) => envOption.value === envId).label
    }

    const getLabelFromValue = (filterLabel: string, filterValue: string): string => {
        if (filterLabel === 'severity') {
            switch (filterValue) {
                case '5':
                    return 'Unknown'
                case '3':
                    return 'High'
                case '2':
                    return 'Critical'
                case '1':
                    return 'Medium'
                default:
                    return 'Low'
            }
        }
        if (filterLabel === 'environment') {
            return getEnvLabelFromId(filterValue)
        }
        return getClusterLabelFromId(filterValue)
    }

    const [scanListLoading, securityScansResult, scanListError] = useAsync(
        () => getSecurityScanList(payload),
        [filterConfig],
    )

    if (!scanListLoading && scanListError) {
        return <ErrorScreenManager code={securityScansResult?.responseCode} />
    }

    const updateSeverityFilters = (selectedOptions: string[]) => {
        updateSearchParams({ severity: selectedOptions })
    }

    const updateEnvironmentFilters = (selectedOptions: string[]) => {
        updateSearchParams({ environment: selectedOptions })
    }

    const updateClusterFilters = (selectedOptions: string[]) => {
        updateSearchParams({ cluster: selectedOptions })
    }

    const updateSearchType = (selectedOption: OptionType) => {
        updateSearchParams({ searchType: selectedOption.value })
    }

    const handleCloseScanDetailsModal = () => {
        setScanDetails(InitialScanDetails)
    }

    const handleOpenScanDetailsModal = (event: React.MouseEvent, scan: SecurityScanType) => {
        event.stopPropagation()
        setScanDetails({
            name: scan.name,
            uniqueId: {
                imageScanDeployInfoId: scan.imageScanDeployInfoId,
                appId: scan.appId,
                envId: scan.envId,
            },
        })
    }

    const renderHeader = () => (
        <div className="table__row-grid display-grid dc__align-items-center dc__border-bottom dc__gap-16 px-20 w-100-imp py-4 dc__position-sticky dc__top-77 bcn-0">
            <span className="icon-dim-24" />
            <span className="fs-12 lh-20 fw-6 cn-7">
                <SortableTableHeaderCell
                    title="APP NAME"
                    isSorted={sortBy === SecurityListSortableKeys.APP_NAME}
                    sortOrder={sortOrder}
                    isSortable
                    disabled={false}
                    triggerSorting={() => handleSorting(SecurityListSortableKeys.APP_NAME)}
                />
            </span>
            <span className="fs-12 lh-20 fw-6 cn-7">
                <SortableTableHeaderCell
                    title="ENVIRONMENT"
                    isSorted={sortBy === SecurityListSortableKeys.ENV_NAME}
                    sortOrder={sortOrder}
                    isSortable
                    disabled={false}
                    triggerSorting={() => handleSorting(SecurityListSortableKeys.ENV_NAME)}
                />
            </span>
            <span className="fs-12 lh-20 fw-6 cn-7">SECURITY SCAN</span>
            <span className="fs-12 lh-20 fw-6 cn-7">
                <SortableTableHeaderCell
                    title="SCANNED ON"
                    isSorted={sortBy === SecurityListSortableKeys.LAST_CHECKED}
                    sortOrder={sortOrder}
                    isSortable
                    disabled={false}
                    triggerSorting={() => handleSorting(SecurityListSortableKeys.LAST_CHECKED)}
                />
            </span>
        </div>
    )

    const renderFilters = () => {
        return (
            <div className="flexbox dc__content-space px-20 py-12">
                <div className="flexbox">
                    <div className="w-150">
                        <SelectPicker
                            label=""
                            value={{ label: getSearchLabelFromValue(searchType), value: searchType }}
                            options={[
                                { label: 'Application', value: 'appName' },
                                { label: 'Vulnerability', value: 'cveName' },
                            ]}
                            classNamePrefix="search-type__select-picker"
                            inputId="search-type__select-picker"
                            name="search-type__select-picker"
                            size={ComponentSizeType.large}
                            onChange={updateSearchType}
                        />
                    </div>
                    <div style={{ width: 700 }}>
                        <SearchBar
                            containerClassName=""
                            initialSearchText={searchKey}
                            inputProps={{ placeholder: `Search ${getSearchLabelFromValue(searchType)}` }}
                            handleEnter={handleSearch}
                            height="36"
                        />
                    </div>
                </div>
                <div className="flexbox dc__gap-8">
                    <FilterButton
                        placeholder="Severity"
                        disabled={clusterEnvListLoading}
                        appliedFilters={severity}
                        options={clusterEnvListResult?.filters?.severity}
                        handleApplyChange={updateSeverityFilters}
                        controlWidth="140px"
                    />
                    <FilterButton
                        placeholder="Cluster"
                        disabled={clusterEnvListLoading}
                        appliedFilters={cluster}
                        options={clusterEnvListResult?.filters?.clusters || []}
                        handleApplyChange={updateClusterFilters}
                        controlWidth="140px"
                    />
                    <FilterButton
                        placeholder="Environment"
                        disabled={clusterEnvListLoading}
                        appliedFilters={environment}
                        options={clusterEnvListResult?.filters?.environments || []}
                        handleApplyChange={updateEnvironmentFilters}
                        menuAlignFromRight
                        controlWidth="175px"
                    />
                </div>
            </div>
        )
    }

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
        if (scanListLoading) {
            const arrayLoading = Array.from(Array(3)).map((index) => index)
            return (
                <div>
                    {arrayLoading.map(() => (
                        <div className="display-grid table__row-grid show-shimmer-loading dc__gap-16 px-20 py-10">
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

        if (!securityScansResult.result.securityScans.length) {
            if (searchKey || severity.length || cluster.length || environment.length) {
                return <GenericFilterEmptyState handleClearFilters={clearFilters} />
            }

            return <GenericEmptyState image={AppNotDeployed} title={EMPTY_STATE_STATUS.SECURITY_SCANS.TITLE} />
        }

        return (
            <>
                {securityScansResult.result.securityScans.map((scan) => {
                    return (
                        <div
                            className="table__row table__row-grid display-grid dc__gap-16 px-20 w-100-imp py-12 dc__align-items-center dc__hover-n50"
                            onClick={(event) => handleOpenScanDetailsModal(event, scan)}
                        >
                            <ICDevtron className="icon-dim-24 dc__no-shrink" />
                            <span
                                className="cb-5 dc__ellipsis-right lh-20"
                                data-testid={`scanned-app-list-${scan.name}`}
                            >
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
                    )
                })}
                {securityScansResult.result.totalCount > DEFAULT_BASE_PAGE_SIZE && (
                    <Pagination
                        rootClassName="pagination-wrapper"
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
        if (scanDetails.uniqueId.appId) {
            return <ScanDetailsModal uniqueId={scanDetails.uniqueId} close={handleCloseScanDetailsModal} />
        }
        return null
    }

    return (
        <>
            {renderFilters()}
            {renderSavedFilters()}
            {renderHeader()}
            {renderScanList()}
            {renderScanDetailsModal()}
        </>
    )
}
