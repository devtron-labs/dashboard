import { post, showError } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '@Config/constants'
import {
    GetResolvedDeploymentTemplatePayloadType,
    GetResolvedDeploymentTemplateProps,
    ResolvedDeploymentTemplateDTO,
    ValuesAndManifestFlagDTO,
} from './types'

export const getResolvedDeploymentTemplate = async (params: GetResolvedDeploymentTemplateProps): Promise<string> => {
    try {
        const payload: GetResolvedDeploymentTemplatePayloadType = {
            ...params,
            valuesAndManifestFlag: ValuesAndManifestFlagDTO.DEPLOYMENT_TEMPLATE,
        }

        const { result } = await post<ResolvedDeploymentTemplateDTO>(`${Routes.DEPLOYMENT_VALUES_MANIFEST}`, payload)
        const areVariablesPresent = result.variableSnapshot && Object.keys(result.variableSnapshot).length > 0

        if (!areVariablesPresent) {
            return ''
        }

        return result.resolvedData
    } catch (error) {
        showError(error)
        throw error
    }
}
