import {
    FixAvailabilityOptions,
    SelectPickerOptionType,
    Severity,
    VulnerabilityDiscoveryAgeOptions,
} from '@devtron-labs/devtron-fe-common-lib'

import { VulnerabilityViewTypes } from './types'

export const VULNERABILITY_VIEW_TYPE_SELECT_OPTIONS: SelectPickerOptionType<VulnerabilityViewTypes>[] = [
    { label: 'Deployments', value: VulnerabilityViewTypes.DEPLOYMENTS },
    { label: 'Vulnerabilities', value: VulnerabilityViewTypes.VULNERABILITIES },
]

export const FIX_AVAILABLE_FILTER_OPTIONS: SelectPickerOptionType[] = [
    { label: 'Fix available', value: FixAvailabilityOptions.FIX_AVAILABLE },
    { label: 'Fix not available', value: FixAvailabilityOptions.FIX_NOT_AVAILABLE },
]

export const DISCOVERY_AGE_FILTER_OPTIONS: SelectPickerOptionType[] = [
    { label: '< 30days', value: VulnerabilityDiscoveryAgeOptions.LESS_THAN_30_DAYS },
    { label: '30-60 days', value: VulnerabilityDiscoveryAgeOptions.BETWEEN_30_AND_60_DAYS },
    { label: '60-90 days', value: VulnerabilityDiscoveryAgeOptions.BETWEEN_60_AND_90_DAYS },
    { label: '> 90 days', value: VulnerabilityDiscoveryAgeOptions.GREATER_THAN_90_DAYS },
]

export const SEVERITY_FILTER_OPTIONS: SelectPickerOptionType[] = [
    { label: 'Critical', value: Severity.CRITICAL },
    { label: 'High', value: Severity.HIGH },
    { label: 'Medium', value: Severity.MEDIUM },
    { label: 'Low', value: Severity.LOW },
    { label: 'Unknown', value: Severity.UNKNOWN },
]
