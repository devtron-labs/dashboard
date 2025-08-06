import {
    ACTION_STATE,
    ApprovalRuntimeStateType,
    ArtifactInfoProps,
    ButtonStyleType,
    CDMaterialResponseType,
    CDMaterialType,
    CommonNodeAttr,
    DeploymentNodeType,
    DeploymentWindowProfileMetaData,
    DeploymentWithConfigType,
    ExcludedImageNode,
    FilterStates,
    getIsRequestAborted,
    Icon,
    PipelineStageBlockInfo,
    SequentialCDCardTitleProps,
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
import { FilterConditionViews, MATERIAL_TYPE } from '../types'
import {
    DeployImageHeaderProps,
    DeployImageModalProps,
    GetConsumedAndAvailableMaterialListProps,
    GetSequentialCDCardTitlePropsType,
    GetTriggerArtifactInfoPropsType,
    HelmManifestErrorHandlerProps,
} from './types'

const ApprovalInfoTippy = importComponentFromFELibrary('ApprovalInfoTippy')
const ImagePromotionInfoChip = importComponentFromFELibrary('ImagePromotionInfoChip', null, 'function')

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
            return cdPolicyConsequences?.pre?.isBlocked
        case DeploymentNodeType.POSTCD:
            return cdPolicyConsequences?.post?.isBlocked
        case DeploymentNodeType.CD:
            return cdPolicyConsequences?.node?.isBlocked
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
}: HelmManifestErrorHandlerProps) => {
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
                    Deploy to&nbsp;
                    <span className="fw-6">{`${envName}${isVirtualEnvironment ? ' (Isolated)' : ''}`}</span>
                </>
            )
        case STAGE_TYPE.POSTCD:
            return 'Post Deployment'
        case STAGE_TYPE.ROLLBACK:
            return (
                <>
                    Rollback for&nbsp;<span className="fw-6">{envName}</span>
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

const processConsumedAndApprovedImages = (materials: CDMaterialType[]) => {
    const consumedImage: CDMaterialType[] = []
    const approvedImages: CDMaterialType[] = []
    materials.forEach((mat) => {
        if (
            !mat.userApprovalMetadata ||
            mat.userApprovalMetadata.approvalRuntimeState !== ApprovalRuntimeStateType.approved
        ) {
            // TODO: Check if this is needed
            // mat.isSelected = false
            consumedImage.push(mat)
        } else {
            approvedImages.push(mat)
        }
    })
    return { consumedImage, approvedImages }
}

export const getConsumedAndAvailableMaterialList = ({
    isApprovalConfigured,
    isExceptionUser,
    materials,
    isSearchApplied,
    filterView,
    resourceFilters,
}: GetConsumedAndAvailableMaterialListProps) => {
    if (isExceptionUser) {
        return {
            consumedImage: [],
            materialList: materials,
            eligibleImagesCount: materials.filter((mat) => mat.filterState === FilterStates.ALLOWED).length,
        }
    }

    let _consumedImage: CDMaterialType[] = []
    let materialList: CDMaterialType[] = []

    if (isApprovalConfigured) {
        const { consumedImage, approvedImages } = processConsumedAndApprovedImages(materials)
        _consumedImage = consumedImage
        materialList = approvedImages
    } else {
        materialList = materials
    }

    const eligibleImagesCount = materialList.filter((mat) => mat.filterState === FilterStates.ALLOWED).length

    if (!isSearchApplied && resourceFilters?.length && filterView === FilterConditionViews.ELIGIBLE) {
        materialList = materialList.filter((mat) => mat.filterState === FilterStates.ALLOWED)
    }

    return {
        consumedImage: _consumedImage,
        materialList,
        eligibleImagesCount,
    }
}

export const getApprovedImageClass = (disableSelection: boolean, isApprovalConfigured: boolean) => {
    const disabledClassPostfix = disableSelection ? '-disabled' : ''
    return isApprovalConfigured ? `material-history__approved-image${disabledClassPostfix}` : ''
}

export const getSequentialCDCardTitleProps = ({
    material,
    envName,
    parentEnvironmentName,
    stageType,
    isVirtualEnvironment,
    isRollbackTrigger,
    isSearchApplied,
}: GetSequentialCDCardTitlePropsType): SequentialCDCardTitleProps => {
    const { promotionApprovalMetadata } = material
    const promotionApprovedBy = promotionApprovalMetadata?.approvedUsersData?.map((users) => users.userEmail)

    return {
        isLatest: material.latest,
        isRunningOnParentCD: material.runningOnParentCd,
        artifactStatus: material.artifactStatus,
        environmentName: envName,
        parentEnvironmentName,
        stageType,
        showLatestTag: +material.index === 0 && !isRollbackTrigger && !isSearchApplied,
        isVirtualEnvironment,
        targetPlatforms: material.targetPlatforms,
        additionalInfo:
            ImagePromotionInfoChip && promotionApprovalMetadata?.promotedFromType ? (
                <ImagePromotionInfoChip
                    promotedTo={envName}
                    promotedFromType={promotionApprovalMetadata?.promotedFromType}
                    promotedFrom={promotionApprovalMetadata?.promotedFrom}
                    promotedBy={promotionApprovalMetadata?.requestedUserData?.userEmail}
                    approvedBy={promotionApprovedBy}
                    promotionPolicyName={promotionApprovalMetadata?.policy?.name}
                    showBackgroundColor
                />
            ) : null,
    }
}

export const getFilterActionBarTabs = (
    materialLength: number,
    filteredImagesCount: number,
    consumedImageCount: number,
) => [
    {
        label: `Eligible images ${filteredImagesCount}/${materialLength - consumedImageCount}`,
        value: FilterConditionViews.ELIGIBLE,
    },
    {
        label: `Latest ${materialLength - consumedImageCount} images`,
        value: FilterConditionViews.ALL,
    },
]

export const getAllowWarningWithTippyNodeTypeProp = (stageType: DeploymentNodeType): CommonNodeAttr['type'] =>
    stageType === DeploymentNodeType.PRECD ? 'PRECD' : 'POSTCD'

export const getIsExceptionUser = (materialResponse: CDMaterialResponseType): boolean =>
    materialResponse?.deploymentApprovalInfo?.approvalConfigData?.isExceptionUser ?? false

export const renderDeployCTATippyData = (title: string, description: string) => (
    <>
        <h2 className="fs-12 fw-6 lh-18 m-0">{title}</h2>
        <p className="fs-12 fw-4 lh-18 m-0">{description}</p>
    </>
)

export const getDeployButtonStyle = (
    userActionState: string,
    canDeployWithoutApproval: boolean,
    canImageApproverDeploy: boolean,
): ButtonStyleType => {
    if (userActionState === ACTION_STATE.BLOCKED) {
        return ButtonStyleType.negative
    }
    if (userActionState === ACTION_STATE.PARTIAL || canDeployWithoutApproval || canImageApproverDeploy) {
        return ButtonStyleType.warning
    }
    return ButtonStyleType.default
}
