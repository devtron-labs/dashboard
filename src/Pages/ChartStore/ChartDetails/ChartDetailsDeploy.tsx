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

import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { APIResponseHandler, useAsync } from '@devtron-labs/devtron-fe-common-lib'

import ChartValuesView from '@Components/v2/values/chartValuesDiff/ChartValuesView'
import { ChartInstalledConfig } from '@Components/v2/values/chartValuesDiff/ChartValuesView.type'

import { fetchChartValuesList } from './services'
import { ChartDetailsDeployProps, ChartDetailsRouteParams } from './types'

export const ChartDetailsDeploy = ({ chartDetails, chartVersions, selectedChartVersion }: ChartDetailsDeployProps) => {
    const { chartId } = useParams<ChartDetailsRouteParams>()

    const [isFetchingChartValuesList, chartValuesList, chartValuesListErr, reloadChartValuesList] = useAsync(
        () => fetchChartValuesList(chartId),
        [chartId],
    )

    const chartValues = useMemo(
        () =>
            (chartValuesList ?? []).find(
                (chartValue) => chartValue.kind === 'DEFAULT' && chartValue.id === selectedChartVersion,
            ),
        [selectedChartVersion, chartValuesList],
    )

    const isChartValuesViewLoading =
        !chartDetails?.chartName || isFetchingChartValuesList || !chartValuesList.length || !chartVersions.length

    return (
        <APIResponseHandler
            isLoading={isChartValuesViewLoading}
            progressingProps={{ size: 24 }}
            error={chartValuesListErr}
            errorScreenManagerProps={{ code: chartValuesListErr?.code, reload: reloadChartValuesList }}
        >
            <ChartValuesView
                isDeployChartView
                installedConfigFromParent={chartDetails as unknown as ChartInstalledConfig}
                chartValuesListFromParent={chartValuesList}
                chartVersionsDataFromParent={chartVersions}
                chartValuesFromParent={chartValues}
                selectedVersionFromParent={selectedChartVersion}
            />
        </APIResponseHandler>
    )
}
