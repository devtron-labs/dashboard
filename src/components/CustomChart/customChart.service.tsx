import { Host, Routes } from '../../config'
import { post, get, put } from '../../services/api'

export const getChartLIST = (): Promise<any> => {
    return get(Routes.CUSTOM_CHART_LIST)
}

export const validateChart = (payload): Promise<any> => {
    return post(Routes.VALIDATE_CUSTOM_CHART, payload, {}, true)
}
export const uploadChart = (payload): Promise<any> => {
    return put(Routes.UPLOAD_CUSTOM_CHART, payload)
}
