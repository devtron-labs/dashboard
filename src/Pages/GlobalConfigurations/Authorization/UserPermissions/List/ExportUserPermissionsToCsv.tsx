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

import { useState } from 'react'

import { ExportToCsv, ExportToCsvProps, getFormattedUTCTimeForExport } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '../../../../../components/common'
import { useAuthorizationContext } from '../../AuthorizationProvider'
import { getRoleFiltersToExport } from '../../utils'
import { LAST_LOGIN_TIME_NULL_STATE } from '../constants'
import { USER_EXPORT_HEADER_ROW, USER_EXPORT_HEADERS } from './constants'
import ExportConfigurationDialog from './ExportConfigurationDialog'
import { ExportConfigurationDialogProps, ExportUserPermissionCSVDataType, UserPermissionListHeaderProps } from './types'

const getStatusExportText = importComponentFromFELibrary('getStatusExportText', null, 'function')
const getUserExportToCsvConfiguration = importComponentFromFELibrary(
    'getUserExportToCsvConfiguration',
    null,
    'function',
)
const showStatus = !!getStatusExportText

const ExportUserPermissionsToCsv = ({
    disabled,
    getDataToExport,
}: Pick<UserPermissionListHeaderProps, 'disabled' | 'getDataToExport'>) => {
    const { customRoles } = useAuthorizationContext()
    const exportConfiguration: ExportConfigurationDialogProps['exportConfiguration'] = getUserExportToCsvConfiguration
        ? getUserExportToCsvConfiguration()
        : null

    const getInitialSelectedConfig = (): ExportConfigurationDialogProps['selectedConfig'] =>
        exportConfiguration?.options.reduce<ExportConfigurationDialogProps['selectedConfig']>(
            (acc, { value }) => {
                acc[value] = true

                return acc
            },
            {} as ExportConfigurationDialogProps['selectedConfig'],
        ) ?? ({} as ExportConfigurationDialogProps['selectedConfig'])

    const [selectedConfig, setSelectedConfig] = useState(getInitialSelectedConfig)

    /**
     * Returns the list of users which have permission to devtron applications
     */
    const getUsersDataToExport: ExportToCsvProps<keyof ExportUserPermissionCSVDataType>['apiPromise'] = async ({
        signal,
    }) => {
        const { users } = await getDataToExport(selectedConfig, signal)
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

            const updatedOn = getFormattedUTCTimeForExport(_user.updatedOn)

            const _userData: ExportUserPermissionCSVDataType = {
                emailId: _user.emailId,
                userId: _user.id,
                ...(showStatus
                    ? {
                          status: getStatusExportText(_user.userStatus, _user.timeToLive),
                          permissionStatus: '-',
                          createdOn: getFormattedUTCTimeForExport(_user.createdOn),
                          updatedOn,
                          deletedOn: _user.isDeleted ? updatedOn : '-',
                          isDeleted: _user.isDeleted,
                      }
                    : {}),
                lastLoginTime:
                    _user.lastLoginTime === LAST_LOGIN_TIME_NULL_STATE
                        ? _user.lastLoginTime
                        : getFormattedUTCTimeForExport(_user.lastLoginTime),
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

                if (!isRowAdded) {
                    _pushToUserList(_userData)
                }
            }

            return _usersList
        }, [])

        return userList
    }

    const renderConfigurationModal: ExportToCsvProps<
        keyof ExportUserPermissionCSVDataType
    >['modalConfig']['renderCustomModal'] = (proceed) => (
        <ExportConfigurationDialog
            selectedConfig={selectedConfig}
            setSelectedConfig={setSelectedConfig}
            initialConfig={getInitialSelectedConfig()}
            exportConfiguration={exportConfiguration}
            proceed={proceed}
        />
    )

    return (
        <ExportToCsv<keyof ExportUserPermissionCSVDataType>
            disabled={disabled}
            apiPromise={getUsersDataToExport}
            fileName="Devtron Apps Users Data"
            triggerElementConfig={{
                showOnlyIcon: true,
            }}
            headers={USER_EXPORT_HEADERS}
            modalConfig={
                getUserExportToCsvConfiguration
                    ? { renderCustomModal: renderConfigurationModal, hideDialog: false }
                    : null
            }
        />
    )
}

export default ExportUserPermissionsToCsv
