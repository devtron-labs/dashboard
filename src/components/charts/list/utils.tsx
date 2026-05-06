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

import { DeployableCharts } from '../charts.service'
import { ChartGroupEntry } from '../charts.types'

export const CHART_STORE_TIPPY_CONTENT =
    'The Chart Store offers popular third-party Helm charts for quick deployment. If you don’t find what you need, connect your own chart sources to fetch additional Helm charts.'

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
