import { ChartMetadataType, DeploymentChartVersionType } from '@devtron-labs/devtron-fe-common-lib'

export interface MinChartRefDTO {
    chartMetadata: Record<string, ChartMetadataType>
    chartRefs: DeploymentChartVersionType[]
    latestAppChartRef: number
    latestChartRef: number
    latestEnvChartRef?: number
}
