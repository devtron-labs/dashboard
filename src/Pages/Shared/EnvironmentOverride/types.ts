interface EnvironmentConfigDTO {
    IsOverride: boolean
    active: boolean
    chartRefId: number
    clusterId: number
    description: string
    envOverrideValues: Record<string, string>
    environmentId: number
    environmentName: string
    id: number
    isAppMetricsEnabled: boolean | null
    isBasicViewLocked: boolean
    latest: boolean
    manualReviewed: boolean
    namespace: string
    saveEligibleChanges: boolean
    status: number
}

export interface EnvironmentOverrideDeploymentTemplateDTO {
    IsOverride: boolean
    appMetrics: boolean
    chartRefId: number
    environmentConfig: EnvironmentConfigDTO
    globalChartRefId: number
    /**
     * Base deployment template
     */
    globalConfig: Record<string, string>
    guiSchema: string
    namespace: string
    readme: string
    schema: Record<string, string>
}
