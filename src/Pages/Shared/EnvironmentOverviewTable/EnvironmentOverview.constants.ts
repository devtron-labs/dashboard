export const EnvironmentOverviewTableHeaderFixedKeys = {
    STATUS: 'status',
    NAME: 'name',
} as const

export const EnvironmentOverviewTableHeaderVariableKeys = {
    DEPLOYMENT_STATUS: 'deploymentStatus',
    LAST_DEPLOYED_IMAGE: 'lastDeployedImage',
    COMMITS: 'commits',
    DEPLOYED_AT: 'deployedAt',
    DEPLOYED_BY: 'deployedBy',
} as const

export const EnvironmentOverviewTableHeaderKeys = {
    ...EnvironmentOverviewTableHeaderFixedKeys,
    ...EnvironmentOverviewTableHeaderVariableKeys,
} as const

export const EnvironmentOverviewTableSortableKeys = (({ NAME, DEPLOYED_AT }) => ({ NAME, DEPLOYED_AT }))(
    EnvironmentOverviewTableHeaderKeys,
)

export const EnvironmentOverviewTableHeaderValues: Record<keyof typeof EnvironmentOverviewTableHeaderKeys, string> = {
    NAME: 'APPLICATION',
    DEPLOYMENT_STATUS: 'DEPLOYMENT STATUS',
    LAST_DEPLOYED_IMAGE: 'LAST DEPLOYED IMAGE',
    COMMITS: 'COMMIT',
    DEPLOYED_AT: 'DEPLOYED AT',
    DEPLOYED_BY: 'DEPLOYED BY',
    STATUS: null,
}
