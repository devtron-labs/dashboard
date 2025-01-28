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

import { URLS } from '@Config/routes'
import { InitTabType } from '@devtron-labs/devtron-fe-common-lib'

export const AppDetailsTabs = {
    k8s_Resources: 'K8s Resources',
    log_analyzer: 'Log Analyzer',
    terminal: 'Terminal',
    cluster_overview: 'Overview',
}

export const getInitialTabs = (
    locationPathname: string,
    routeMatchPath: string,
    displayLogAnalyzerTab: boolean,
): InitTabType[] => {
    const isK8sResourceTabSelected = locationPathname.includes(URLS.APP_DETAILS_K8)
    const isLogAnalyzerTabSelected = locationPathname.includes(URLS.APP_DETAILS_LOG)
    const pathWithTrailingSlash = `${routeMatchPath}${routeMatchPath.endsWith('/') ? '' : '/'}`

    return [
        {
            name: AppDetailsTabs.k8s_Resources,
            isSelected: isK8sResourceTabSelected || !isLogAnalyzerTabSelected,
            type: 'fixed',
            id: AppDetailsTabs.k8s_Resources,
            url: `${pathWithTrailingSlash}${URLS.APP_DETAILS_K8}`,
        },
        ...(!displayLogAnalyzerTab
            ? []
            : ([
                  {
                      name: AppDetailsTabs.log_analyzer,
                      isSelected: isLogAnalyzerTabSelected,
                      type: 'fixed',
                      id: AppDetailsTabs.log_analyzer,
                      url: `${pathWithTrailingSlash}${URLS.APP_DETAILS_LOG}`,
                  },
              ] as const)),
    ]
}

export const APP_DETAILS_DYNAMIC_TABS_FALLBACK_INDEX = 0
