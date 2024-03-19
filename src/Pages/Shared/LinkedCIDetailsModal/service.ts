import { get, showError, ResponseType, getUrlWithSearchParams } from '@devtron-labs/devtron-fe-common-lib'
import { LinkedCIAppDto, LinkedCIAppListFilterParams, CIPpelineEnviromentList } from './types'
import { Routes, SELECT_ALL_VALUE } from '../../../config'

export const getLinkedCIPipelineEnvironmentList = async (ciPipelineId: string): Promise<CIPpelineEnviromentList> => {
    try {
        const { result } = (await get(
            `${Routes.CI_CONFIG_GET}/${ciPipelineId}/${Routes.LINKED_CI_DOWNSTREAM}/${Routes.ENVIRONMENT}`,
        )) as ResponseType<{
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
    filterConfig: LinkedCIAppListFilterParams,
    signal?: AbortSignal,
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
            getUrlWithSearchParams(
                `${Routes.CI_CONFIG_GET}/${ciPipelineId}/${Routes.LINKED_CI_DOWNSTREAM}/cd`,
                queryParams ?? {},
            ),
            { signal },
        )) as ResponseType<{
            data: LinkedCIAppDto[]
            totalCount: number
        }>

        return {
            data,
            totalCount,
        }
    } catch (error) {
        if (!signal?.aborted) {
            showError(error)
        }
        throw error
    }
}
