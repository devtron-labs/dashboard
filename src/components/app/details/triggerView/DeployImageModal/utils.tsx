import {
    ACTION_STATE,
    ArtifactInfoProps,
    CDMaterialType,
    DeploymentNodeType,
    DeploymentWindowProfileMetaData,
    DeploymentWithConfigType,
    ExcludedImageNode,
    FilterStates,
    getIsRequestAborted,
    Icon,
    PipelineStageBlockInfo,
    ServerErrors,
    showError,
    STAGE_TYPE,
    ToastManager,
    ToastVariantType,
    UserApprovalMetadataType,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { TOAST_BUTTON_TEXT_VIEW_DETAILS } from '@Config/constantMessaging'

import {
    LAST_SAVED_CONFIG_OPTION,
    LATEST_TRIGGER_CONFIG_OPTION,
    SPECIFIC_TRIGGER_CONFIG_OPTION,
} from '../TriggerView.utils'
import { MATERIAL_TYPE } from '../types'
import {
    DeployImageHeaderProps,
    DeployImageModalProps,
    GetTriggerArtifactInfoPropsType,
    HandleTriggerErrorMessageForHelmManifestPushProps,
} from './types'

const ApprovalInfoTippy = importComponentFromFELibrary('ApprovalInfoTippy')

export const getIsImageApprover = (userApprovalMetadata?: UserApprovalMetadataType): boolean =>
    userApprovalMetadata?.hasCurrentUserApproved

export const getInitialSelectedConfigToDeploy = (
    materialType: DeployImageModalProps['materialType'],
    searchParams: ReturnType<typeof useSearchString>['searchParams'],
) => {
    if (
        (materialType === MATERIAL_TYPE.rollbackMaterialList && !searchParams.deploy) ||
        searchParams.deploy === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG
    ) {
        return SPECIFIC_TRIGGER_CONFIG_OPTION
    }
    if (searchParams.deploy === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG) {
        return LATEST_TRIGGER_CONFIG_OPTION
    }
    return LAST_SAVED_CONFIG_OPTION
}

export const getConfigToDeployValue = (
    materialType: DeployImageModalProps['materialType'],
    searchParams: ReturnType<typeof useSearchString>['searchParams'],
) => {
    if (searchParams.deploy) {
        return searchParams.deploy
    }
    if (materialType === MATERIAL_TYPE.rollbackMaterialList) {
        return DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG
    }
    return DeploymentWithConfigType.LAST_SAVED_CONFIG
}

export const getIsCDTriggerBlockedThroughConsequences = (
    cdPolicyConsequences: PipelineStageBlockInfo,
    stageType: DeployImageModalProps['stageType'],
) => {
    switch (stageType) {
        case DeploymentNodeType.PRECD:
            return cdPolicyConsequences.pre.isBlocked
        case DeploymentNodeType.POSTCD:
            return cdPolicyConsequences.post.isBlocked
        case DeploymentNodeType.CD:
            return cdPolicyConsequences.node.isBlocked
        default:
            return false
    }
}

export const getCDArtifactId = (selectedMaterial: CDMaterialType, materialList: CDMaterialType[]) =>
    selectedMaterial ? selectedMaterial.id : materialList?.find((_mat) => _mat.isSelected)?.id

export const showErrorIfNotAborted = (errors: ServerErrors) => {
    if (!getIsRequestAborted(errors)) {
        showError(errors)
    }
}

export const handleTriggerErrorMessageForHelmManifestPush = ({
    serverError,
    searchParams,
    redirectToDeploymentStepsPage,
}: HandleTriggerErrorMessageForHelmManifestPushProps) => {
    if (
        serverError instanceof ServerErrors &&
        Array.isArray(serverError.errors) &&
        serverError.code !== 403 &&
        serverError.code !== 408 &&
        !getIsRequestAborted(searchParams)
    ) {
        serverError.errors.forEach(({ userMessage, internalMessage }) => {
            ToastManager.showToast(
                {
                    variant: ToastVariantType.error,
                    description: userMessage ?? internalMessage,
                    buttonProps: {
                        text: TOAST_BUTTON_TEXT_VIEW_DETAILS,
                        dataTestId: 'cd-material-view-details-btns',
                        onClick: redirectToDeploymentStepsPage,
                    },
                },
                {
                    autoClose: false,
                },
            )
        })
    } else {
        showError(serverError)
    }
}

export const getDeployButtonIcon = (
    deploymentWindowMetadata: DeploymentWindowProfileMetaData,
    stageType: DeploymentNodeType,
) => {
    if (deploymentWindowMetadata.userActionState === ACTION_STATE.BLOCKED) {
        return null
    }
    if (stageType !== STAGE_TYPE.CD) {
        return <Icon name="ic-play-outline" color={null} />
    }
    return <Icon name="ic-rocket-launch" color={null} />
}

export const getCDModalHeaderText = ({
    isRollbackTrigger,
    stageType,
    envName,
    isVirtualEnvironment,
}: Pick<DeployImageHeaderProps, 'isRollbackTrigger' | 'stageType' | 'envName' | 'isVirtualEnvironment'>):
    | JSX.Element
    | string => {
    const _stageType = isRollbackTrigger ? STAGE_TYPE.ROLLBACK : stageType
    switch (_stageType) {
        case STAGE_TYPE.PRECD:
            return 'Pre Deployment'
        case STAGE_TYPE.CD:
            return (
                <>
                    Deploy to &nbsp;
                    <span className="fw-6">{`${envName}${isVirtualEnvironment ? ' (Isolated)' : ''}`}</span>
                </>
            )
        case STAGE_TYPE.POSTCD:
            return 'Post Deployment'
        case STAGE_TYPE.ROLLBACK:
            return (
                <>
                    Rollback for <span className="fw-6">{envName}</span>
                </>
            )
        default:
            return ''
    }
}

// Not sending approvalChecksNode as it is not required in this case
export const getTriggerArtifactInfoProps = ({
    material,
    isRollbackTrigger,
    showApprovalInfoTippy,
    appId,
    pipelineId,
    isExceptionUser,
    reloadMaterials,
    requestedUserId,
}: GetTriggerArtifactInfoPropsType): ArtifactInfoProps => ({
    imagePath: material.imagePath,
    registryName: material.registryName,
    registryType: material.registryType,
    image: material.image,
    deployedTime: material.deployedTime,
    deployedBy: material.deployedBy,
    isRollbackTrigger,
    excludedImagePathNode:
        material.filterState === FilterStates.ALLOWED ? null : <ExcludedImageNode image={material.image} />,
    approvalInfoTippy: showApprovalInfoTippy ? (
        <ApprovalInfoTippy
            matId={material.id}
            appId={appId}
            pipelineId={pipelineId}
            requestedUserId={requestedUserId}
            userApprovalMetadata={material.userApprovalMetadata}
            reloadMaterials={reloadMaterials}
            isExceptionUser={isExceptionUser}
        />
    ) : null,
})
