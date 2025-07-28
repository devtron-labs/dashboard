import {
    CDMaterialResponseType,
    CDMaterialSidebarType,
    CDMaterialType,
    ConsequenceType,
    DeploymentAppTypes,
    DeploymentNodeType,
    ServerErrors,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import { MATERIAL_TYPE, RuntimeParamsErrorState } from '../types'

export interface DeployImageModalProps {
    appId: number
    envId: number
    appName: string
    pipelineId: number
    stageType?: DeploymentNodeType
    materialType: (typeof MATERIAL_TYPE)[keyof typeof MATERIAL_TYPE]
    handleClose: () => void
    envName: string
    showPluginWarningBeforeTrigger: boolean
    consequence: ConsequenceType
    configurePluginURL: string
    /**
     * In case of appDetails trigger re-fetch of app details
     */
    handleSuccess?: () => void
    deploymentAppType: DeploymentAppTypes
    isVirtualEnvironment: boolean
}

export type DeployImageHeaderProps = Pick<
    DeployImageModalProps,
    'handleClose' | 'stageType' | 'isVirtualEnvironment'
> & {
    envName: string
    isRollbackTrigger: boolean
}

export interface RuntimeParamsSidebarProps {
    areTabsDisabled: boolean
    currentSidebarTab: CDMaterialSidebarType
    handleSidebarTabChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    runtimeParamsErrorState: RuntimeParamsErrorState
    appName: string
}

export interface GetMaterialResponseListProps
    extends Pick<DeployImageModalProps, 'pipelineId' | 'stageType' | 'materialType' | 'appId' | 'envId'> {
    initialSearch: string
}

export interface HandleTriggerErrorMessageForHelmManifestPushProps {
    serverError: ServerErrors
    searchParams: ReturnType<typeof useSearchString>['searchParams']
    redirectToDeploymentStepsPage: () => void
}

export interface GetTriggerArtifactInfoPropsType
    extends Pick<DeployImageModalProps, 'appId' | 'pipelineId'>,
        Pick<CDMaterialResponseType, 'requestedUserId'> {
    material: CDMaterialType
    showApprovalInfoTippy: boolean
    isRollbackTrigger: boolean
    isExceptionUser: boolean
    reloadMaterials: () => void
}
