import { get, showError, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { LinkedCIAppDto } from './types'

export const getEnvironmentList = () => {}

export const getAppList = async (
    ciPipelineId: string,
): Promise<{
    data: LinkedCIAppDto[]
    totalCount: number
}> => {
    try {
        const {
            result: { data, totalCount },
        } = (await get(`app/ci-pipeline/${ciPipelineId}/linked-ci/downstream/cd`)) as ResponseType<{
            data: LinkedCIAppDto[]
            totalCount: number
        }>

        return {
            data,
            totalCount,
        }
    } catch (error) {
        showError(error)
        throw error
    }
}
