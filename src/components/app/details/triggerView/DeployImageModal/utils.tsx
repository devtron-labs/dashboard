import {
    ACTION_STATE,
    API_STATUS_CODES,
    ApprovalRuntimeStateType,
    ArtifactInfoProps,
    BULK_DEPLOY_ACTIVE_IMAGE_TAG,
    BULK_DEPLOY_LATEST_IMAGE_TAG,
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
    getStageTitle,
    Icon,
    PipelineStageBlockInfo,
    PromiseAllStatusType,
    SequentialCDCardTitleProps,
    ServerErrors,
    showError,
    STAGE_TYPE,
    ToastManager,
    ToastVariantType,
    TriggerBlockType,
    triggerCDNode,
    UserApprovalMetadataType,
    useSearchString,
    WorkflowNodeType,
    WorkflowType,
} from '@devtron-labs/devtron-fe-common-lib'

import {
    BulkCDDetailDerivedFromNode,
    ResponseRowType,
    TriggerVirtualEnvResponseRowType,
} from '@Components/ApplicationGroup/AppGroup.types'
import {
    BULK_CD_RESPONSE_STATUS_TEXT,
    BULK_VIRTUAL_RESPONSE_STATUS,
    BulkResponseStatus,
} from '@Components/ApplicationGroup/Constants'
import { getCDPipelineURL, importComponentFromFELibrary } from '@Components/common'
import { TOAST_BUTTON_TEXT_VIEW_DETAILS } from '@Config/constantMessaging'

import {
    LAST_SAVED_CONFIG_OPTION,
    LATEST_TRIGGER_CONFIG_OPTION,
    SPECIFIC_TRIGGER_CONFIG_OPTION,
} from '../TriggerView.utils'
import { FilterConditionViews, MATERIAL_TYPE } from '../types'
import { INITIAL_DEPLOY_VIEW_STATE } from './constants'
import {
    DeployImageContentProps,
    DeployImageHeaderProps,
    DeployImageModalProps,
    GetBulkCDDetailsMapFromResponseType,
    GetConsumedAndAvailableMaterialListProps,
    GetResponseRowFromTriggerCDResponseProps,
    GetSequentialCDCardTitlePropsType,
    GetTriggerArtifactInfoPropsType,
    GetTriggerCDPromiseMethodsType,
    HelmManifestErrorHandlerProps,
} from './types'

const ApprovalInfoTippy = importComponentFromFELibrary('ApprovalInfoTippy')
const ImagePromotionInfoChip = importComponentFromFELibrary('ImagePromotionInfoChip', null, 'function')
const getRuntimeParamsPayload = importComponentFromFELibrary('getRuntimeParamsPayload', null, 'function')

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

export const getIsConsumedImageAvailable = (materials: CDMaterialType[]) =>
    materials.some((materialItem) => materialItem.deployed && materialItem.latest) ?? false

const getTagWarningRelatedToMaterial = (updatedMaterials: CDMaterialType[], selectedImageTagName: string): string => {
    const selectedImage = updatedMaterials.find((material) => material.isSelected)

    const selectedTagParsedName =
        selectedImageTagName.length > 15 ? `${selectedImageTagName.slice(0, 15)}...` : selectedImageTagName

    if (!selectedImage) {
        return `Tag ${selectedTagParsedName} is not present`
    }

    if (selectedImage.vulnerable) {
        return `Tag ${selectedTagParsedName} has vulnerabilities`
    }

    if (selectedImage.filterState !== FilterStates.ALLOWED) {
        return `Tag ${selectedTagParsedName} is not eligible for deployment`
    }

    return ''
}

// If tag is not present, and image is selected we will show mixed tag
export const getUpdatedMaterialsForTagSelection = (tagName: string, materials: CDMaterialType[]) => {
    const sourceMaterials = structuredClone(materials)

    const updatedMaterials = sourceMaterials.map((material, materialIndex) => {
        if (tagName === BULK_DEPLOY_LATEST_IMAGE_TAG.value && materialIndex === 0) {
            return {
                ...material,
                isSelected: true,
            }
        }

        if (tagName === BULK_DEPLOY_ACTIVE_IMAGE_TAG.value && material.deployed && material.latest) {
            return {
                ...material,
                isSelected: true,
            }
        }

        const isTagPresent = material.imageReleaseTags?.some((tag) => tag.tagName === tagName)

        if (isTagPresent) {
            return {
                ...material,
                isSelected: true,
            }
        }

        return {
            ...material,
            isSelected: false,
        }
    })

    const selectedImage = updatedMaterials.find((material) => material.isSelected)

    const tagsWarning = getTagWarningRelatedToMaterial(updatedMaterials, tagName)

    if (selectedImage && tagsWarning) {
        selectedImage.isSelected = false
    }

    return {
        tagsWarning,
        updatedMaterials,
    }
}

