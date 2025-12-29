import { CVEListFilters } from './types'

export const parseSearchParams = (searchParams: URLSearchParams): Record<CVEListFilters, string[]> => ({
    application: searchParams.getAll('application'),
    environment: searchParams.getAll('environment'),
    severity: searchParams.getAll('severity'),
    cluster: searchParams.getAll('cluster'),
    fixAvailability: searchParams.getAll('fixAvailability'),
    ageOfDiscovery: searchParams.getAll('ageOfDiscovery'),
})

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
