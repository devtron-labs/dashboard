/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
                          permissionStatus: '-',
                      }
                    : {}),
                lastLoginTime:
                    _user.lastLoginTime === LAST_LOGIN_TIME_NULL_STATE
                        ? _user.lastLoginTime
                        : `${moment.utc(_user.lastLoginTime).format(Moment12HourExportFormat)} (UTC)`,
                superAdmin: _user.superAdmin,
                group: '-',
                project: '-',
                environment: '-',
                application: '-',
                role: '-',
            }

            if (_user.superAdmin) {
                _pushToUserList(_userData)
            } else {
                if (_user.userRoleGroups?.length) {
                    _user.userRoleGroups.forEach((userRoleGroup) => {
                        const _userPermissions = {
                            ..._userData,
                            group: userRoleGroup.name,
                            ...(showStatus
                                ? {
                                      permissionStatus: getStatusExportText(
                                          userRoleGroup.status,
                                          userRoleGroup.timeToLive,
                                      ),
                                  }
                                : {}),
                        }
                        _pushToUserList(_userPermissions)
                    })
                }

                if (_user.roleFilters?.length) {
                    getRoleFiltersToExport(_user.roleFilters, customRoles, { showStatus }).forEach(
                        (roleFilterToExport) => {
                            const _userPermissions = {
                                ..._userData,
                                group: '-',
                                ...roleFilterToExport,
                            }

                            _pushToUserList(_userPermissions)
                        },
                    )
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
