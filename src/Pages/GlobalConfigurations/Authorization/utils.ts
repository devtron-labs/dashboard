import { CustomRoleAndMeta, CustomRoles, EntityTypes } from './shared/components/userGroups/userGroups.types'
import { ACCESS_TYPE_MAP, ZERO_TIME_STRING } from '../../../config'
import { PermissionGroup, User, UserDto } from './types'

export const transformUserResponse = (_user: UserDto): User => {
    const { lastLoginTime, timeToLive, ...user } = _user

    return {
        ...user,
        lastLoginTime: lastLoginTime === ZERO_TIME_STRING ? '' : lastLoginTime,
        timeToLive: timeToLive === ZERO_TIME_STRING ? '' : timeToLive,
    }
}

export const getMetaPossibleRoles = (customRoles: CustomRoles[], entity: string, accessType?: string) => {
    let possibleRolesMeta = {}
    customRoles.forEach((role) => {
        if (role.entity === entity && (entity !== EntityTypes.DIRECT || role.accessType === accessType)) {
            possibleRolesMeta = {
                ...possibleRolesMeta,
                [role.roleName]: {
                    value: role.roleDisplayName,
                    description: role.roleDescription,
                },
            }
        }
    })
    return possibleRolesMeta
}

/**
 * Provides the role filters for devtron apps
 */
export const getRoleFiltersToExport = (
    roleFilters: User['roleFilters'] | PermissionGroup['roleFilters'],
    customRoles: CustomRoleAndMeta,
) =>
    // TODO (v1): Confirm with Utkarsh regarding the Devtron apps filtering rules
    roleFilters
        .filter((roleFilter) => roleFilter.team && roleFilter.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS)
        .map((roleFilter) => ({
            project: roleFilter.team,
            environment: roleFilter.environment?.split(',').join(', ') || 'All existing + future environments',
            application: roleFilter.entityName?.split(',').join(', ') || 'All existing + future applications',
            role: customRoles.possibleRolesMeta[roleFilter.action]?.value || '-',
        }))
