import { cloneElement, ReactElement, useEffect } from 'react'
import { useLocation, useParams, useRouteMatch } from 'react-router-dom'

import { logExceptionToSentry, noop, RESOURCE_BROWSER_ROUTES } from '@devtron-labs/devtron-fe-common-lib'

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
                    const { targetK8sVersion = '' } = params
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

    return cloneElement(children, { ...children.props, key: getTabById(tabId)?.componentKey }) as ReactElement
}
