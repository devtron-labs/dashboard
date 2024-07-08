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
import ArgoCDAppIcon from '../../../assets/icons/ic-argocd-app.svg'
import FluxCDAppIcon from '../../../assets/icons/ic-fluxcd-app.svg'

export const getCurrentTabName = (appType: string): string => {
    switch (appType) {
        case AppListConstants.AppType.HELM_APPS:
            return AppListConstants.AppTabs.HELM_APPS
        case AppListConstants.AppType.ARGO_APPS:
            return AppListConstants.AppTabs.ARGO_APPS
        case AppListConstants.AppType.FLUX_APPS:
            return AppListConstants.AppTabs.FLUX_APPS
        default:
            return AppListConstants.AppTabs.DEVTRON_APPS
    }
}

export const getChangeAppTabURL = (appTabType) => {
    switch (appTabType) {
        case AppListConstants.AppTabs.HELM_APPS:
            return URLS.HELM_APP_LIST
        case AppListConstants.AppTabs.ARGO_APPS:
            return URLS.ARGO_APP_LIST
        case AppListConstants.AppTabs.FLUX_APPS:
            return URLS.FLUX_APP_LIST
        default:
            return URLS.DEVTRON_APP_LIST
    }
}

export const renderIcon = (appType: string): string => {
    if (appType === AppListConstants.AppType.FLUX_APPS) {
        return FluxCDAppIcon
    }
    return ArgoCDAppIcon
}
