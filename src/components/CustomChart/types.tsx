import { ResponseType } from '../../services/service.types'
export interface chartDetailType {
    chartDescription: string
    name: string
    version: string
    count?: number
}
export interface chartUploadType {
    chartName: string
    description: string
    fileId: number
    message: string
    chartVersion: number
}

export interface ChartListResponse extends ResponseType {
    result?: chartDetailType[]
}
export interface ChartUploadResponse extends ResponseType {
    result?: chartUploadType
}
