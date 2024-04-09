import { ServerError } from '@devtron-labs/devtron-fe-common-lib'
import { JobList } from '../../../../../../components/Jobs/Types'
import { ACCESS_TYPE_MAP } from '../../../../../../config'
import { DirectPermissionsRoleFilter } from '../../../types'

type AppsList = Map<number, { loading: boolean; result: { id: number; name: string }[]; error: ServerError }>
type JobsList = Map<number, { loading: boolean; result: JobList['result']['jobContainers']; error: ServerError }>

export interface AppPermissionsDetailType {
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS | ACCESS_TYPE_MAP.JOBS
    handleDirectPermissionChange: (...rest) => void
    removeDirectPermissionRow: (index: number) => void
    addNewPermissionRow: (
        accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS | ACCESS_TYPE_MAP.JOBS,
    ) => void
    appsListHelmApps: AppsList
    jobsList: JobsList
    appsList: AppsList
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getEnvironmentOptions: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projectsList: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    environmentClusterOptions: any
    getListForAccessType: (accessType: ACCESS_TYPE_MAP) => AppsList | JobsList
}

export interface DirectPermissionRow
    extends Pick<
        AppPermissionsDetailType,
        | 'appsList'
        | 'jobsList'
        | 'appsListHelmApps'
        | 'projectsList'
        | 'getEnvironmentOptions'
        | 'environmentClusterOptions'
        | 'getListForAccessType'
    > {
    permission: DirectPermissionsRoleFilter
    handleDirectPermissionChange: (...rest) => void
    index: number
    removeRow: (index: number) => void
}
