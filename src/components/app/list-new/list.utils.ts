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

import { AppListConstants } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../config'

export const buildDevtronAppListUrl = (): string => {
    return `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_DEVTRON}`
}

export const buildHelmAppListUrl = (): string => {
    return `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`
}

export const buildArgoAppListUrl = (): string => {
    return `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_ARGO}`
}

export const buildFluxAppListUrl = (): string => {
    return `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_FLUX}`
}

export const getCurrentTabName = (appType: string): string => {
    if (appType === AppListConstants.AppType.DEVTRON_APPS) {
        return AppListConstants.AppTabs.DEVTRON_APPS
    }
    if (appType === AppListConstants.AppType.ARGO_APPS) {
        return AppListConstants.AppTabs.ARGO_APPS
    }
    if (appType === AppListConstants.AppType.FLUX_APPS) {
        return AppListConstants.AppTabs.FLUX_APPS
    }
    return AppListConstants.AppTabs.HELM_APPS
}

export const getChangeAppTabURL = (appTabType) => {
    if (appTabType === AppListConstants.AppTabs.DEVTRON_APPS) {
        return buildDevtronAppListUrl()
    }
    if (appTabType === AppListConstants.AppTabs.ARGO_APPS) {
        return buildArgoAppListUrl()
    }
    if (appTabType === AppListConstants.AppTabs.HELM_APPS) {
        return buildHelmAppListUrl()
    }
    return buildFluxAppListUrl()
}
