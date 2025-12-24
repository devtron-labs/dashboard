import { SelectPickerOptionType, SeveritiesDTO } from '@devtron-labs/devtron-fe-common-lib'

export interface CVEDetails {
    cveName: string
    severity: SeveritiesDTO
    appName: string
    appId: number
    envName: string
    envId: number
    discoveredAt: string
    package: string
    currentVersion: string
    fixedVersion: string
}

export interface VulnerabilityDTO {
    total: number
    list: CVEDetails[]
}

export type CVEListFilters =
    | 'application'
    | 'environment'
    | 'severity'
    | 'cluster'
    | 'fixAvailability'
    | 'ageOfDiscovery'

export type CVEListFilterData = Record<CVEListFilters, SelectPickerOptionType[]>
