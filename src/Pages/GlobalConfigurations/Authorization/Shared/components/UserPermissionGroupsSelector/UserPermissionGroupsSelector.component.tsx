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

import { useEffect } from 'react'
import {
    useAsync,
    UserRoleGroupsTable,
    UserStatus,
    UserRoleGroup,
    SelectPicker,
    SelectPickerOptionType,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'
import { PermissionGroup, User } from '../../../types'
import { importComponentFromFELibrary, mapByKey } from '../../../../../../components/common'
import { getPermissionGroupList } from '../../../authorization.service'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { getDefaultStatusAndTimeout } from '../../../libUtils'

const StatusHeaderCell = importComponentFromFELibrary('StatusHeaderCell', null, 'function')
const UserStatusUpdate = importComponentFromFELibrary('UserStatusUpdate', null, 'function')

const UserPermissionGroupsSelector = () => {
    const { userRoleGroups, setUserRoleGroups, data: userData, userStatus, showStatus } = usePermissionConfiguration()
    const [isLoading, result, error, reloadGroupList] = useAsync(() =>
        getPermissionGroupList({
            showAll: true,
        }),
    )

    function populateDataFromAPI(data: User) {
        const { userRoleGroups: userRoleGroupsFromAPI } = data
        setUserRoleGroups(userRoleGroupsFromAPI)
    }

    useEffect(() => {
        if (userData) {
            // Casting as if showUserPermissionGroupSelector is true than type for data is User
            populateDataFromAPI(userData as User)
        }
    }, [userData])

    const { permissionGroups: userGroupsList = [] } = result ?? {}

    const userGroupsMap = mapByKey<Map<PermissionGroup['name'], PermissionGroup>>(userGroupsList, 'name')

    const groupOptions: SelectPickerOptionType[] = userGroupsList?.map((group) => ({
        value: group.name,
        label: group.name,
        description: group.description,
    }))
    const selectedValue = userRoleGroups.map((userGroup) => ({ value: userGroup.name, label: userGroup.name }))

    const handleChange = (selectedOptions: SelectPickerOptionType[]) => {
        const alreadyAddedGroupsMap = mapByKey(userRoleGroups, 'name')
        const selectedOptionsMap = mapByKey(selectedOptions, 'value')

        const filteredOptions: User['userRoleGroups'] = selectedOptions
            .filter((selectedOption) => !alreadyAddedGroupsMap.has(selectedOption.value))
            .map((selectedOption) => {
                const { id, name, description } = userGroupsMap.get(selectedOption.value as string)

                return {
                    id,
                    name,
                    description,
                    ...getDefaultStatusAndTimeout(),
                }
            })

        // Remove any group that was deselected
        setUserRoleGroups([
            ...userRoleGroups.filter((userGroup) => selectedOptionsMap.has(userGroup.name)),
            ...filteredOptions,
        ])
    }

    const handleDelete = (id) => {
        setUserRoleGroups(userRoleGroups.filter((group) => group.id !== id))
    }

    const handleStatusUpdate = (
        id: UserRoleGroup['id'],
        status: UserRoleGroup['status'],
        timeToLive: UserRoleGroup['timeToLive'],
    ) => {
        setUserRoleGroups(
            userRoleGroups.map((userGroup) => ({
                ...userGroup,
                ...(userGroup.id === id
                    ? {
                          status,
                          timeToLive,
                      }
                    : {}),
            })),
        )
    }

    return (
        <div className="flexbox-col dc__gap-8">
            <SelectPicker
                inputId="permission-groups-dropdown"
                label="Permission Groups"
                placeholder="Select permission groups"
                value={selectedValue}
                optionListError={error}
                reloadOptionList={reloadGroupList}
                isMulti
                name="groups"
                options={groupOptions}
                onChange={handleChange}
                controlShouldRenderValue={false}
                isLoading={isLoading}
                isDisabled={isLoading}
                showSelectedOptionsCount
                size={ComponentSizeType.large}
            />
            {userRoleGroups.length > 0 && (
                <UserRoleGroupsTable
                    roleGroups={userRoleGroups}
                    showStatus={showStatus}
                    handleDelete={handleDelete}
                    statusComponent={UserStatusUpdate}
                    statusHeaderComponent={StatusHeaderCell}
                    handleStatusUpdate={handleStatusUpdate}
                    disableStatusComponent={userStatus === UserStatus.inactive}
                />
            )}
        </div>
    )
}

export default UserPermissionGroupsSelector
