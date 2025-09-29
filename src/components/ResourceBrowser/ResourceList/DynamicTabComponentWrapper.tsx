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

import { cloneElement, ReactElement, useEffect } from 'react'
import { useLocation, useParams, useRouteMatch } from 'react-router-dom'

import {
    logExceptionToSentry,
    noop,
    RESOURCE_BROWSER_ROUTES,
    TARGET_K8S_VERSION_SEARCH_KEY,
} from '@devtron-labs/devtron-fe-common-lib'

import { UPGRADE_CLUSTER_CONSTANTS } from '../Constants'
import { DynamicTabComponentWrapperProps } from './types'
import { getTabIdForTab, getTabIdParamsForPath, getUpgradeCompatibilityTippyConfig } from './utils'

export const DynamicTabComponentWrapper = ({
    updateTabUrl,
    markTabActiveById,
    getTabId,
    addTab,
    getTabById,
    children,
}: DynamicTabComponentWrapperProps) => {
    const { pathname, search } = useLocation()
    const { path } = useRouteMatch()
    const params = useParams<Record<string, string>>()
    const searchParams = new URLSearchParams(search)

    const tabId = getTabIdForTab(path, getTabId, params)

    useEffect(() => {
        if (!tabId) {
            logExceptionToSentry(`Tab ID not found for path: ${path}`)
            return
        }

        markTabActiveById(tabId)
            .then((found) => {
                if (!found && addTab) {
                    const [idPrefix, name, kind] = getTabIdParamsForPath(path, params) || []
                    const targetK8sVersion = searchParams.get(TARGET_K8S_VERSION_SEARCH_KEY)

                    addTab({
                        idPrefix,
                        name,
                        kind,
                        type: 'dynamic',
                        url: `${pathname}${search}`,
                        ...(path === RESOURCE_BROWSER_ROUTES.CLUSTER_UPGRADE
                            ? {
                                  dynamicTitle: `${UPGRADE_CLUSTER_CONSTANTS.DYNAMIC_TITLE} to v${targetK8sVersion}`,
                                  tippyConfig: getUpgradeCompatibilityTippyConfig({
                                      targetK8sVersion,
                                  }),
                              }
                            : {}),
                    }).catch(noop)
                }
            })
            .catch(noop)
    }, [])

    useEffect(() => {
        if (!tabId) {
            logExceptionToSentry(`Tab ID not found for path: ${path}`)
            return
        }

        updateTabUrl({ id: tabId, url: `${pathname}${search}` })
    }, [pathname, search])

    return children
        ? (cloneElement(children, { ...children.props, key: getTabById(tabId)?.componentKey }) as ReactElement)
        : null
}
