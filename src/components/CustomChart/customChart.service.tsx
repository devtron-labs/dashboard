import { post, get, put } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import { ChartListResponse, ChartUploadResponse, ChartUploadType } from './types'

export const getChartList = (): Promise<ChartListResponse> => {
    return get(Routes.CUSTOM_CHART_LIST)
}

export const validateChart = (payload: FormData): Promise<ChartUploadResponse> => {
    return post(Routes.VALIDATE_CUSTOM_CHART, payload, {}, true)
}
export const uploadChart = (payload: ChartUploadType): Promise<ChartUploadResponse> => {
    return put(Routes.UPLOAD_CUSTOM_CHART, payload)
}
