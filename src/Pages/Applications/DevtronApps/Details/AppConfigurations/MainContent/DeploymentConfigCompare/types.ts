import { getAppEnvDeploymentConfig } from '@devtron-labs/devtron-fe-common-lib'
import { getManifestData } from './service.utils'

type ManifestComparisonDataType = {
    isManifestComparison: true
    manifestData: [Awaited<ReturnType<typeof getManifestData>>, Awaited<ReturnType<typeof getManifestData>>]
    appConfigData?: never
}

type AppConfigComparisonDataType = {
    isManifestComparison: false
    appConfigData: [
        Awaited<ReturnType<typeof getAppEnvDeploymentConfig>>,
        Awaited<ReturnType<typeof getAppEnvDeploymentConfig>>,
    ]
    manifestData?: never
}

export type DeploymentConfigComparisonDataType = ManifestComparisonDataType | AppConfigComparisonDataType
