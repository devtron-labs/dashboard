export type DeploymentChartListDTO = Array<{
    id: number
    chartDescription?: string
    isUserUploaded: boolean
    name: string
    version: string
}>

interface DeploymentChartVersionsType {
    id: number
    version: string
    description: string
}

export interface DeploymentChartType {
    name: string
    isUserUploaded: boolean
    versions: DeploymentChartVersionsType[]
}

export enum DEVTRON_DEPLOYMENT_CHART_NAMES {
    JOB_AND_CRONJOB_CHART_NAME = 'Job & CronJob',
    ROLLOUT_DEPLOYMENT = 'Rollout Deployment',
    DEPLOYMENT = 'Deployment',
    STATEFUL_SET = 'StatefulSet',
}
