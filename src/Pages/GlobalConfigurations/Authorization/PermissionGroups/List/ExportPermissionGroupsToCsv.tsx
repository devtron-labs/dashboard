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

import { ExportToCsv } from '@devtron-labs/devtron-fe-common-lib'

import { useAuthorizationContext } from '../../AuthorizationProvider'
import { getRoleFiltersToExport } from '../../utils'
import { GROUP_EXPORT_HEADER_ROW, GROUP_EXPORT_HEADERS } from './constants'
import { ExportPermissionGroupDataType, PermissionGroupListHeaderProps } from './types'

const ExportPermissionGroupsToCsv = ({
    disabled,
    getDataToExport: exportCsvPromise,
}: Pick<PermissionGroupListHeaderProps, 'disabled' | 'getDataToExport'>) => {
    const { customRoles } = useAuthorizationContext()

    /**
     * Provides the list of permission groups which have access to devtron applications
     */
    const getPermissionGroupDataToExport = async (): Promise<ExportPermissionGroupDataType[]> => {
        const { permissionGroups } = await exportCsvPromise()

        const groupsList = permissionGroups.reduce((_groupsList, _group) => {
            let isRowAdded = false

            const _pushToGroupList = (_groupData) => {
                if (!isRowAdded && _groupsList.length !== 0) {
                    _groupsList.push({})
                    _groupsList.push(GROUP_EXPORT_HEADER_ROW)
                }
                _groupsList.push(_groupData)
                isRowAdded = true
            }

            const _groupData: ExportPermissionGroupDataType = {
                groupName: _group.name,
                groupId: _group.id,
                description: _group.description || '-',
                superAdmin: _group.superAdmin,
                project: '-',
                environment: '-',
                application: '-',
                role: '-',
            }

            if (_group.superAdmin) {
                _pushToGroupList(_groupData)
            } else if (_group.roleFilters?.length) {
                getRoleFiltersToExport(_group.roleFilters, customRoles).forEach((roleFilterToExport) => {
                    const _groupPermissions = {
                        ..._groupData,
                        ...roleFilterToExport,
                    }

                    _pushToGroupList(_groupPermissions)
                })
            }

            return _groupsList
        }, [])

        return groupsList
    }

    return (
        <ExportToCsv<keyof ExportPermissionGroupDataType>
            disabled={disabled}
            apiPromise={getPermissionGroupDataToExport}
            fileName="Devtron Apps Permission Group"
            triggerElementConfig={{
                showOnlyIcon: true,
            }}
            headers={GROUP_EXPORT_HEADERS}
        />
    )
}

export default ExportPermissionGroupsToCsv
