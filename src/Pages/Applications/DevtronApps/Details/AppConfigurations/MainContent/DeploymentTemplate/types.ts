import { ConfigKeysWithLockType } from '@Components/deploymentConfig/types'
import { DeploymentTemplateQueryParamsType } from '@devtron-labs/devtron-fe-common-lib'

export enum ValuesAndManifestFlagDTO {
    DEPLOYMENT_TEMPLATE = 1,
    MANIFEST = 2,
}

// Can derive editMode from url as well, just wanted the typing to be more explicit
export interface DeploymentTemplateFormProps
    extends Pick<DeploymentTemplateQueryParamsType, 'editMode' | 'hideLockedKeys' | 'resolveScopedVariables'> {
    lockedConfigKeysWithLockType: ConfigKeysWithLockType
    readOnly: boolean
    handleDisableResolveScopedVariables: () => void
}

export interface GetResolvedDeploymentTemplatePayloadType {
    appId: number
    chartRefId: number
    /**
     * String to be resolved
     */
    values: string
    valuesAndManifestFlag: ValuesAndManifestFlagDTO.DEPLOYMENT_TEMPLATE
    /**
     * EnvId for the given VALUE
     */
    envId?: number
}

export interface GetResolvedDeploymentTemplateProps
    extends Omit<GetResolvedDeploymentTemplatePayloadType, 'valuesAndManifestFlag'> {}

export interface ResolvedDeploymentTemplateDTO {
    /**
     * Template with encoded variables
     */
    data: string
    /**
     * Template with resolved variables
     */
    resolvedData: string
    variableSnapshot: Record<string, string>
}
