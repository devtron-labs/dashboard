import { get, showError, ResponseType, getUrlWithSearchParams } from '@devtron-labs/devtron-fe-common-lib'
import { LinkedCIAppDto } from './types'
import { SELECT_ALL_VALUE } from '../../../config'

export const getEnvironmentList = async (ciPipelineId: string): Promise<string[]> => {
    try {
        const { result } = (await get(`app/ci-pipeline/${ciPipelineId}/linked-ci/downstream/env`)) as ResponseType<{
            envNames: string[]
        }>
        return result.envNames
    } catch (error) {
        showError(error)
        throw error
    }
}

export const getAppList = async (
    ciPipelineId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filterConfig: Record<string, any>,
): Promise<{
    data: LinkedCIAppDto[]
    totalCount: number
}> => {
    const { environment, ..._filterConfig } = filterConfig
    const queryParams = {
        ..._filterConfig,
        envName: environment === SELECT_ALL_VALUE ? '' : environment,
    }
    try {
        const {
            result: { data, totalCount },
        } = (await get(
            getUrlWithSearchParams(`app/ci-pipeline/${ciPipelineId}/linked-ci/downstream/cd`, queryParams ?? {}),
        )) as ResponseType<{
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
