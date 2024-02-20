import { ACCESS_TYPE_MAP, SELECT_ALL_VALUE } from '../../../../../../config'
import { ActionTypes, DirectPermissionsRoleFilter, EntityTypes } from '../userGroups/userGroups.types'

export const ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE = '#'

export const allApplicationsOption = (entity) => ({
    label: entity === EntityTypes.JOB ? 'All Jobs' : 'All applications',
    value: SELECT_ALL_VALUE,
})

export const allEnvironmentsOption = {
    label: 'All environments',
    value: SELECT_ALL_VALUE,
}

// TODO (v4): Remove these once the code is refactored
export const PERMISSION_LABEL_CLASS = 'fw-6 fs-12 cn-7 dc__uppercase mb-0'

export const emptyDirectPermissionDevtronApps: DirectPermissionsRoleFilter = {
    entity: EntityTypes.DIRECT,
    entityName: [],
    environment: [],
    team: null,
    action: {
        label: '',
        value: ActionTypes.VIEW,
    },
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS,
}

export const emptyDirectPermissionHelmApps = {
    ...emptyDirectPermissionDevtronApps,
    accessType: ACCESS_TYPE_MAP.HELM_APPS,
}

export const emptyDirectPermissionJobs: DirectPermissionsRoleFilter = {
    ...emptyDirectPermissionDevtronApps,
    accessType: ACCESS_TYPE_MAP.JOBS,
    workflow: [],
    entity: EntityTypes.JOB,
}
