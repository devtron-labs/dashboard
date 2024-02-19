import moment from 'moment'
import { BulkSelectionEvents } from '@devtron-labs/devtron-fe-common-lib'
import { CustomRoleAndMeta, CustomRoles, EntityTypes } from './shared/components/userGroups/userGroups.types'
import { ACCESS_TYPE_MAP, Moment12HourFormat, ZERO_TIME_STRING } from '../../../config'
import { PermissionGroup, User, UserDto } from './types'
import { LAST_LOGIN_TIME_NULL_STATE } from './UserPermissions/constants'
import { useAuthorizationBulkSelection } from './shared/components/BulkSelection'

export const transformUserResponse = (_user: UserDto): User => {
    const { lastLoginTime, timeoutWindowExpression, email_id: emailId, ...user } = _user

    return {
        ...user,
        emailId,
        lastLoginTime:
            lastLoginTime === ZERO_TIME_STRING || !lastLoginTime
                ? LAST_LOGIN_TIME_NULL_STATE
                : moment(lastLoginTime).format(Moment12HourFormat),
        timeToLive:
            timeoutWindowExpression === ZERO_TIME_STRING || !timeoutWindowExpression
                ? ''
                : moment(timeoutWindowExpression).format(Moment12HourFormat),
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
    roleFilters
        .filter((roleFilter) => roleFilter.team && roleFilter.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS)
        .map((roleFilter) => ({
            project: roleFilter.team,
            environment: roleFilter.environment?.split(',').join(', ') || 'All existing + future environments',
            application: roleFilter.entityName?.split(',').join(', ') || 'All existing + future applications',
            role: customRoles.possibleRolesMeta[roleFilter.action]?.value || '-',
        }))

export const handleToggleCheckForBulkSelection =
    ({
        isBulkSelectionApplied,
        handleBulkSelection,
        bulkSelectionState,
    }: Pick<
        ReturnType<typeof useAuthorizationBulkSelection>,
        'isBulkSelectionApplied' | 'bulkSelectionState' | 'handleBulkSelection'
    >) =>
    (id: User['id'] | PermissionGroup['id']) => {
        if (isBulkSelectionApplied) {
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_IDENTIFIERS_AFTER_ACROSS_SELECTION,
                data: {
                    identifierIds: [id],
                },
            })
            return
        }

        handleBulkSelection(
            bulkSelectionState[id]
                ? {
                      action: BulkSelectionEvents.CLEAR_IDENTIFIERS,
                      data: {
                          identifierIds: [id],
                      },
                  }
                : {
                      action: BulkSelectionEvents.SELECT_IDENTIFIER,
                      data: {
                          identifierObject: {
                              ...bulkSelectionState,
                              [id]: true,
                          },
                      },
                  },
        )
    }
