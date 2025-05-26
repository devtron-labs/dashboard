import { get, post, ROUTES, showError } from '@devtron-labs/devtron-fe-common-lib'

import { ManageClusterCategoryDTO } from './types'

export const getClusterCategoryList = async (): Promise<ManageClusterCategoryDTO> => {
    try {
        const response = await get(`${ROUTES.CLUSTER_CATEGORIES}`)
        return response.result
    } catch (err) {
        showError(err)
        throw err
    }
}

export const updateCategoryList = async (request): Promise<ManageClusterCategoryDTO[]> => {
    try {
        const response = await post(`${'cluster/category'}`, request)
        return response.result
    } catch (err) {
        showError(err)
        throw err
    }
}
