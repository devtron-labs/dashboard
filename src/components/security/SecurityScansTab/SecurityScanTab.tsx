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
    SeverityCount,
} from '@devtron-labs/devtron-fe-common-lib'
import { useMemo, useState } from 'react'
import { ScanDetailsModal } from '@Components/common'
import { ReactComponent as ICDevtron } from '../../../assets/icons/ic-devtron-app.svg'
import { getSecurityScanList, getVulnerabilityFilterData } from '../security.service'
import { ScanDetailsType, SearchType, ScanListUrlFiltersType } from './types'
import { getSearchLabelFromValue, getSeverityLabelFromValue, parseSearchParams } from './utils'
import AppNotDeployed from '../../../assets/img/app-not-deployed.png'
import { InitialScanDetails } from './constants'

export const SecurityScansTab = () => {
    const urlFilters = useUrlFilters<never, Partial<ScanListUrlFiltersType>>({
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
        changePage,
        changePageSize,
        clearFilters,
        handleSearch,
        updateSearchParams,
    } = urlFilters

    const payload = {
        offset,
        size: pageSize,
        search: searchKey,
        appName: searchType === SearchType.APPLICATION ? searchKey : '',
        cveName: searchType === SearchType.VULNERABILITY ? searchKey : '',
        objectName: '',
        severity: severity.map((severityId) => +severityId),
        clusterIds: cluster.map((clusterId) => +clusterId),
        envIds: environment.map((envId) => +envId),
    }

    const filterConfig = useMemo(
        () => ({ offset, pageSize, searchKey, severity, cluster, environment, searchType }),
        [
            offset,
            pageSize,
            searchKey,
            JSON.stringify(severity),
            JSON.stringify(cluster),
            JSON.stringify(environment),
            searchType,
        ],
    )

    const [clusterEnvListLoading, clusterEnvListResult] = useAsync(() => getVulnerabilityFilterData())

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

    const getSeverityWithCount = (severityCount: SeverityCount) => {
        if (severityCount.critical) {
            return (
                <span className="severity-chip severity-chip--critical dc__w-fit-content">
                    {severityCount.critical} Critical
                </span>
            )
        }
        if (severityCount.high) {
            return (
                <span className="severity-chip severity-chip--high dc__w-fit-content">{severityCount.high} High</span>
            )
        }
        if (severityCount.medium) {
            return (
                <span className="severity-chip severity-chip--medium dc__w-fit-content">
                    {severityCount.medium} Medium
                </span>
            )
        }
        if (severityCount.low) {
            return <span className="severity-chip severity-chip--low dc__w-fit-content">{severityCount.low} Low</span>
        }
        if (severityCount.unknown) {
            return (
                <span className="severity-chip severity-chip--unknown dc__w-fit-content">
                    {severityCount.unknown} Unknown
                </span>
            )
        }
        return <span className="severity-chip severity-chip--passed dc__w-fit-content">Passed</span>
    }

    const renderHeader = () => (
        <div className="table__row-grid display-grid dc__align-items-center dc__border-bottom dc__gap-16 px-20 w-100-imp py-4 dc__position-sticky dc__top-77 bcn-0">
            <span className="icon-dim-24" />
            <span className="fs-12 lh-20 fw-6 cn-7">APP NAME</span>
            <span className="fs-12 lh-20 fw-6 cn-7">ENVIRONMENTS</span>
            <span className="fs-12 lh-20 fw-6 cn-7">SECURITY SCAN</span>
            <span className="fs-12 lh-20 fw-6 cn-7">SCANNED ON</span>
        </div>
    )

    const renderFilters = () => {
        return (
            <div className="flexbox dc__gap-16 px-20 py-12">
                <div className="flexbox">
                    <div className="w-160">
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
                            size={ComponentSizeType.medium}
                            onChange={updateSearchType}
                        />
                    </div>
                    <div style={{ width: 700 }}>
                        <SearchBar
                            containerClassName=""
                            initialSearchText={searchKey}
                            inputProps={{ placeholder: `Search ${getSearchLabelFromValue(searchType)}` }}
                            handleEnter={handleSearch}
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
                    />
                    <FilterButton
                        placeholder="Cluster"
                        disabled={clusterEnvListLoading}
                        appliedFilters={cluster}
                        options={clusterEnvListResult?.filters?.clusters || []}
                        handleApplyChange={updateClusterFilters}
                    />
                    <FilterButton
                        placeholder="Environment"
                        disabled={clusterEnvListLoading}
                        appliedFilters={environment}
                        options={clusterEnvListResult?.filters?.environments || []}
                        handleApplyChange={updateEnvironmentFilters}
                        menuAlignFromRight
                    />
                </div>
            </div>
        )
    }

    const renderSavedFilters = () => (
        <FilterChips<Omit<ScanListUrlFiltersType, 'searchType'>>
            filterConfig={{
                severity: severity.map((severityId) => getSeverityLabelFromValue(severityId)),
                cluster,
                environment,
            }}
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
                <>
                    {arrayLoading.map(() => (
                        <div className="display-grid table__row-grid show-shimmer-loading dc__gap-16 px-20 py-10">
                            <span className="child child-shimmer-loading" />
                            <span className="child child-shimmer-loading" />
                            <span className="child child-shimmer-loading" />
                            <span className="child child-shimmer-loading" />
                            <span className="child child-shimmer-loading w-250" />
                        </div>
                    ))}
                </>
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
                            onClick={(event) => {
                                event.stopPropagation()
                                setScanDetails({
                                    name: scan.name,
                                    uniqueId: {
                                        imageScanDeployInfoId: scan.imageScanDeployInfoId,
                                        appId: scan.appId,
                                        envId: scan.envId,
                                    },
                                })
                            }}
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
            return (
                <ScanDetailsModal
                    showAppInfo
                    uniqueId={scanDetails.uniqueId}
                    name={scanDetails.name}
                    close={handleCloseScanDetailsModal}
                />
            )
        }
        return null
    }

    return (
        <div className="h-100 flexbox-col">
            {renderFilters()}
            {renderSavedFilters()}
            {renderHeader()}
            {renderScanList()}
            {renderScanDetailsModal()}
        </div>
    )
}
