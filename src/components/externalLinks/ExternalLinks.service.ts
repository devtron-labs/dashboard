import { Routes } from '../../config'
import { get, post, put, trash } from '@devtron-labs/devtron-fe-common-lib'
import {
    ExternalLink,
    ExternalLinkIdentifierType,
    ExternalLinkResponse,
    ExternalLinkUpdateResponse,
    GetAllAppResponseType,
} from './ExternalLinks.type'

const getURLWithQueryParams = (clusterId?: number, identifier?: string, type?: ExternalLinkIdentifierType) => {
    let _url = `${Routes.EXTERNAL_LINKS_API}/${Routes.APP_LIST_V2}`
    if (clusterId >= 0 || identifier || type) {
        const queryParams = {
            clusterId: clusterId >= 0 ? `${clusterId}` : '',
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

    return _url
}

export const getExternalLinks = (
    clusterId?: number,
    identifier?: string,
    type?: ExternalLinkIdentifierType,
): Promise<ExternalLinkResponse> => {
    return get(getURLWithQueryParams(clusterId, identifier, type))
}

export const saveExternalLinks = (request: ExternalLink[], appId?: string): Promise<ExternalLinkUpdateResponse> => {
    return post(`${Routes.EXTERNAL_LINKS_API}${appId ? `?appId=${appId}` : ''}`, request)
}

export const updateExternalLink = (request: ExternalLink, appId?: string): Promise<ExternalLinkUpdateResponse> => {
    return put(`${Routes.EXTERNAL_LINKS_API}${appId ? `?appId=${appId}` : ''}`, request)
}

export const deleteExternalLink = (externalLinkId: number, appId?: string): Promise<ExternalLinkUpdateResponse> => {
    return trash(`${Routes.EXTERNAL_LINKS_API}?id=${externalLinkId}${appId ? `&appId=${appId}` : ''}`)
}

export const getAllApps = (): Promise<GetAllAppResponseType> => {
    return get(Routes.GET_ALL_APPS)
}
