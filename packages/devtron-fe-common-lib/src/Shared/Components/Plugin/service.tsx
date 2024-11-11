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

import { get, getIsRequestAborted, getUrlWithSearchParams, ResponseType, ROUTES, showError } from '../../../Common'
import { stringComparatorBySortOrder } from '../../Helpers'
import {
    GetParentPluginListPayloadType,
    GetPluginListPayloadType,
    GetPluginStoreDataReturnType,
    GetPluginStoreDataServiceParamsType,
    GetPluginTagsPayloadType,
    MinParentPluginDTO,
    PluginDetailDTO,
    PluginDetailPayloadType,
    PluginDetailServiceParamsType,
    PluginTagNamesDTO,
} from './types'
import { parsePluginDetailsDTOIntoPluginStore } from './utils'

export const getPluginsDetail = async ({
    appId,
    parentPluginIds,
    pluginIds,
    signal,
    shouldShowError = true,
    parentPluginIdentifiers,
}: PluginDetailServiceParamsType): Promise<Pick<GetPluginStoreDataReturnType, 'pluginStore'>> => {
    try {
        const payload: PluginDetailPayloadType = {
            appId,
            parentPluginId: parentPluginIds,
            pluginId: pluginIds,
            parentPluginIdentifier: parentPluginIdentifiers ? `${parentPluginIdentifiers}` : null,
        }

        const { result } = await get<PluginDetailDTO>(
            getUrlWithSearchParams(ROUTES.PLUGIN_GLOBAL_LIST_DETAIL_V2, payload),
            { signal },
        )

        const pluginStore = parsePluginDetailsDTOIntoPluginStore(result?.parentPlugins)

        return {
            pluginStore,
        }
    } catch (error) {
        if (shouldShowError && !getIsRequestAborted(error)) {
            showError(error)
        }
        throw error
    }
}

export const getPluginStoreData = async ({
    searchKey,
    selectedTags,
    appId,
    offset = 0,
    signal,
}: GetPluginStoreDataServiceParamsType): Promise<GetPluginStoreDataReturnType> => {
    try {
        const payload: GetPluginListPayloadType = {
            searchKey,
            offset,
            appId,
            size: 20,
            tag: selectedTags,
        }
        const { result } = await get<PluginDetailDTO>(getUrlWithSearchParams(ROUTES.PLUGIN_GLOBAL_LIST_V2, payload), {
            signal,
        })

        const pluginStore = parsePluginDetailsDTOIntoPluginStore(result?.parentPlugins)
        return {
            totalCount: result?.totalCount || 0,
            pluginStore,
            parentPluginIdList: result?.parentPlugins?.map((parentPluginDetails) => parentPluginDetails.id) || [],
        }
    } catch (error) {
        if (!getIsRequestAborted(error)) {
            showError(error)
        }
        throw error
    }
}

export const getAvailablePluginTags = async (appId: number): Promise<string[]> => {
    try {
        const payload: GetPluginTagsPayloadType = {
            appId,
        }

        const { result } = await get<PluginTagNamesDTO>(getUrlWithSearchParams(ROUTES.PLUGIN_GLOBAL_LIST_TAGS, payload))

        if (!result?.tagNames) {
            return []
        }

        const uniqueTags = new Set(result.tagNames)
        return Array.from(uniqueTags).sort(stringComparatorBySortOrder)
    } catch (error) {
        showError(error)
        throw error
    }
}

export const getParentPluginList = async (
    params?: Partial<GetParentPluginListPayloadType>,
): Promise<ResponseType<MinParentPluginDTO[]>> => {
    const response = await get<MinParentPluginDTO[]>(getUrlWithSearchParams(ROUTES.PLUGIN_LIST_MIN, params))

    return {
        ...response,
        result: (response?.result ?? []).sort((a, b) => stringComparatorBySortOrder(a.name, b.name)),
    }
}
