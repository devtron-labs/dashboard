import {
    ComponentSizeType,
    FilterChips,
    FiltersTypeEnum,
    getCVEUrlFromCVEName,
    getSelectPickerOptionByValue,
    getSelectPickerOptionsByValue,
    GroupedFilterSelectPicker,
    GroupedFilterSelectPickerProps,
    PaginationEnum,
    SearchBar,
    SelectPickerOptionType,
    Severity,
    SEVERITY_LABEL_MAP,
    SeverityChip,
    Table,
    TableCellComponentProps,
    TableProps,
    TableViewWrapperProps,
    useQuery,
} from '@devtron-labs/devtron-fe-common-lib'

import { DISCOVERY_AGE_FILTER_OPTIONS } from '../constants'
import { FixAvailabilityOptions } from '../types'
import VulnerabilitySummary from '../VulnerabilitySummary'
import VulnerabilityViewTypeSelect from '../VulnerabilityViewTypeSelect'
import { CVE_LIST_GROUP_FILTER_OPTIONS } from './constants'
import { getCVEList, getCVEListFilters } from './service'
import { CVEDetails, CVEListFilterData, CVEListFilters } from './types'
import { getFilterChipLabel, parseSearchParams } from './utils'

const SeverityCellComponent = ({ row }: TableCellComponentProps<CVEDetails, FiltersTypeEnum.URL, {}>) => {
    const { data } = row
    return (
        <div className="flex left py-10">
            <SeverityChip severity={data.severity} />
        </div>
    )
}

const CVENameCellComponent = ({ row }: TableCellComponentProps<CVEDetails, FiltersTypeEnum.URL, {}>) => {
    const { data } = row
    return (
        <a className="flex left py-10" href={getCVEUrlFromCVEName(data.cveName)} target="_blank" rel="noreferrer">
            {data.cveName}
        </a>
    )
}

