import {
    FilterChips,
    GroupedFilterSelectPicker,
    GroupedFilterSelectPickerProps,
    SearchBar,
} from '@devtron-labs/devtron-fe-common-lib'

import { AuditLogFilterKeys, AuditLogFiltersType, AuditLogsTableWrapperProps } from './types'
import { getAuditLogFilterLabel } from './utils'

const AuditLogsTableWrapper = ({
    children,
    searchKey,
    handleSearch,
    updateSearchParams,
    clearFilters,
    filterOptions,
    areRowsLoading,
    filteredRows,
    areFiltersApplied,
    ...restProps
}: AuditLogsTableWrapperProps) => {
    const hideFilters = !areRowsLoading && filteredRows?.length === 0 && !areFiltersApplied

    const appliedFilters: AuditLogFiltersType = {
        [AuditLogFilterKeys.TYPE]: restProps[AuditLogFilterKeys.TYPE] ?? [],
        [AuditLogFilterKeys.MODULE]: restProps[AuditLogFilterKeys.MODULE] ?? [],
    }

    const handleUpdateFilters = (filterKey: AuditLogFilterKeys) => (selectedOptions) => {
        updateSearchParams({ [filterKey]: selectedOptions.map((option) => String(option.value)) })
    }

    const filterSelectPickerPropsMap: GroupedFilterSelectPickerProps<AuditLogFilterKeys>['filterSelectPickerPropsMap'] =
        {
            [AuditLogFilterKeys.TYPE]: {
                placeholder: 'Type',
                inputId: 'audit-logs-type-filter',
                options: filterOptions.typeOptions,
                appliedFilterOptions: filterOptions.typeOptions.filter((option) =>
                    appliedFilters[AuditLogFilterKeys.TYPE].includes(String(option.value)),
                ),
                handleApplyFilter: handleUpdateFilters(AuditLogFilterKeys.TYPE),
                isDisabled: false,
                isLoading: false,
            },
            [AuditLogFilterKeys.MODULE]: {
                placeholder: 'Module',
                inputId: 'audit-logs-module-filter',
                options: filterOptions.moduleOptions,
                appliedFilterOptions: filterOptions.moduleOptions.filter((option) =>
                    appliedFilters[AuditLogFilterKeys.MODULE].includes(String(option.value)),
                ),
                handleApplyFilter: handleUpdateFilters(AuditLogFilterKeys.MODULE),
                isDisabled: false,
                isLoading: false,
            },
        }

    return (
        <div className="h-100 dc__overflow-hidden w-100 flexbox-col">
            <div className="flexbox dc__align-items-center p-16 w-100 dc__gap-8 dc__zi-5">
                {!hideFilters && (
                    <>
                        <SearchBar
                            dataTestId="audit-logs-search"
                            handleEnter={handleSearch}
                            initialSearchText={searchKey}
                            inputProps={{ placeholder: 'Search' }}
                            keyboardShortcut="/"
                        />

                        <GroupedFilterSelectPicker<AuditLogFilterKeys>
                            id="audit-log-filters"
                            width={220}
                            isFilterApplied={
                                !!appliedFilters[AuditLogFilterKeys.TYPE].length ||
                                !!appliedFilters[AuditLogFilterKeys.MODULE].length
                            }
                            options={[
                                {
                                    groupLabel: 'Filter by',
                                    items: [
                                        { id: AuditLogFilterKeys.TYPE, label: 'Type' },
                                        { id: AuditLogFilterKeys.MODULE, label: 'Module' },
                                    ],
                                },
                            ]}
                            filterSelectPickerPropsMap={filterSelectPickerPropsMap}
                        />
                    </>
                )}
            </div>

            {!hideFilters && (
                <FilterChips<AuditLogFiltersType>
                    filterConfig={appliedFilters}
                    onRemoveFilter={updateSearchParams}
                    clearFilters={clearFilters}
                    className="px-20"
                    getFormattedLabel={getAuditLogFilterLabel}
                    getFormattedValue={(_filterKey, filterValue: string) => filterValue}
                />
            )}

            {children}
        </div>
    )
}

export default AuditLogsTableWrapper
