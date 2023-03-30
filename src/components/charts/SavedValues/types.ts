import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'
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