export const getBaseBulkCDDetailsMap = (validWorkflows: WorkflowType[], stageType: DeploymentNodeType, envId: number) =>
    validWorkflows.reduce<Record<number, BulkCDDetailDerivedFromNode>>((acc, workflow) => {
        const selectedCINode = workflow.nodes.find(
            (node) => node.type === WorkflowNodeType.CI || node.type === WorkflowNodeType.WEBHOOK,
        )
        const doesWorkflowContainsWebhook = selectedCINode?.type === WorkflowNodeType.WEBHOOK

        // Will not be undefined since we are filtering workflows with CD node
        const cdNode = workflow.nodes.find(
            (node) => node.type === DeploymentNodeType.CD && +node.environmentId === +envId,
        )

        // Could be undefined
        const currentStageNode = workflow.nodes.find(
            (node) => node.type === stageType && +node.environmentId === +envId,
        )

        const isTriggerBlockedDueToPlugin = currentStageNode?.isTriggerBlocked && currentStageNode?.showPluginWarning

        const isTriggerBlockedDueToMandatoryTags =
            currentStageNode?.isTriggerBlocked &&
            currentStageNode?.triggerBlockedInfo?.blockedBy === TriggerBlockType.MANDATORY_TAG

        const stageText = getStageTitle(stageType)

        const blockedStageWarning =
            isTriggerBlockedDueToPlugin || isTriggerBlockedDueToMandatoryTags ? `${stageText} is blocked` : ''

        const noStageWarning = !currentStageNode ? `No ${stageText} stage` : ''

        acc[workflow.appId] = {
            appId: workflow.appId,
            appName: workflow.name,
            pipelineId: +cdNode.id,
            parentEnvironmentName: currentStageNode?.parentEnvironmentName,
            isTriggerBlockedDueToPlugin,
            configurePluginURL: getCDPipelineURL(
                String(workflow.appId),
                workflow.id,
                doesWorkflowContainsWebhook ? '0' : selectedCINode.id,
                doesWorkflowContainsWebhook,
                cdNode.id,
                true,
            ),
            triggerType: currentStageNode?.triggerType,
            warningMessage: noStageWarning || blockedStageWarning || '',
            triggerBlockedInfo: currentStageNode?.triggerBlockedInfo,
            stageNotAvailable: !currentStageNode,
            showPluginWarning: currentStageNode?.showPluginWarning,
            consequence: currentStageNode?.pluginBlockState,
        }

        return acc
    }, {})

export const getBulkCDDetailsMapFromResponse: GetBulkCDDetailsMapFromResponseType = ({
    searchText,
    validWorkflows,
    cdMaterialResponseList,
    selectedTagName,
    baseBulkCDDetailMap,
    deploymentWindowMap,
}) => {
    const bulkCDDetailsMap: DeployImageContentProps['appInfoMap'] = {}

    cdMaterialResponseList.forEach((materialResponse, index) => {
        const { appId } = validWorkflows[index]

        if (materialResponse.status === PromiseAllStatusType.FULFILLED && materialResponse.value) {
            const { tagsWarning, updatedMaterials } = getUpdatedMaterialsForTagSelection(
                selectedTagName,
                materialResponse.value.materials,
            )

            const parsedTagsWarning = searchText ? '' : tagsWarning

            const updatedWarningMessage =
                baseBulkCDDetailMap[appId].warningMessage ||
                deploymentWindowMap[appId]?.warningMessage ||
                parsedTagsWarning

            // In case of search and reload even though method gives whole state, will only update deploymentWindowMetadata, warningMessage and materialResponse
            bulkCDDetailsMap[appId] = {
                ...baseBulkCDDetailMap[appId],
                materialResponse: {
                    ...materialResponse.value,
                    materials: searchText ? materialResponse.value.materials : updatedMaterials,
                },
                deploymentWindowMetadata: deploymentWindowMap[appId],
                areMaterialsLoading: false,
                deployViewState: structuredClone(INITIAL_DEPLOY_VIEW_STATE),
                warningMessage: updatedWarningMessage,
                materialError: null,
            }
        } else {
            bulkCDDetailsMap[appId] = {
                ...baseBulkCDDetailMap[appId],
                materialResponse: {} as CDMaterialResponseType,
                deploymentWindowMetadata: {} as DeploymentWindowProfileMetaData,
                deployViewState: structuredClone(INITIAL_DEPLOY_VIEW_STATE),
                materialError:
                    materialResponse.status === PromiseAllStatusType.REJECTED ? materialResponse.reason : null,
                areMaterialsLoading: false,
            }
        }
    })

    return bulkCDDetailsMap
}

