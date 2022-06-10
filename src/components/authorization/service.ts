import { ResponseType } from '../../services/service.types'
import { get, post } from '../../services/api'
import { Routes } from '../../config'

export function getGeneratedAPITokenList(): Promise<ResponseType> {
    return get(Routes.API_TOKEN)
}
