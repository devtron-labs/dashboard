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

import { FilterSelectPicker } from '@devtron-labs/devtron-fe-common-lib'

import {
    ExternalLinkFilters,
    ExternalLinkFiltersProps,
    ExternalLinkIdentifierType,
    IdentifierOptionType,
} from './ExternalLinks.type'

export const ExternalLinkFilter = ({
    allApps,
    updateSearchParams,
    isFullMode,
    clusterList,
    clusters,
    apps,
}: ExternalLinkFiltersProps) => {
    const handleUpdateFilters = (filterKey: ExternalLinkFilters) => (selectedOptions: IdentifierOptionType[]) => {
        updateSearchParams({ [filterKey]: selectedOptions.map((option) => String(option.value)) })
    }

    const getFormattedLabel = (filterKey: ExternalLinkFilters, filterValue: string) => {
        if (filterKey === ExternalLinkFilters.APPS) {
            const appValue = filterValue.split('|')
            return `${appValue[1]} (${appValue[2] === ExternalLinkIdentifierType.DevtronApp ? 'Devtron' : 'Helm'})`
        }
        if (filterKey === ExternalLinkFilters.CLUSTERS) {
            return clusterList.find((cluster) => cluster.value === filterValue)?.label
        }
        return ''
    }

    const selectedClusters = clusters.map((cluster) => ({
        label: getFormattedLabel(ExternalLinkFilters.CLUSTERS, cluster),
        value: cluster,
    }))

    const selectedApps = apps.map((app) => ({
        label: getFormattedLabel(ExternalLinkFilters.APPS, app),
        value: app,
    }))

    return (
        <div className="filters-wrapper ml-8 flex dc__gap-16">
            {isFullMode && (
                <FilterSelectPicker
                    placeholder="Application"
                    inputId="app-list-app-status-select"
                    options={allApps}
                    appliedFilterOptions={selectedApps}
                    isDisabled={false}
                    isLoading={false}
                    handleApplyFilter={handleUpdateFilters(ExternalLinkFilters.APPS)}
                />
            )}
            <FilterSelectPicker
                placeholder="Clusters"
                inputId="app-list-app-status-select"
                options={clusterList}
                appliedFilterOptions={selectedClusters}
                isDisabled={false}
                isLoading={false}
                handleApplyFilter={handleUpdateFilters(ExternalLinkFilters.CLUSTERS)}
            />
        </div>
    )
}
