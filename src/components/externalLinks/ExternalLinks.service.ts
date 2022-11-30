import { Routes } from '../../config'
import { get, post, put, trash } from '../../services/api'
import {
    ExternalLink,
    ExternalLinkResponse,
    ExternalLinkUpdateResponse,
    MonitoringToolResponse,
} from './ExternalLinks.type'

export const getMonitoringTools = (): Promise<MonitoringToolResponse> => {
    return get(`${Routes.EXTERNAL_LINKS_API}/tools`)
}

export const getExternalLinks = (clusterId?: number): Promise<ExternalLinkResponse> => {
    return get(`${Routes.EXTERNAL_LINKS_API}${clusterId ? `?clusterId=${clusterId}` : ''}`)
}

export const saveExternalLinks = (request: ExternalLink[]): Promise<ExternalLinkUpdateResponse> => {
    return post(Routes.EXTERNAL_LINKS_API, request)
}

export const updateExternalLink = (request: ExternalLink): Promise<ExternalLinkUpdateResponse> => {
    return put(Routes.EXTERNAL_LINKS_API, request)
}

export const deleteExternalLink = (externalLinkId: number): Promise<ExternalLinkUpdateResponse> => {
    return trash(`${Routes.EXTERNAL_LINKS_API}?id=${externalLinkId}`)
}
