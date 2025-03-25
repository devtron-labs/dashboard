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
import { AppMetaInfo, BaseAppMetaData } from '@Components/app/types'
import { getRecentlyVisitedDevtronApps, updateRecentlyVisitedDevtronApps } from '@Components/app/details/service'
import React from 'react'
import { getAppListMin } from '../../services/service'

let timeoutId

export const noOptionsMessage = (
    inputObj: { inputValue: string },
    isRecentlyVisitedFilteredAppsAvailable?: boolean,
): string => {
    if (!inputObj?.inputValue) return null

    if (inputObj.inputValue.length < 3 && !isRecentlyVisitedFilteredAppsAvailable) {
        return 'No matching results'
    }
    if (inputObj.inputValue.length < 3) {
        return 'Type 3 chars to see matching results'
    }
    return 'No matching results'
}

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
    setRecentlyVisitedDevtronApps: React.Dispatch<React.SetStateAction<BaseAppMetaData[]>>,
    invalidAppId?: number,
) => {
    try {
        const response = await getRecentlyVisitedDevtronApps()
        // Combine current app with previous list
        const combinedList = [{ appId, appName }, ...response] as AppMetaInfo[]

        // Ensure unique entries using a Map
        const uniqueApps = Array.from(new Map(combinedList.map((app) => [Number(app.appId), app])).values())

        // Filter out the invalid/deleted app first, then trim the list
        const filteredList = uniqueApps.filter((app) => Number(app.appId) !== invalidAppId).slice(0, 6)

        setRecentlyVisitedDevtronApps(filteredList)
        await updateRecentlyVisitedDevtronApps(filteredList)
    } catch (error) {
        showError(error)
    }
}
