/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { get, getUrlWithSearchParams, post, put, trash } from '@devtron-labs/devtron-fe-common-lib'
import { DEVTRON_IFRAME_PRIMARY, Routes } from '../../config'
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
            identifier,
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

export const getExternalLinks = async (
    clusterId?: number,
    identifier?: string,
    type?: ExternalLinkIdentifierType,
): Promise<ExternalLinkResponse> => {
    const response = await get(getURLWithQueryParams(clusterId, identifier, type))
    return {
        ...response,
        result: {
            ...response.result,
            ExternalLinks: (response.result?.ExternalLinks || []).map((link: ExternalLink) => {
                const linkUrl = new URL(link.url)
                const openInNewTab: boolean = linkUrl.searchParams.get(DEVTRON_IFRAME_PRIMARY) === 'false'
                linkUrl.searchParams.delete(DEVTRON_IFRAME_PRIMARY)
                const sanitizedUrl = new URL(linkUrl)
                
                return {
                    ...link,
                    url: sanitizedUrl.href,
                    openInNewTab,
                }
            }),
        },
    }
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
