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

import {
    get,
    getAvailablePluginTags,
    getGlobalVariables,
    getIsRequestAborted,
    getPluginStoreData,
    getUpdatedPluginStore,
    getUrlWithSearchParams,
    post,
    showError,
    UploadFileDTO,
    UploadFileProps,
    useInfiniteQuery,
    useQuery,
} from '@devtron-labs/devtron-fe-common-lib'

import { getParentPluginList } from '@Components/CIPipelineN/CreatePluginModal/service'
import { PipelineContext } from '@Components/workflowEditor/types'
import { Routes } from '@Config/index'

import { DEFAULT_PLUGIN_LIST_DATA, PLUGIN_QUERY_KEYS } from './constants'
import { PluginListDataType, PluginListFiltersType, PluginVersionDetailDTO } from './types'

export const getPluginVersionDetail = async (
    pluginVersionId: number,
    signal?: AbortSignal,
): Promise<PluginVersionDetailDTO> => {
    const { result } = await get<PluginVersionDetailDTO>(`${Routes.PLUGIN_GLOBAL_DETAIL_ROUTE}/${pluginVersionId}`, {
        signal,
    })
    return result
}

/**
 * Uploads the file of a FILE format variable, the returned id is sent as fileReferenceId of the variable
 */
export const uploadGlobalPluginFile = async ({
    file,
    allowedExtensions,
    maxUploadSize,
}: UploadFileProps): Promise<UploadFileDTO> => {
    const formData = new FormData()
    formData.append('file', file[0])

    try {
        const { result } = await post<UploadFileDTO>(
            getUrlWithSearchParams(Routes.PLUGIN_GLOBAL_FILE_UPLOAD_ROUTE, { allowedExtensions, maxUploadSize }),
            formData,
            {},
            true,
        )

        return result
    } catch (err) {
        if (!getIsRequestAborted(err)) {
            showError(err)
        }
        throw err
    }
}

export const useGetPluginVersionDetail = (pluginVersionId: number, enabled: boolean = true) =>
    useQuery<PluginVersionDetailDTO, PluginVersionDetailDTO, readonly (string | number)[], false>({
        queryKey: [PLUGIN_QUERY_KEYS.VERSION_DETAIL, pluginVersionId],
        queryFn: ({ signal }) => getPluginVersionDetail(pluginVersionId, signal),
        enabled: enabled && !!pluginVersionId,
    })

export const useGetPluginList = ({ searchKey, tag }: PluginListFiltersType) =>
    useInfiniteQuery<
        Awaited<ReturnType<typeof getPluginStoreData>>,
        PluginListDataType,
        readonly [string, string, string[]],
        false
    >({
        queryKey: [PLUGIN_QUERY_KEYS.LIST, searchKey, tag],
        queryFn: ({ pageParam, signal }) =>
            getPluginStoreData({
                searchKey,
                selectedTags: tag,
                appId: null,
                offset: pageParam as number,
                signal,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const loadedCount = allPages.reduce((acc, page) => acc + page.parentPluginIdList.length, 0)
            return lastPage.parentPluginIdList.length && loadedCount < lastPage.totalCount ? loadedCount : undefined
        },
        select: ({ pages }) =>
            pages.reduce<PluginListDataType>(
                (acc, page) => ({
                    pluginDataStore: getUpdatedPluginStore(
                        acc.pluginDataStore,
                        page.pluginStore.parentPluginStore,
                        page.pluginStore.pluginVersionStore,
                    ),
                    parentPluginIdList: [...acc.parentPluginIdList, ...page.parentPluginIdList],
                }),
                DEFAULT_PLUGIN_LIST_DATA,
            ),
    })

export const useGetPluginTags = () =>
    useQuery<string[], string[], readonly [string], false>({
        queryKey: [PLUGIN_QUERY_KEYS.TAGS],
        queryFn: () => getAvailablePluginTags(null),
    })

export const useGetParentPluginList = () =>
    useQuery<
        Awaited<ReturnType<typeof getParentPluginList>>,
        Awaited<ReturnType<typeof getParentPluginList>>,
        readonly [string],
        false
    >({
        queryKey: [PLUGIN_QUERY_KEYS.PARENT_LIST],
        queryFn: () => getParentPluginList(null),
    })

export const useGetPluginGlobalVariables = () =>
    useQuery<PipelineContext['globalVariables'], PipelineContext['globalVariables'], readonly [string], false>({
        queryKey: [PLUGIN_QUERY_KEYS.GLOBAL_VARIABLES],
        queryFn: () => getGlobalVariables({ appId: null }),
    })
