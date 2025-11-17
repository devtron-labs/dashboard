import { SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

import { CVEListFilters } from './types'

export const parseSearchParams = (searchParams: URLSearchParams): Record<CVEListFilters, string[]> => ({
    application: searchParams.getAll('application'),
    environment: searchParams.getAll('environment'),
    severity: searchParams.getAll('severity'),
    cluster: searchParams.getAll('cluster'),
    fixAvailability: searchParams.getAll('fixAvailability'),
    ageOfDiscovery: searchParams.getAll('ageOfDiscovery'),
})

export const getSelectPickerOptionsByValue = (
    options: SelectPickerOptionType[],
    values: string[],
): SelectPickerOptionType[] => options.filter((option) => values.includes(`${option.value}`))

export const getFilterChipLabel = (filterKey: CVEListFilters) => {
    switch (filterKey) {
        case 'fixAvailability':
            return 'Fix Availability'
        case 'ageOfDiscovery':
            return 'Age of Discovery'
        default:
            return filterKey
    }
}
