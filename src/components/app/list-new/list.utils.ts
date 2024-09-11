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

import * as queryString from 'query-string'
import { AppListConstants } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../config'
import ArgoCDAppIcon from '../../../assets/icons/ic-argocd-app.svg'
import FluxCDAppIcon from '../../../assets/icons/ic-fluxcd-app.svg'
import { buildClusterVsNamespace } from './AppListService'
import { OrderBy, SortBy } from '../list/types'
import { AppListAppliedFilters, AppListPayloadType } from './AppListType'

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

export const getPayloadFromUrl = (
    searchQuery: string,
    appCount: number,
    showExportCsvButton: boolean,
): { payload: AppListPayloadType; filterApplied: AppListAppliedFilters } => {
    const params = queryString.parse(searchQuery)
    const search = (params.search as string) || ''
    const environments = params.environment || ''
    const appStatus = params.appStatus || ''
    const teams = params.team || ''
    const clustersAndNamespaces = params.namespace || ''
    const templateType = params.templateType || ''

    const _clusterVsNamespaceMap = buildClusterVsNamespace(clustersAndNamespaces)
    const environmentsArr = environments
        .toString()
        .split(',')
        .map((env) => +env)
        .filter((item) => item !== 0)
    const teamsArr = teams
        .toString()
        .split(',')
        .filter((team) => team !== '')
        .map((team) => Number(team))
    const appStatusArr = appStatus
        .toString()
        .split(',')
        .filter((status) => status !== '')
        .map((status) => status)
    const templateTypesArr = templateType
        .toString()
        .split(',')
        .filter((type) => !!type)

    // update master filters data (check/uncheck)
    const filterApplied: AppListAppliedFilters = {
        environments: new Set<number>(environmentsArr),
        teams: new Set<number>(teamsArr),
        appStatus: new Set<string>(appStatusArr),
        clusterVsNamespaceMap: _clusterVsNamespaceMap,
        templateType: new Set<string>(templateTypesArr),
    }

    const sortBy = (params.orderBy as string) || SortBy.APP_NAME
    const sortOrder = (params.sortOrder as string) || OrderBy.ASC
    let offset = +params.offset || 0
    let hOffset = +params.hOffset || 0
    let pageSize: number = +params.pageSize || 20
    const pageSizes = new Set([20, 40, 50])

    if (!pageSizes.has(pageSize)) {
        // handle invalid pageSize
        pageSize = 20
    }
    if (offset % pageSize !== 0) {
        // pageSize must be a multiple of offset
        offset = 0
    }
    if (hOffset % pageSize !== 0) {
        // pageSize must be a multiple of offset
        hOffset = 0
    }

    const payload: AppListPayloadType = {
        environments: environmentsArr,
        teams: teamsArr,
        namespaces: clustersAndNamespaces
            .toString()
            .split(',')
            .filter((item) => item !== ''),
        appNameSearch: search,
        appStatuses: appStatusArr,
        templateType: templateTypesArr,
        sortBy,
        sortOrder,
        offset,
        hOffset,
        size: showExportCsvButton ? appCount : +pageSize,
    }

    return { payload, filterApplied }
}
