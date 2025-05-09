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

import { get, post, put, trash } from '@devtron-labs/devtron-fe-common-lib'

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

        Object.entries(queryParams).forEach(([param, value]) => {
            if (!value) {
                delete queryParams[param]
            }
        })

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
                try {
                    const linkUrl = new URL(link.url)
                    const openInNewTab: boolean = linkUrl.searchParams.get(DEVTRON_IFRAME_PRIMARY) === 'false'
                    linkUrl.searchParams.delete(DEVTRON_IFRAME_PRIMARY)
                    const sanitizedUrl = decodeURIComponent(linkUrl.href)
                    return {
                        ...link,
                        url: sanitizedUrl,
                        openInNewTab,
                    }
                } catch {
                    return {
                        ...link,
                        openInNewTab: true,
                    }
                }
            }),
        },
    }
}

export const saveExternalLinks = (request: ExternalLink[], appId?: string): Promise<ExternalLinkUpdateResponse> =>
    post(`${Routes.EXTERNAL_LINKS_API}${appId ? `?appId=${appId}` : ''}`, request)

export const updateExternalLink = (request: ExternalLink, appId?: string): Promise<ExternalLinkUpdateResponse> =>
    put(`${Routes.EXTERNAL_LINKS_API}${appId ? `?appId=${appId}` : ''}`, request)

export const deleteExternalLink = (externalLinkId: number, appId?: string): Promise<ExternalLinkUpdateResponse> =>
    trash(`${Routes.EXTERNAL_LINKS_API}?id=${externalLinkId}${appId ? `&appId=${appId}` : ''}`)

export const getAllApps = (): Promise<GetAllAppResponseType> => get(Routes.GET_ALL_APPS)
