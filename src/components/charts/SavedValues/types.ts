import { ResponseType } from '../../../services/service.types'
export interface SavedValueType {
    id: number
    name: string
    chartVersion: string
    isLoading: boolean
    updatedBy: string
    updatedOn: string
}

export interface SavedValueListResponse extends ResponseType {
    result?: SavedValueType[]
}
