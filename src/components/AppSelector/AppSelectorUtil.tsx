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
    BaseRecentlyVisitedEntitiesTypes,
    getIsRequestAborted,
    RecentlyVisitedGroupedOptionsType,
    RecentlyVisitedOptions,
    ServerErrors,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'

import { getAppListMin } from '../../services/service'
import { AppListOptionsTypes } from './AppSelector.types'
import { getMinCharSearchPlaceholderGroup } from './constants'

let timeoutId

export const appListOptions = ({
    inputValue,
    isJobView = false,
    signal,
    recentlyVisitedResources,
}: AppListOptionsTypes): Promise<RecentlyVisitedGroupedOptionsType[]> => {
    const options = signal ? { signal } : null

    return new Promise((resolve) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
            if (inputValue.length < 3) {
                resolve(
                    recentlyVisitedResources?.length
                        ? [
                              {
                                  label: 'Recently Visited',
                                  options: recentlyVisitedResources.map((app: BaseRecentlyVisitedEntitiesTypes) => ({
                                      label: app.name,
                                      value: app.id,
                                      isRecentlyVisited: true,
                                  })) as RecentlyVisitedOptions[],
                              },
                              getMinCharSearchPlaceholderGroup(isJobView ? 'Jobs' : 'Apps'),
                          ]
                        : [],
                )
            } else {
                getAppListMin(null, options, inputValue, isJobView)
                    .then((response) => {
                        const appList = response.result
                            ? ([
                                  {
                                      label: `All ${isJobView ? 'Jobs' : 'Applications'}`,
                                      options: response.result.map((res) => ({
                                          value: res.id,
                                          label: res.name,
                                      })) as RecentlyVisitedOptions[],
                                  },
                              ] as RecentlyVisitedGroupedOptionsType[])
                            : []

                        resolve(appList)
                    })
                    .catch((errors: ServerErrors) => {
                        if (!getIsRequestAborted(errors)) {
                            resolve([])
                            if (errors.code) {
                                showError(errors)
                            }
                        }
                    })
            }
        }, 300)
    })
}
