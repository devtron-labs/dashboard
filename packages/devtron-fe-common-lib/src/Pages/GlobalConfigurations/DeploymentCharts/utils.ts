import { versionComparatorBySortOrder } from '@Shared/Helpers'
import { DeploymentChartListDTO, DeploymentChartType, DEVTRON_DEPLOYMENT_CHART_NAMES } from './types'
import fallbackGuiSchema from './basicViewSchema.json'

export const convertDeploymentChartListToChartType = (data: DeploymentChartListDTO): DeploymentChartType[] => {
    if (!data) {
        return []
    }
    const chartMap = data.reduce(
        (acc, { id, version, chartDescription: description = '', name, isUserUploaded = true }) => {
            if (!name || !id || !version) {
                return acc
            }
            const detail = acc[name]
            if (detail) {
                detail.versions.push({
                    id,
                    version,
                    description,
                })
            } else {
                acc[name] = {
                    name,
                    isUserUploaded,
                    versions: [{ id, version, description }],
                }
            }
            return acc
        },
        {} as Record<string, DeploymentChartType>,
    )
    const result = Object.values(chartMap).map((element) => {
        element.versions.sort((a, b) => versionComparatorBySortOrder(a.version, b.version))
        return element
    })
    return result
}

export const getGuiSchemaFromChartName = (chartName: string) => {
    switch (chartName) {
        case DEVTRON_DEPLOYMENT_CHART_NAMES.JOB_AND_CRONJOB_CHART_NAME:
        case DEVTRON_DEPLOYMENT_CHART_NAMES.DEPLOYMENT:
        case DEVTRON_DEPLOYMENT_CHART_NAMES.ROLLOUT_DEPLOYMENT:
        case DEVTRON_DEPLOYMENT_CHART_NAMES.STATEFUL_SET:
            return fallbackGuiSchema
        default:
            return {}
    }
}
