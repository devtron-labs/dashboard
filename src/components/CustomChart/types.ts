import { ResponseType } from '../../services/service.types'
export interface ChartDetailType {
    chartDescription: string
    name: string
    version: string
    count?: number
}
export interface ChartUploadType {
    chartName: string
    description: string
    fileId: number
    message: string
    chartVersion: number
}

export interface ChartListResponse extends ResponseType {
    result?: ChartDetailType[]
}
export interface ChartUploadResponse extends ResponseType {
    result?: ChartUploadType
}
