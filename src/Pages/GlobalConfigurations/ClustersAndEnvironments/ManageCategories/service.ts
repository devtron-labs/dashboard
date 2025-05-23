import { get, ROUTES, showError } from '@devtron-labs/devtron-fe-common-lib'

import { ManageClusterCategoryDTO, ManageEnvironmentCategoryDTO } from './types'

export const getClusterCategoryList = async (): Promise<ManageClusterCategoryDTO> => {
    try {
        const response = await get(`${ROUTES.CLUSTER_CATEGORIES}`)
        return response.result
    } catch (err) {
        showError(err)
        throw err
    }
}

export const getEnvironmentCategoryList = async (): Promise<ManageEnvironmentCategoryDTO> => {
    try {
        const response = await get(`${ROUTES.ENVIRONMENT_CATEGORIES}`)
        return response.result
    } catch (err) {
        showError(err)
        throw err
    }
}
