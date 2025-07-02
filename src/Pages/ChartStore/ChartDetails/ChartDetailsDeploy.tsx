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
