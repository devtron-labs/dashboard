import React from 'react'

import { PermissionGroupListHeaderProps } from './types'
import ExportToCsv from '../../../../../components/common/ExportToCsv/ExportToCsv'
import { FILE_NAMES, GROUP_EXPORT_HEADER_ROW } from '../../../../../components/common/ExportToCsv/constants'
import { useAuthorizationContext } from '../../AuthorizationProvider'
import { getRoleFiltersToExport } from '../../utils'

const ExportPermissionGroupsToCsv = ({
    disabled,
    getDataToExport: exportCsvPromise,
}: Pick<PermissionGroupListHeaderProps, 'disabled' | 'getDataToExport'>) => {
    const { customRoles } = useAuthorizationContext()

    /**
     * Provides the list of permission groups which have access to devtron applications
     */
    const getPermissionGroupDataToExport = async () => {
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

            const _groupData = {
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
        <ExportToCsv
            disabled={disabled}
            apiPromise={getPermissionGroupDataToExport}
            fileName={FILE_NAMES.Groups}
            showOnlyIcon
        />
    )
}

export default ExportPermissionGroupsToCsv
