import React from 'react'
import moment from 'moment'
import { Moment12HourExportFormat } from '../../../../../config'

import { UserPermissionListHeaderProps } from './types'
import ExportToCsv from '../../../../../components/common/ExportToCsv/ExportToCsv'
import { FILE_NAMES, USER_EXPORT_HEADER_ROW } from '../../../../../components/common/ExportToCsv/constants'
import { useAuthorizationContext } from '../../AuthorizationProvider'
import { getRoleFiltersToExport } from '../../utils'
import { LAST_LOGIN_TIME_NULL_STATE } from '../constants'
import { importComponentFromFELibrary } from '../../../../../components/common'

const getStatusExportText = importComponentFromFELibrary('getStatusExportText', null, 'function')
const showStatus = !!getStatusExportText

const ExportUserPermissionsToCsv = ({
    disabled,
    getDataToExport,
}: Pick<UserPermissionListHeaderProps, 'disabled' | 'getDataToExport'>) => {
    const { customRoles } = useAuthorizationContext()

    /**
     * Returns the list of users which have permission to devtron applications
     */
    const getUsersDataToExport = async () => {
        const { users } = await getDataToExport()
        const userList = users.reduce((_usersList, _user) => {
            let isRowAdded = false

            const _pushToUserList = (_userData) => {
                if (!isRowAdded && _usersList.length !== 0) {
                    _usersList.push({})
                    _usersList.push(USER_EXPORT_HEADER_ROW)
                }
                _usersList.push(_userData)
                isRowAdded = true
            }

            const _userData = {
                emailId: _user.emailId,
                userId: _user.id,
                ...(showStatus
                    ? {
                          status: getStatusExportText(_user.userStatus, _user.timeToLive),
                      }
                    : {}),
                lastLoginTime:
                    _user.lastLoginTime === LAST_LOGIN_TIME_NULL_STATE
                        ? _user.lastLoginTime
                        : `${moment.utc(_user.lastLoginTime).format(Moment12HourExportFormat)} (UTC)`,
                superAdmin: _user.superAdmin,
                groups: '-',
                project: '-',
                environment: '-',
                application: '-',
                role: '-',
            }

            if (_user.superAdmin) {
                _pushToUserList(_userData)
            } else {
                if (_user.groups?.length) {
                    _userData.groups = _user.groups.join(', ')
                    _pushToUserList(_userData)
                }

                if (_user.roleFilters?.length) {
                    getRoleFiltersToExport(_user.roleFilters, customRoles).forEach((roleFilterToExport) => {
                        const _userPermissions = {
                            ..._userData,
                            groups: '-',
                            ...roleFilterToExport,
                        }

                        _pushToUserList(_userPermissions)
                    })
                }
            }

            return _usersList
        }, [])

        return userList
    }

    return (
        <ExportToCsv disabled={disabled} apiPromise={getUsersDataToExport} fileName={FILE_NAMES.Users} showOnlyIcon />
    )
}

export default ExportUserPermissionsToCsv
