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
    AppType,
    DynamicDataTableRowDataType,
    DynamicDataTableRowType,
    ROUTES,
    TagType,
    TagsTableColumnsType,
    get,
    getEmptyTagTableRow,
    getUrlWithSearchParams,
    post,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'
import { BaseAppMetaData } from '../types'

const parseLabels = (currentLabelTags: TagType[]): DynamicDataTableRowType<TagsTableColumnsType>[] =>
    currentLabelTags.map((currentLabelTag) => ({
        data: {
            tagKey: {
                value: currentLabelTag.key,
                type: DynamicDataTableRowDataType.TEXT,
                props: {},
            },
            tagValue: {
                value: currentLabelTag.value,
                type: DynamicDataTableRowDataType.TEXT,
                props: {},
            },
        },
        id: (Date.now() * Math.random()).toString(16),
        customState: {
            propagateTag: currentLabelTag.propagate,
        },
    }))

export const getLabelTags = (currentLabelTags: TagType[]) =>
    currentLabelTags?.length ? parseLabels(currentLabelTags) : [getEmptyTagTableRow()]

export const updateRecentlyVisitedDevtronApps = async (recentAppMetaData: BaseAppMetaData[]): Promise<boolean> => {
    try {
        const payload = {
            key: AppType.DEVTRON_APP,
            value: JSON.stringify(recentAppMetaData),
        }

        await post(`${ROUTES.ATTRIBUTES_USER}/${ROUTES.UPDATE}`, payload)
        return true
    } catch (error) {
        showError(error)
        return false
    }
}

export const getRecentlyVisitedDevtronApps = async (): Promise<BaseAppMetaData[]> => {
    try {
        const { result } = await get<{ value: string }>(
            getUrlWithSearchParams(`${ROUTES.ATTRIBUTES_USER}/${ROUTES.GET}`, {
                key: AppType.DEVTRON_APP,
            }),
        )

        if (!result?.value) {
            return null
        }

        return result?.value ? JSON.parse(result.value) : []
    } catch (error) {
        showError(error)
        return []
    }
}
