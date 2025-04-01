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

import { BaseAppMetaData, getIsRequestAborted, ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'
import { getAppListMin } from '../../services/service'
import { RecentlyVisitedGroupedOptionsType, RecentlyVisitedOptions } from './AppSelector.types'
import { AllApplicationsMetaData } from './constants'

let timeoutId

/**
 *
 * @deprecated
 * This function is deprecated and will be removed in future releases.
 * Please use the `appListSelectOptions` function instead.
 */
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
                            ...res, // unnecessary but keeping it for now
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

export const appListSelectOptions = (
    inputValue: string,
    isJobView?: boolean,
    signal?: AbortSignal,
    recentlyVisitedDevtronApps?: BaseAppMetaData[],
): Promise<RecentlyVisitedGroupedOptionsType[]> => {
    const options = signal ? { signal } : null

    return new Promise((resolve) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
            if (inputValue.length < 3) {
                resolve([
                    {
                        label: 'Recently Visited',
                        options: recentlyVisitedDevtronApps.map((app: BaseAppMetaData) => ({
                            label: app.appName,
                            value: app.appId,
                        })) as RecentlyVisitedOptions[],
                    },
                    AllApplicationsMetaData,
                ])
            } else {
                getAppListMin(null, options, inputValue, isJobView ?? false)
                    .then((response) => {
                        let appList = []
                        if (response?.result) {
                            appList = [
                                {
                                    label: 'All Applications',
                                    options: response.result.map((res) => ({
                                        value: res.id,
                                        label: res.name,
                                    })) as RecentlyVisitedOptions[],
                                },
                            ] as RecentlyVisitedGroupedOptionsType[]
                        }

                        resolve(appList)
                    })
                    .catch((errors: ServerErrors) => {
                        if (!getIsRequestAborted(errors)) {
                            resolve([AllApplicationsMetaData])
                            if (errors.code) {
                                showError(errors)
                            }
                        }
                    })
            }
        }, 300)
    })
}