export const getTriggerCDPromiseMethods: GetTriggerCDPromiseMethodsType = ({
    appInfoMap,
    appsToRetry,
    skipHibernatedApps,
    pipelineIdVsStrategyMap,
    stageType,
    bulkDeploymentStrategy,
}) =>
    Object.values(appInfoMap).reduce<ReturnType<GetTriggerCDPromiseMethodsType>>(
        (acc, appDetails) => {
            if (appsToRetry && !appsToRetry[appDetails.appId.toString()]) {
                return acc
            }

            const selectedImage = appDetails.materialResponse?.materials.find((material) => material.isSelected)

            if (!selectedImage) {
                return acc
            }

            const pipelineId = +appDetails.pipelineId
            const strategy = pipelineIdVsStrategyMap[pipelineId]

            if (bulkDeploymentStrategy === 'DEFAULT' || !!strategy) {
                acc.cdTriggerPromiseFunctions.push(() =>
                    triggerCDNode({
                        pipelineId,
                        ciArtifactId: +selectedImage.id,
                        appId: +appDetails.appId,
                        stageType,
                        ...(getRuntimeParamsPayload
                            ? {
                                  runtimeParamsPayload: getRuntimeParamsPayload(
                                      appDetails.materialResponse.runtimeParams ?? [],
                                  ),
                              }
                            : {}),
                        skipIfHibernated: skipHibernatedApps,
                        // strategy DEFAULT means custom chart
                        ...(strategy && strategy !== 'DEFAULT' ? { strategy } : {}),
                    }),
                )

                acc.triggeredAppIds.push(+appDetails.appId)
            }

            return acc
        },
        {
            cdTriggerPromiseFunctions: [],
            triggeredAppIds: [],
        },
    )

const getStatusTypeFromTriggerCDResponse = (
    response: GetResponseRowFromTriggerCDResponseProps['apiResponse'][number],
): BulkResponseStatus => {
    if (response.status === PromiseAllStatusType.FULFILLED) {
        return BulkResponseStatus.PASS
    }

    const errorReason = response.reason
    if (errorReason.code === API_STATUS_CODES.EXPECTATION_FAILED) {
        return BulkResponseStatus.SKIP
    }

    if (
        errorReason.code === API_STATUS_CODES.PERMISSION_DENIED ||
        errorReason.code === API_STATUS_CODES.UNPROCESSABLE_ENTITY
    ) {
        return BulkResponseStatus.UNAUTHORIZE
    }

    return BulkResponseStatus.FAIL
}

export const getResponseRowFromTriggerCDResponse = ({
    apiResponse,
    appInfoMap,
    triggeredAppIds,
    envId,
    isVirtualEnvironment,
    stageType,
}: GetResponseRowFromTriggerCDResponseProps): ResponseRowType[] => {
    const newResponseList: ResponseRowType[] = []
    apiResponse.forEach((response, index) => {
        const appDetails = appInfoMap[triggeredAppIds[index]]
        const status = getStatusTypeFromTriggerCDResponse(response)
        const statusType = isVirtualEnvironment
            ? BULK_VIRTUAL_RESPONSE_STATUS[status]
            : BULK_CD_RESPONSE_STATUS_TEXT[status]

        const baseMessage: Pick<ResponseRowType, 'appId' | 'appName' | 'statusText' | 'status' | 'envId'> = {
            appId: appDetails.appId,
            appName: appDetails.appName,
            statusText: statusType,
            status,
            envId: +envId,
        }

        if (response.status === PromiseAllStatusType.FULFILLED) {
            const virtualEnvResponseRowType: TriggerVirtualEnvResponseRowType = isVirtualEnvironment
                ? {
                      isVirtual: true,
                      helmPackageName: response.value?.result?.helmPackageName,
                      cdWorkflowType: stageType,
                  }
                : {}

            newResponseList.push({
                message: '',
                ...baseMessage,
                ...virtualEnvResponseRowType,
            })
        } else {
            newResponseList.push({
                ...baseMessage,
                message: response.reason?.errors?.[0]?.userMessage,
            })
        }
    })

    return newResponseList
}
