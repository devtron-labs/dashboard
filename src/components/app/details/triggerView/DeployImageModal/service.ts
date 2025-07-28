import {
    CDMaterialResponseType,
    CDMaterialServiceEnum,
    DeploymentNodeType,
    DeploymentWindowProfileMetaData,
    genericCDMaterialsService,
    GetPolicyConsequencesProps,
    PolicyConsequencesDTO,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { MATERIAL_TYPE } from '../types'
import { GetMaterialResponseListProps } from './types'
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

    if (getPolicyConsequences && getIsCDTriggerBlockedThroughConsequences(response[2].cd, stageType)) {
        return [null, null, response[2]]
    }
    return response
}
