import { Routes } from '../../config'
import { get, post, put, trash } from '../../services/api'
import {
    ExternalLink,
    ExternalLinkIdentifierType,
    ExternalLinkResponse,
    ExternalLinkUpdateResponse,
    GetAllAppResponseType,
    MonitoringToolResponse,
} from './ExternalLinks.type'

export const getMonitoringTools = (): Promise<MonitoringToolResponse> => {
    return get(`${Routes.EXTERNAL_LINKS_API}/tools`)
}

export const getExternalLinks = (
    clusterId?: number,
    identifier?: string,
    type?: ExternalLinkIdentifierType,
): Promise<ExternalLinkResponse> => {
    let _url = Routes.EXTERNAL_LINKS_API

    if (clusterId >= 0 || identifier || type) {
        const queryParams = {
            clusterId: clusterId >= 0 ? `${clusterId}` : '0',
            identifier: identifier,
            type: type?.toString(),
        }

        for (const param in queryParams) {
            if (!queryParams[param]) {
                delete queryParams[param]
            }
        }

        _url += `?${new URLSearchParams(queryParams).toString()}`
    }

    return get(_url)
}

export const saveExternalLinks = (request: ExternalLink[], type?: ExternalLinkIdentifierType, identifier?: string): Promise<ExternalLinkUpdateResponse> => {
    return post(Routes.EXTERNAL_LINKS_API, request)
}

export const updateExternalLink = (request: ExternalLink): Promise<ExternalLinkUpdateResponse> => {
    return put(Routes.EXTERNAL_LINKS_API, request)
}

export const deleteExternalLink = (externalLinkId: number): Promise<ExternalLinkUpdateResponse> => {
    return trash(`${Routes.EXTERNAL_LINKS_API}?id=${externalLinkId}`)
}

export const getAllApps = (): Promise<GetAllAppResponseType> => {
    return get(Routes.GET_ALL_APPS)
}
