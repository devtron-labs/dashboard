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

import { AppListConstants, URLS } from '../../../config'

export const buildDevtronAppListUrl = (): string => {
    return `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_DEVTRON}`
}

export const buildHelmAppListUrl = (): string => {
    return `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`
}

export const buildArgoAppListUrl = (): string => {
    return `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_ARGO}`
}

export const getCurrentTabName = (appType: string, isExternalArgo: boolean): string => {
    if (appType === AppListConstants.AppType.DEVTRON_APPS) {
        return AppListConstants.AppTabs.DEVTRON_APPS
    }
    if (isExternalArgo) {
        return AppListConstants.AppTabs.ARGO_APPS
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
    return buildHelmAppListUrl()
}
