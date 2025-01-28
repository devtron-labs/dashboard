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
    getParentPluginList as getParentPluginListService,
    getUrlWithSearchParams,
    post,
    ResponseType,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '@Config/constants'
import {
    CreatePluginAPIParamsType,
    CreatePluginServiceParamsType,
    CreatePluginSuccessResponseType,
    ParentPluginListItemType,
} from './types'
import { getCreatePluginPayload } from './utils'

export const getParentPluginList = async (appId: number): Promise<ParentPluginListItemType[]> => {
    try {
        const { result } = await getParentPluginListService({ appId })
        if (!result) {
            return []
        }

        const parentPluginList: ParentPluginListItemType[] = []
        result.forEach(({ id, name, icon }) => {
            if (id && name) {
                parentPluginList.push({
                    id,
                    name,
                    icon: icon || '',
                })
            }
        })

        return parentPluginList
    } catch (error) {
        showError(error)
        throw error
    }
}

export const createPlugin = async ({
    stepData,
    appId,
    pluginForm,
    availableTags,
}: CreatePluginServiceParamsType): Promise<ResponseType<CreatePluginSuccessResponseType>> => {
    const queryParams: CreatePluginAPIParamsType = {
        appId,
    }

    return post(
        getUrlWithSearchParams(Routes.PLUGIN_GLOBAL_CREATE, queryParams),
        getCreatePluginPayload({
            stepData,
            pluginForm,
            availableTags,
        }),
    )
}
