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

const appendQueryParams = (url: string, clusterId?: number, identifier?: string, type?: ExternalLinkIdentifierType) => {
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

        url += `?${new URLSearchParams(queryParams).toString()}`
    }

    return url
}

export const getExternalLinks = (
    clusterId?: number,
    identifier?: string,
    type?: ExternalLinkIdentifierType,
): Promise<ExternalLinkResponse> => {
    const _url = appendQueryParams(Routes.EXTERNAL_LINKS_API, clusterId, identifier, type)
    return get(_url)
}

export const saveExternalLinks = (
    request: ExternalLink[],
    type?: ExternalLinkIdentifierType,
    identifier?: string,
): Promise<ExternalLinkUpdateResponse> => {
    const _url = appendQueryParams(Routes.EXTERNAL_LINKS_API, 0, identifier, type)
    return post(_url, request)
}

export const updateExternalLink = (
    request: ExternalLink,
    type?: ExternalLinkIdentifierType,
    identifier?: string,
): Promise<ExternalLinkUpdateResponse> => {
    const _url = appendQueryParams(Routes.EXTERNAL_LINKS_API, 0, identifier, type)
    return put(_url, request)
}

export const deleteExternalLink = (externalLinkId: number): Promise<ExternalLinkUpdateResponse> => {
    return trash(`${Routes.EXTERNAL_LINKS_API}?id=${externalLinkId}`)
}

export const getAllApps = (): Promise<GetAllAppResponseType> => {
    return get(Routes.GET_ALL_APPS)
}
