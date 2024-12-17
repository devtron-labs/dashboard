import { getAppEnvDeploymentConfig, TemplateListDTO } from '@devtron-labs/devtron-fe-common-lib'
import { getManifestData } from './service.utils'
import { AppEnvDeploymentConfigQueryParamsType } from '../../AppConfig.types'

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

export interface SetIdentifierIdBasedOnConfigurationProps {
    identifierId: AppEnvDeploymentConfigQueryParamsType['identifierId']
    isManifestView: boolean
    previousDeployments: TemplateListDTO[]
}
