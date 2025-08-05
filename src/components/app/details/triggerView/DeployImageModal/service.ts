import {
    CDMaterialResponseType,
    CDMaterialServiceEnum,
    CDMaterialType,
    DeploymentNodeType,
    DeploymentWindowProfileMetaData,
    FilterStates,
    genericCDMaterialsService,
    GetPolicyConsequencesProps,
    handleAnalyticsEvent,
    PolicyConsequencesDTO,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { CD_MATERIAL_GA_EVENT } from '../Constants'
import { FilterConditionViews, MATERIAL_TYPE } from '../types'
import { GetMaterialResponseListProps, LoadOlderImagesProps } from './types'
import { getIsCDTriggerBlockedThroughConsequences } from './utils'

const getPolicyConsequences: ({ appId, envId }: GetPolicyConsequencesProps) => Promise<PolicyConsequencesDTO> =
    importComponentFromFELibrary('getPolicyConsequences', null, 'function')

const getDeploymentWindowProfileMetaData = importComponentFromFELibrary(
    'getDeploymentWindowProfileMetaData',
    null,
    'function',
)

export const getMaterialResponseList = async ({
    stageType = DeploymentNodeType.CD,
    pipelineId,
    initialSearch,
    appId,
    envId,
    materialType,
}: GetMaterialResponseListProps): Promise<
    [CDMaterialResponseType, DeploymentWindowProfileMetaData, PolicyConsequencesDTO]
> => {
    const response = await Promise.all([
        genericCDMaterialsService(
            materialType === MATERIAL_TYPE.rollbackMaterialList
                ? CDMaterialServiceEnum.ROLLBACK
                : CDMaterialServiceEnum.CD_MATERIALS,
            pipelineId,
            // Don't think need to set stageType to approval in case of approval node
            stageType,
            null,
            // It is meant to fetch the first 20 materials
            {
                offset: 0,
                size: 20,
                search: initialSearch,
            },
        ),
        getDeploymentWindowProfileMetaData ? getDeploymentWindowProfileMetaData(appId, envId) : null,
        getPolicyConsequences ? getPolicyConsequences({ appId, envId }) : null,
    ])

    if (getPolicyConsequences && getIsCDTriggerBlockedThroughConsequences(response[2]?.cd, stageType)) {
        return [null, null, response[2]]
    }
    return response
}

export const loadOlderImages = async ({
    materialList,
    resourceFilters,
    filterView,
    appliedSearchText,
    stageType,
    isRollbackTrigger = false,
    pipelineId,
}: LoadOlderImagesProps) => {
    handleAnalyticsEvent(CD_MATERIAL_GA_EVENT.FetchMoreImagesClicked)

    const isConsumedImageAvailable =
        materialList.some((materialItem) => materialItem.deployed && materialItem.latest) ?? false

    const newMaterialsResponse = await genericCDMaterialsService(
        isRollbackTrigger ? CDMaterialServiceEnum.ROLLBACK : CDMaterialServiceEnum.CD_MATERIALS,
        pipelineId,
        stageType,
        null,
        {
            offset: materialList.length - Number(isConsumedImageAvailable),
            size: 20,
            search: appliedSearchText,
        },
    )

    // NOTE: Looping through _newResponse and removing elements that are already deployed and latest and updating the index of materials to maintain consistency
    // NOTE: This is done to avoid duplicate images
    const _newMaterialsResponse = [...newMaterialsResponse.materials]
        .filter((materialItem) => !(materialItem.deployed && materialItem.latest))
        .map<CDMaterialType>((materialItem, index) => ({
            ...materialItem,
            index: materialList.length + index,
        }))

    const newMaterials = materialList.concat(_newMaterialsResponse)

    const baseSuccessMessage = `Fetched ${_newMaterialsResponse.length} images.`

    if (resourceFilters?.length && !appliedSearchText) {
        const eligibleImages = _newMaterialsResponse.filter((mat) => mat.filterState === FilterStates.ALLOWED).length

        const infoMessage =
            eligibleImages === 0 ? 'No new eligible images found.' : `${eligibleImages} new eligible images found.`

        if (filterView === FilterConditionViews.ELIGIBLE) {
            ToastManager.showToast({
                variant: ToastVariantType.info,
                description: `${baseSuccessMessage} ${infoMessage}`,
            })
        } else {
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: `${baseSuccessMessage} ${infoMessage}`,
            })
        }
    } else {
        ToastManager.showToast({
            variant: ToastVariantType.success,
            description: baseSuccessMessage,
        })
    }

    return newMaterials
}
