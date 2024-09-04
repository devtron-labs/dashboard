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
import { AppListUrlFilters, AppStatuses, AppStatusesDTO } from './AppListType'

export const getCurrentTabName = (appType: string): string => {
    switch (appType) {
        case AppListConstants.AppType.DEVTRON_APPS:
            return AppListConstants.AppTabs.DEVTRON_APPS
        case AppListConstants.AppType.ARGO_APPS:
            return AppListConstants.AppTabs.ARGO_APPS
        case AppListConstants.AppType.FLUX_APPS:
            return AppListConstants.AppTabs.FLUX_APPS
        default:
            return AppListConstants.AppTabs.HELM_APPS
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

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    [AppListUrlFilters.appStatus]: searchParams.getAll(AppListUrlFilters.appStatus),
    [AppListUrlFilters.project]: searchParams.getAll(AppListUrlFilters.project),
    [AppListUrlFilters.environment]: searchParams.getAll(AppListUrlFilters.environment),
    [AppListUrlFilters.cluster]: searchParams.getAll(AppListUrlFilters.cluster),
    [AppListUrlFilters.namespace]: searchParams.getAll(AppListUrlFilters.namespace),
    [AppListUrlFilters.templateType]: searchParams.getAll(AppListUrlFilters.templateType),
})

export const getFormattedFilterLabel = (filterType: AppListUrlFilters) => {
    if (filterType === AppListUrlFilters.appStatus) {
        return 'App Status'
    }
    if (filterType === AppListUrlFilters.templateType) {
        return 'Template Type'
    }
    return null
}

export const getAppStatusFormattedValue = (filterValue: string) => {
    switch (filterValue) {
        case AppStatusesDTO.HIBERNATING:
            return AppStatuses.HIBERNATING
        case AppStatusesDTO.NOT_DEPLOYED:
            return AppStatuses.NOT_DEPLOYED
        default:
            return filterValue
    }
}
