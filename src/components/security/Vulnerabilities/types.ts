export enum VulnerabilityViewTypes {
    DEPLOYMENTS = 'DEPLOYMENTS',
    VULNERABILITIES = 'VULNERABILITIES',
}

export enum VulnerabilityDiscoveryAgeOptions {
    LESS_THAN_30_DAYS = 'lt_30d',
    BETWEEN_30_AND_60_DAYS = '30_60d',
    BETWEEN_60_AND_90_DAYS = '60_90d',
    GREATER_THAN_90_DAYS = 'gt_90d',
}

export enum FixAvailabilityOptions {
    FIX_AVAILABLE = 'fixAvailable',
    FIX_NOT_AVAILABLE = 'fixNotAvailable',
}
