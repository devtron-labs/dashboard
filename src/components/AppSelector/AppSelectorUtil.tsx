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

import { getIsRequestAborted, ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'
import { BaseAppMetaData } from '@Components/app/types'
import { getRecentlyVisitedDevtronApps, updateRecentlyVisitedDevtronApps } from '@Components/app/details/service'
import { getAppListMin } from '../../services/service'

let timeoutId

export const getNoOptionsMessage = (): string | null => 'No matching results'

export const appListOptions = (inputValue: string, isJobView?: boolean, signal?: AbortSignal): Promise<[]> => {
    const options = signal ? { signal } : null

    return new Promise((resolve) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
            if (inputValue.length < 3) {
                resolve([])
                return
            }
            getAppListMin(null, options, inputValue, isJobView ?? false)
                .then((response) => {
                    let appList = []
                    if (response.result) {
                        appList = response.result.map((res) => ({
                            value: res.id,
                            label: res.name,
                            ...res,
                        }))
                    }
                    resolve(appList as [])
                })
                .catch((errors: ServerErrors) => {
                    if (!getIsRequestAborted(errors)) {
                        resolve([])
                        if (errors.code) {
                            showError(errors)
                        }
                    }
                })
        }, 300)
    })
}

export const fetchRecentlyVisitedDevtronApps = async (
    appId: number,
    appName: string,
    invalidAppId?: number,
): Promise<BaseAppMetaData[]> => {
    try {
        const response = (await getRecentlyVisitedDevtronApps()) ?? []

        // Ensure all items have valid `appId` and `appName`
        const validResponse = response.filter((app): app is BaseAppMetaData => !!app?.appId && !!app?.appName)

        // Combine current app with previous list
        const combinedList = [{ appId, appName }, ...validResponse]

        // Ensure unique entries using a Set
        const uniqueApps = Array.from(new Map(combinedList.map((app) => [app.appId, app])).values())

        // Filter out invalid app and limit to 6
        const filteredList = uniqueApps.filter((app) => Number(app.appId) !== invalidAppId).slice(0, 6)

        await updateRecentlyVisitedDevtronApps(filteredList)
        return filteredList
    } catch (error) {
        showError(error)
        return []
    }
}

export const getFilteredRecentlyVisitedApps = (
    inputValue: string,
    recentlyVisitedDevtronApps: BaseAppMetaData[],
    appId: number,
) =>
    recentlyVisitedDevtronApps
        .filter((app) => app.appName.toLowerCase().includes(inputValue.toLowerCase()))
        .filter((app) => app.appId !== appId)
        .map((app) => ({ value: app.appId, label: app.appName }))

export const getDropdownOptions = (
    inputValue: string,
    recentlyVisitedDevtronApps: BaseAppMetaData[],
    appId: number,
) => {
    const filteredApps = getFilteredRecentlyVisitedApps(inputValue, recentlyVisitedDevtronApps, appId)
    return [
        {
            label: 'Recently Visited',
            options:
                filteredApps.length || inputValue?.length < 3
                    ? filteredApps
                    : [{ value: 0, label: 'No matching results' }],
        },
        {
            label: 'All Applications',
            options: [{ value: 0, label: 'Type 3 characters to search all applications', isDisabled: true }],
        },
    ]
}
