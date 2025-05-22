import { ResponseType, showError } from '@devtron-labs/devtron-fe-common-lib'

import { ManageCategoryDTO } from './types'

const getMockData: () => ManageCategoryDTO[] = () => [
    {
        id: 1,
        category: 'staging',
        description: 'staging environment',
    },
    {
        id: 2,
        category: 'production',
        description: 'production environment',
    },
]

export const getCategoryList = async (): Promise<ResponseType<ManageCategoryDTO[]>> => {
    try {
        // const response = await get(`${ROUTES.CATEGORIES}`)

        return {
            code: 200,
            status: 'OK',
            result: getMockData(),
        }
    } catch (err) {
        showError(err)
        throw err
    }
}
