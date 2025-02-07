import { FilterSelectPicker } from '@devtron-labs/devtron-fe-common-lib'
import {
    ExternalLinkFiltersProps,
    ExternalLinkFilters,
    IdentifierOptionType,
    ExternalLinkIdentifierType,
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
