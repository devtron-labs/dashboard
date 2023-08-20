import { Routes } from '../../config'
import { post, get, put, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { ChartListResponse, ChartUploadResponse, ChartUploadType } from './types'

export const getChartList = (): Promise<ChartListResponse> => {
    return get(Routes.CUSTOM_CHART_LIST)
}

export const downloadCustomChart = (id: number): Promise<ResponseType> => {
    return get(`${Routes.DOWNLOAD_CUSTOM_CHART}/${id}`)
}

export const validateChart = (payload: FormData): Promise<ChartUploadResponse> => {
    return post(Routes.VALIDATE_CUSTOM_CHART, payload, {}, true)
}
export const uploadChart = (payload: ChartUploadType): Promise<ChartUploadResponse> => {
    return put(Routes.UPLOAD_CUSTOM_CHART, payload)
}
