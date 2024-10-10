import { getConfigDiffData, getManifestData } from './service.utils'

type ManifestComparisonDataType = {
    isManifestComparison: true
    manifestData: [Awaited<ReturnType<typeof getManifestData>>, Awaited<ReturnType<typeof getManifestData>>]
    appConfigData?: never
}

type AppConfigComparisonDataType = {
    isManifestComparison: false
    appConfigData: [Awaited<ReturnType<typeof getConfigDiffData>>, Awaited<ReturnType<typeof getConfigDiffData>>]
    manifestData?: never
}

export type DeploymentConfigComparisonDataType = ManifestComparisonDataType | AppConfigComparisonDataType