const CVETableWrapper = ({
    children,
    updateSearchParams,
    handleSearch,
    ageOfDiscovery,
    fixAvailability,
    application,
    environment,
    severity,
    cluster,
    clearFilters,
    searchKey,
}: TableViewWrapperProps<CVEDetails, FiltersTypeEnum.URL, Record<CVEListFilters, string[]>>) => {
    const { isFetching, data, refetch, error } = useQuery<CVEListFilterData, CVEListFilterData, string[], false>({
        queryKey: ['cveListFilters'],
        queryFn: getCVEListFilters,
    })

    const {
        fixAvailability: fixAvailabilityOptions,
        ageOfDiscovery: ageOfDiscoveryOptions,
        application: applicationOptions,
        environment: environmentOptions,
        severity: severityOptions,
        cluster: clusterOptions,
    } = data || {}

    const getUpdateHandler = (key: CVEListFilters) => (updatedOptions: SelectPickerOptionType[]) => {
        updateSearchParams({
            [key]: updatedOptions.map((option) => option.value),
        })
    }

    const commonGroupedFilterProps = {
        isDisabled: isFetching,
        isLoading: isFetching,
        optionListError: error,
        reloadOptionList: refetch,
    }

    const groupedFilterOptionsMap: GroupedFilterSelectPickerProps<CVEListFilters>['filterSelectPickerPropsMap'] = {
        fixAvailability: {
            ...commonGroupedFilterProps,
            inputId: 'cve-fix-availability-filter',
            placeholder: 'Fix Availability',
            options: fixAvailabilityOptions || [],
            appliedFilterOptions: getSelectPickerOptionsByValue(fixAvailabilityOptions || [], fixAvailability || []),
            handleApplyFilter: getUpdateHandler('fixAvailability'),
        },
        ageOfDiscovery: {
            ...commonGroupedFilterProps,
            inputId: 'cve-age-of-discovery-filter',
            placeholder: 'Age of Discovery',
            options: ageOfDiscoveryOptions || [],
            appliedFilterOptions: getSelectPickerOptionsByValue(ageOfDiscoveryOptions || [], ageOfDiscovery || []),
            handleApplyFilter: getUpdateHandler('ageOfDiscovery'),
        },
        application: {
            ...commonGroupedFilterProps,
            inputId: 'cve-application-filter',
            placeholder: 'Application',
            options: applicationOptions || [],
            appliedFilterOptions: getSelectPickerOptionsByValue(applicationOptions || [], application || []),
            handleApplyFilter: getUpdateHandler('application'),
        },
        environment: {
            ...commonGroupedFilterProps,
            inputId: 'cve-environment-filter',
            placeholder: 'Environment',
            options: environmentOptions || [],
            appliedFilterOptions: getSelectPickerOptionsByValue(environmentOptions || [], environment || []),
            handleApplyFilter: getUpdateHandler('environment'),
        },
        severity: {
            ...commonGroupedFilterProps,
            inputId: 'cve-severity-filter',
            placeholder: 'Severity',
            options: severityOptions || [],
            appliedFilterOptions: getSelectPickerOptionsByValue(severityOptions || [], severity || []),
            handleApplyFilter: getUpdateHandler('severity'),
        },
        cluster: {
            ...commonGroupedFilterProps,
            inputId: 'cve-cluster-filter',
            placeholder: 'Cluster',
            options: clusterOptions || [],
            appliedFilterOptions: getSelectPickerOptionsByValue(clusterOptions || [], cluster || []),
            handleApplyFilter: getUpdateHandler('cluster'),
        },
    }

    const getFormattedFilterValue = (filterKey: CVEListFilters, filterValue: string): string => {
        switch (filterKey) {
            case 'fixAvailability':
                return filterValue === FixAvailabilityOptions.FIX_AVAILABLE ? 'Fix Available' : 'Fix Not Available'
            case 'ageOfDiscovery':
                return (
                    (getSelectPickerOptionByValue(DISCOVERY_AGE_FILTER_OPTIONS, filterValue)?.label as string) ||
                    filterValue
                )
            case 'severity':
                return SEVERITY_LABEL_MAP[filterValue as Severity]
            case 'application':
                return (
                    (getSelectPickerOptionByValue(applicationOptions || [], filterValue)?.label as string) ||
                    filterValue
                )
            case 'environment':
                return (
                    (getSelectPickerOptionByValue(environmentOptions || [], filterValue)?.label as string) ||
                    filterValue
                )
            case 'cluster':
                return (getSelectPickerOptionByValue(clusterOptions || [], filterValue)?.label as string) || filterValue
            default:
                return filterValue
        }
    }

    return (
        <>
            <div className="flexbox-col px-20 py-16 dc__gap-20">
                <div className="flex dc__content-space">
                    <div className="flex dc__gap-8">
                        <VulnerabilityViewTypeSelect />
                        <SearchBar
                            containerClassName="w-250"
                            inputProps={{ placeholder: 'Search vulnerability' }}
                            keyboardShortcut="/"
                            size={ComponentSizeType.large}
                            handleEnter={handleSearch}
                            initialSearchText={searchKey || ''}
                        />
                    </div>
                    <GroupedFilterSelectPicker<CVEListFilters>
                        id="cve-list-filters"
                        filterSelectPickerPropsMap={groupedFilterOptionsMap}
                        options={CVE_LIST_GROUP_FILTER_OPTIONS}
                        isFilterApplied={
                            severity.length > 0 ||
                            cluster.length > 0 ||
                            fixAvailability.length > 0 ||
                            application.length > 0 ||
                            environment.length > 0 ||
                            ageOfDiscovery.length > 0
                        }
                    />
                </div>
                <FilterChips<Record<CVEListFilters, string[]>>
                    filterConfig={{
                        severity,
                        cluster,
                        fixAvailability,
                        application,
                        environment,
                        ageOfDiscovery,
                    }}
                    onRemoveFilter={updateSearchParams}
                    clearFilters={clearFilters}
                    getFormattedLabel={getFilterChipLabel}
                    getFormattedValue={getFormattedFilterValue}
                />
                <VulnerabilitySummary
                    filters={{
                        severity,
                        cluster,
                        fixAvailability,
                        application,
                        environment,
                        ageOfDiscovery,
                    }}
                />
            </div>

            {children}
        </>
    )
}

const CVEList = () => {
    const colums: TableProps<CVEDetails, FiltersTypeEnum.URL, {}>['columns'] = [
        {
            label: 'CVE ID',
            field: 'cveName',
            isSortable: true,
            size: { fixed: 180 },
            CellComponent: CVENameCellComponent,
        },
        {
            label: 'Severity',
            field: 'severity',
            size: { fixed: 100 },
            CellComponent: SeverityCellComponent,
        },
        {
            label: 'Application',
            field: 'appName',
            size: { fixed: 150 },
        },
        {
            label: 'Environment',
            field: 'envName',
            size: { fixed: 150 },
        },
        {
            label: 'Discovered 1st Time',
            field: 'discoveredAt',
            size: { fixed: 150 },
        },
        {
            label: 'Package',
            field: 'package',
            size: { fixed: 180 },
        },
        {
            label: 'Current Version',
            field: 'currentVersion',
            size: { fixed: 150 },
            isSortable: true,
        },
        {
            label: 'Fix In Version',
            field: 'fixedVersion',
            size: { fixed: 150 },
            isSortable: true,
        },
    ]

    return (
        <Table<CVEDetails, FiltersTypeEnum.URL, {}>
            id="table__cve-listing"
            columns={colums}
            getRows={getCVEList}
            emptyStateConfig={{
                noRowsConfig: {
                    title: 'No CVEs Found',
                },
            }}
            paginationVariant={PaginationEnum.PAGINATED}
            filtersVariant={FiltersTypeEnum.URL}
            filter={() => true}
            additionalFilterProps={{
                initialSortKey: 'cveName',
                parseSearchParams,
            }}
            ViewWrapper={CVETableWrapper}
        />
    )
}

export default CVEList
