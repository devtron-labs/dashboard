import { FeatureTitleWithInfo } from '@devtron-labs/devtron-fe-common-lib'

import { DeployableCharts } from '../charts.service'
import { ChartGroupEntry } from '../charts.types'

const renderChartStoreDescriptionContent = () =>
    'The Chart Store offers popular third-party Helm charts for quick deployment. If you don’t find what you need, connect your own chart sources to fetch additional Helm charts.'

export const renderAdditionalChartHeaderInfo = () => (
    <FeatureTitleWithInfo
        title="Chart Store"
        showInfoIconTippy
        docLink="CHART_STORE"
        renderDescriptionContent={renderChartStoreDescriptionContent}
    />
)

export function getDeployableChartsFromConfiguredCharts(charts: ChartGroupEntry[]): DeployableCharts[] {
    return charts
        .filter((chart) => chart.isEnabled)
        .map((chart) => ({
            appName: chart.name.value,
            environmentId: chart.environment.id,
            appStoreVersion: chart.appStoreApplicationVersionId,
            valuesOverrideYaml: chart.valuesYaml,
            referenceValueId: chart.appStoreValuesVersionId || chart.appStoreApplicationVersionId,
            referenceValueKind: chart.kind,
            chartGroupEntryId: chart.installedId,
        }))
}
