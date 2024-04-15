import { BaseFilterQueryParams, UseUrlFiltersReturnType } from '@devtron-labs/devtron-fe-common-lib'
import { WorkflowType } from '../../../components/app/details/triggerView/types'
import { StatusConstants } from '../../../components/app/list-new/Constants'
import { DEPLOYMENT_STATUS, TriggerType } from '../../../config'
import { SortableKeys } from './constants'

export interface LinkedCIDetailModalProps {
    workflows: WorkflowType[]
    handleClose: () => void
}

export interface LinkedCIAppDto {
    appId: number
    appName: string
    deploymentStatus:
        | (typeof DEPLOYMENT_STATUS)[keyof typeof DEPLOYMENT_STATUS]
        | typeof StatusConstants.NOT_DEPLOYED.titleCase
    environmentId: number
    environmentName: string
    triggerMode: (typeof TriggerType)[keyof typeof TriggerType]
}

// Another interface to create segregation from LinkedCIAppDto
export interface LinkedCIApp extends LinkedCIAppDto {}

export type LinkedCIAppListFilterParams = BaseFilterQueryParams<SortableKeys> & {
    environment: string
}

export type CIPpelineEnviromentList = string[]

export interface LinkedCIAppListProps {
    appList: LinkedCIApp[]
    totalCount: number
    isLoading: boolean
    urlFilters: UseUrlFiltersReturnType<SortableKeys>
}

export interface LinkedCIAppUrlProps {
    appId: number
    environmentId: number
}
