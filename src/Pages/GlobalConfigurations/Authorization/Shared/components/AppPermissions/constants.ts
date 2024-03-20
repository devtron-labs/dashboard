import { ACCESS_TYPE_MAP, SELECT_ALL_VALUE } from '../../../../../../config'
import { ActionTypes, authorizationSelectStyles, EntityTypes } from '../../../constants'
import { getDefaultStatusAndTimeout } from '../../../libUtils'
import { DirectPermissionsRoleFilter } from '../../../types'

export const ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE = '#'

export const allApplicationsOption = (entity) => ({
    label: entity === EntityTypes.JOB ? 'All Jobs' : 'All applications',
    value: SELECT_ALL_VALUE,
})

export const SELECT_ALL_OPTION = {
    label: 'Select all',
    value: SELECT_ALL_VALUE,
} as const

export const ALL_ENVIRONMENTS_OPTION = {
    label: 'All environments',
    value: SELECT_ALL_VALUE,
} as const

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
    ...getDefaultStatusAndTimeout(),
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

export enum DirectPermissionFieldName {
    apps = 'entityName/apps',
    jobs = 'entityName/jobs',
    environment = 'environment',
    workflow = 'workflow',
    team = 'team',
    status = 'status',
}

export const projectSelectStyles = {
    ...authorizationSelectStyles,
    valueContainer: (base) => ({
        ...authorizationSelectStyles.valueContainer(base),
        display: 'flex',
    }),
}

export const roleSelectStyles = {
    ...authorizationSelectStyles,
    valueContainer: (base) => ({
        ...authorizationSelectStyles.valueContainer(base),
        display: 'flex',
        flexWrap: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    }),
}
